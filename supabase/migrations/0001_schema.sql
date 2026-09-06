-- ============================================================================
-- HAWWELY (حوّلي) — Supabase schema
-- 12 core tables + contact_messages, indexes, RLS policies, helper functions.
-- Apply with:  supabase db push   (or paste into the SQL editor)
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ----------------------------------------------------------------------------
-- 1. services
-- ----------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text not null,
  slug text unique not null,
  logo_url text,
  website_url text,
  affiliate_url text,
  affiliate_id text,
  description text,
  description_ar text,
  rating numeric(2,1) default 0 check (rating >= 0 and rating <= 5),
  total_reviews integer default 0,
  is_active boolean default true,
  is_featured boolean default false,
  founded_year integer,
  headquarters text,
  headquarters_ar text,
  license_info text,
  license_info_ar text,
  payout_methods text[] default '{}',
  send_methods text[] default '{}',
  supported_corridors text[] default '{}',
  min_rating_to_show numeric(2,1) default 0,
  priority_order integer default 100,
  pros text[] default '{}',
  pros_ar text[] default '{}',
  cons text[] default '{}',
  cons_ar text[] default '{}',
  brand_color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists services_active_idx on public.services (is_active, priority_order);
create index if not exists services_corridors_idx on public.services using gin (supported_corridors);
drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at before update on public.services for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. corridors
-- ----------------------------------------------------------------------------
create table if not exists public.corridors (
  id uuid primary key default gen_random_uuid(),
  send_currency text not null,
  receive_currency text not null default 'EGP',
  send_country text not null,
  send_country_ar text not null,
  send_country_code text not null,
  receive_country text default 'Egypt',
  receive_country_ar text default 'مصر',
  receive_country_code text default 'EG',
  flag_emoji text,
  is_active boolean default true,
  popularity_rank integer default 100,
  monthly_search_volume integer default 0,
  seo_title text,
  seo_title_ar text,
  seo_description text,
  seo_description_ar text,
  currency_name text,
  currency_name_ar text,
  currency_symbol text,
  created_at timestamptz default now(),
  unique (send_currency, receive_currency)
);
create index if not exists corridors_active_idx on public.corridors (is_active, popularity_rank);

-- ----------------------------------------------------------------------------
-- 3. rates  (current snapshot: one row per service × corridor)
-- ----------------------------------------------------------------------------
create table if not exists public.rates (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  corridor_id uuid not null references public.corridors (id) on delete cascade,
  exchange_rate numeric(12,6) not null,
  mid_market_rate numeric(12,6) not null,
  markup_percent numeric(6,3) default 0,
  fixed_fee numeric(12,2) default 0,
  fee_currency text default 'USD',
  percent_fee numeric(6,3) default 0,
  min_send_amount numeric(12,2),
  max_send_amount numeric(12,2),
  transfer_speed text,               -- minutes | hours | same_day | 1-2 days | 2-3 days | 3-5 days
  transfer_speed_minutes integer,
  payout_method text,                -- bank_transfer | cash_pickup | mobile_wallet | instapay
  promo_active boolean default false,
  promo_text text,
  promo_text_ar text,
  last_verified_at timestamptz default now(),
  verified_by text default 'system', -- system | user | admin
  source text default 'manual',      -- api | scrape | manual | user_report
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (service_id, corridor_id)
);
create index if not exists rates_corridor_idx on public.rates (corridor_id, is_active);
create index if not exists rates_service_idx on public.rates (service_id);
create index if not exists rates_verified_idx on public.rates (last_verified_at desc);
drop trigger if exists rates_updated_at on public.rates;
create trigger rates_updated_at before update on public.rates for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. rate_history  (append-only time series for charts)
-- ----------------------------------------------------------------------------
create table if not exists public.rate_history (
  id bigint generated always as identity primary key,
  service_id uuid not null references public.services (id) on delete cascade,
  corridor_id uuid not null references public.corridors (id) on delete cascade,
  exchange_rate numeric(12,6) not null,
  mid_market_rate numeric(12,6) not null,
  recorded_at timestamptz not null default now()
);
create index if not exists rate_history_lookup_idx on public.rate_history (corridor_id, service_id, recorded_at desc);
create index if not exists rate_history_recorded_idx on public.rate_history (recorded_at desc);

-- ----------------------------------------------------------------------------
-- 5. profiles  (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  country_code text,
  preferred_corridor text,
  preferred_language text default 'ar',
  notification_whatsapp boolean default false,
  notification_email boolean default true,
  notification_telegram boolean default false,
  whatsapp_number text,
  telegram_chat_id text,
  total_savings_reported numeric(14,2) default 0,
  referral_code text unique,
  reputation_points integer default 0,
  is_reporter boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- Auto-create a profile row when a user signs up (magic link).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, preferred_language, referral_code)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'ar'),
    upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8))
  )
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 6. rate_alerts
-- ----------------------------------------------------------------------------
create table if not exists public.rate_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  corridor_id uuid not null references public.corridors (id) on delete cascade,
  target_rate numeric(12,6) not null check (target_rate > 0),
  direction text not null default 'above' check (direction in ('above', 'below')),
  notify_via text[] not null default '{email}',
  is_active boolean default true,
  triggered_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists rate_alerts_user_idx on public.rate_alerts (user_id, created_at desc);
create index if not exists rate_alerts_active_idx on public.rate_alerts (is_active, corridor_id) where is_active;

-- ----------------------------------------------------------------------------
-- 7. reviews
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  service_id uuid not null references public.services (id) on delete cascade,
  corridor_id uuid references public.corridors (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  title_ar text,
  body text,
  body_ar text,
  amount_sent numeric(12,2),
  amount_received numeric(14,2),
  send_currency text,
  receive_currency text default 'EGP',
  reported_rate numeric(12,6),
  transfer_speed_actual text,
  would_recommend boolean,
  author_name text,
  is_verified boolean default false,
  is_approved boolean default false,
  helpful_count integer default 0,
  created_at timestamptz default now()
);
create index if not exists reviews_service_idx on public.reviews (service_id, is_approved, created_at desc);
create index if not exists reviews_corridor_idx on public.reviews (corridor_id) where corridor_id is not null;

-- Keep services.rating / total_reviews in sync with approved reviews.
create or replace function public.refresh_service_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  sid uuid := coalesce(new.service_id, old.service_id);
begin
  update public.services s
     set rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where service_id = sid and is_approved), 0),
         total_reviews = (select count(*) from public.reviews where service_id = sid and is_approved)
   where s.id = sid;
  return null;
end $$;
drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_service_rating();

-- ----------------------------------------------------------------------------
-- 8. user_reports  (crowd-sourced rate reports)
-- ----------------------------------------------------------------------------
create table if not exists public.user_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  service_id uuid not null references public.services (id) on delete cascade,
  corridor_id uuid not null references public.corridors (id) on delete cascade,
  reported_rate numeric(12,6) not null,
  amount_sent numeric(12,2),
  amount_received numeric(14,2),
  fee_charged numeric(12,2),
  screenshot_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  ip_address text,
  created_at timestamptz default now()
);
create index if not exists user_reports_status_idx on public.user_reports (status, created_at desc);

-- ----------------------------------------------------------------------------
-- 9. blog_posts
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_ar text,
  excerpt text,
  excerpt_ar text,
  content text not null,
  content_ar text,
  featured_image text,
  category text default 'guide' check (category in ('guide', 'comparison', 'news', 'tips')),
  tags text[] default '{}',
  author_name text,
  is_published boolean default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  views integer default 0,
  reading_minutes integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists blog_posts_published_idx on public.blog_posts (is_published, published_at desc);
create index if not exists blog_posts_search_idx on public.blog_posts using gin ((coalesce(title, '') || ' ' || coalesce(title_ar, '')) gin_trgm_ops);
drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at before update on public.blog_posts for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 10. subscribers
-- ----------------------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  country_code text,
  preferred_corridor text,
  is_active boolean default true,
  unsubscribe_token text unique default encode(gen_random_bytes(16), 'hex'),
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

-- ----------------------------------------------------------------------------
-- 11. affiliate_clicks
-- ----------------------------------------------------------------------------
create table if not exists public.affiliate_clicks (
  id bigint generated always as identity primary key,
  service_id uuid not null references public.services (id) on delete cascade,
  corridor_id uuid references public.corridors (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  session_id text,
  ip_address text,
  user_agent text,
  referrer text,
  amount_compared numeric(12,2),
  clicked_at timestamptz default now()
);
create index if not exists affiliate_clicks_service_idx on public.affiliate_clicks (service_id, clicked_at desc);
create index if not exists affiliate_clicks_day_idx on public.affiliate_clicks (clicked_at desc);

-- ----------------------------------------------------------------------------
-- 12. faqs
-- ----------------------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  question_ar text not null,
  answer text not null,
  answer_ar text not null,
  category text default 'general' check (category in ('general', 'rates', 'services', 'security')),
  corridor_id uuid references public.corridors (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  sort_order integer default 100,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists faqs_active_idx on public.faqs (is_active, sort_order);

-- ----------------------------------------------------------------------------
-- 13. contact_messages  (contact form inbox)
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  ip_address text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- RPC: reputation points for contributors (called with the service role)
-- ----------------------------------------------------------------------------
create or replace function public.increment_reputation(p_user_id uuid, p_points integer)
returns void language sql security definer set search_path = public as $$
  update public.profiles
     set reputation_points = reputation_points + p_points,
         is_reporter = true
   where id = p_user_id;
$$;

-- RPC: increment blog views without exposing UPDATE to anon
create or replace function public.increment_post_views(p_slug text)
returns void language sql security definer set search_path = public as $$
  update public.blog_posts set views = views + 1 where slug = p_slug and is_published;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.services enable row level security;
alter table public.corridors enable row level security;
alter table public.rates enable row level security;
alter table public.rate_history enable row level security;
alter table public.profiles enable row level security;
alter table public.rate_alerts enable row level security;
alter table public.reviews enable row level security;
alter table public.user_reports enable row level security;
alter table public.blog_posts enable row level security;
alter table public.subscribers enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.faqs enable row level security;
alter table public.contact_messages enable row level security;

-- Public catalogue: readable by everyone (anon + authenticated)
drop policy if exists "services are public" on public.services;
create policy "services are public" on public.services for select using (is_active);

drop policy if exists "corridors are public" on public.corridors;
create policy "corridors are public" on public.corridors for select using (is_active);

drop policy if exists "rates are public" on public.rates;
create policy "rates are public" on public.rates for select using (is_active);

drop policy if exists "rate history is public" on public.rate_history;
create policy "rate history is public" on public.rate_history for select using (true);

drop policy if exists "published posts are public" on public.blog_posts;
create policy "published posts are public" on public.blog_posts for select using (is_published);

drop policy if exists "faqs are public" on public.faqs;
create policy "faqs are public" on public.faqs for select using (is_active);

drop policy if exists "approved reviews are public" on public.reviews;
create policy "approved reviews are public" on public.reviews for select using (is_approved or auth.uid() = user_id);

-- Profiles: owner only
drop policy if exists "profile owner read" on public.profiles;
create policy "profile owner read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profile owner update" on public.profiles;
create policy "profile owner update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Alerts: owner full access
drop policy if exists "alerts owner select" on public.rate_alerts;
create policy "alerts owner select" on public.rate_alerts for select using (auth.uid() = user_id);
drop policy if exists "alerts owner insert" on public.rate_alerts;
create policy "alerts owner insert" on public.rate_alerts for insert with check (auth.uid() = user_id);
drop policy if exists "alerts owner update" on public.rate_alerts;
create policy "alerts owner update" on public.rate_alerts for update using (auth.uid() = user_id);
drop policy if exists "alerts owner delete" on public.rate_alerts;
create policy "alerts owner delete" on public.rate_alerts for delete using (auth.uid() = user_id);

-- Reviews / reports: authenticated users may insert their own rows
-- (the API also accepts anonymous submissions via the service role, which bypasses RLS)
drop policy if exists "reviews owner insert" on public.reviews;
create policy "reviews owner insert" on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "reports owner insert" on public.user_reports;
create policy "reports owner insert" on public.user_reports for insert with check (auth.uid() = user_id);
drop policy if exists "reports owner select" on public.user_reports;
create policy "reports owner select" on public.user_reports for select using (auth.uid() = user_id);

-- subscribers, affiliate_clicks, contact_messages: written only via the service role (no anon policies).

-- ----------------------------------------------------------------------------
-- Realtime (optional): broadcast rate updates to connected clients
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.rates;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
