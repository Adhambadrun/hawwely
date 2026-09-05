/**
 * Domain types shared across the app (server + client).
 * They mirror the Supabase schema in supabase/migrations/0001_schema.sql.
 */

export type PayoutMethod = 'bank_transfer' | 'cash_pickup' | 'mobile_wallet' | 'instapay';
export type SendMethod = 'bank_transfer' | 'debit_card' | 'credit_card' | 'apple_pay' | 'cash';
export type TransferSpeed = 'minutes' | 'hours' | 'same_day' | '1-2 days' | '2-3 days' | '3-5 days';
export type SendCurrency = 'SAR' | 'AED' | 'KWD' | 'USD' | 'EUR' | 'GBP' | 'QAR' | 'JOD' | 'CAD' | 'AUD';
export type CorridorCode = `${SendCurrency}-EGP`;

export interface Service {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  logo_url: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  affiliate_id: string | null;
  description: string | null;
  description_ar: string | null;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  is_featured: boolean;
  founded_year: number | null;
  headquarters: string | null;
  headquarters_ar?: string | null;
  license_info: string | null;
  license_info_ar?: string | null;
  payout_methods: PayoutMethod[];
  send_methods: SendMethod[];
  supported_corridors: CorridorCode[];
  min_rating_to_show: number;
  priority_order: number;
  pros?: string[];
  pros_ar?: string[];
  cons?: string[];
  cons_ar?: string[];
  brand_color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Corridor {
  id: string;
  send_currency: SendCurrency;
  receive_currency: 'EGP';
  send_country: string;
  send_country_ar: string;
  send_country_code: string;
  receive_country: string;
  receive_country_ar: string;
  receive_country_code: string;
  flag_emoji: string;
  is_active: boolean;
  popularity_rank: number;
  monthly_search_volume: number;
  seo_title: string | null;
  seo_title_ar: string | null;
  seo_description: string | null;
  seo_description_ar: string | null;
  currency_name?: string;
  currency_name_ar?: string;
  currency_symbol?: string;
  created_at?: string;
}

export interface Rate {
  id: string;
  service_id: string;
  corridor_id: string;
  exchange_rate: number;
  mid_market_rate: number;
  markup_percent: number;
  fixed_fee: number;
  fee_currency: string;
  percent_fee: number; // percentage value, e.g. 0.65 means 0.65%
  min_send_amount: number | null;
  max_send_amount: number | null;
  transfer_speed: TransferSpeed;
  transfer_speed_minutes: number;
  payout_method: PayoutMethod;
  promo_active: boolean;
  promo_text: string | null;
  promo_text_ar: string | null;
  last_verified_at: string;
  verified_by: 'system' | 'user' | 'admin';
  source: 'api' | 'scrape' | 'manual' | 'user_report';
  is_active: boolean;
}

export interface RateWithService extends Rate {
  service: Service;
}

export interface RateHistoryPoint {
  recorded_at: string;
  exchange_rate: number;
  mid_market_rate: number;
  service_id?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  country_code: string | null;
  preferred_corridor: CorridorCode | null;
  preferred_language: 'ar' | 'en';
  notification_whatsapp: boolean;
  notification_email: boolean;
  notification_telegram: boolean;
  whatsapp_number: string | null;
  telegram_chat_id: string | null;
  total_savings_reported: number;
  referral_code: string | null;
  reputation_points: number;
  is_reporter: boolean;
}

export type AlertDirection = 'above' | 'below';
export type NotifyChannel = 'email' | 'whatsapp' | 'telegram';

export interface RateAlert {
  id: string;
  user_id: string;
  corridor_id: string;
  target_rate: number;
  direction: AlertDirection;
  notify_via: NotifyChannel[];
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
  corridor?: Pick<Corridor, 'send_currency' | 'flag_emoji' | 'send_country' | 'send_country_ar'>;
}

export interface Review {
  id: string;
  user_id: string | null;
  service_id: string;
  corridor_id: string | null;
  rating: number;
  title: string | null;
  title_ar: string | null;
  body: string | null;
  body_ar: string | null;
  amount_sent: number | null;
  amount_received: number | null;
  send_currency: string | null;
  receive_currency: string | null;
  reported_rate: number | null;
  transfer_speed_actual: string | null;
  would_recommend: boolean | null;
  is_verified: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  author_name?: string | null;
  service?: Pick<Service, 'name' | 'name_ar' | 'slug' | 'logo_url'>;
  corridor?: Pick<Corridor, 'send_currency' | 'flag_emoji'>;
}

export interface UserReport {
  id: string;
  user_id: string | null;
  service_id: string;
  corridor_id: string;
  reported_rate: number;
  amount_sent: number | null;
  amount_received: number | null;
  fee_charged: number | null;
  screenshot_url: string | null;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export type BlogCategory = 'guide' | 'comparison' | 'news' | 'tips';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  title_ar: string | null;
  excerpt: string | null;
  excerpt_ar: string | null;
  content: string;
  content_ar: string | null;
  featured_image: string | null;
  category: BlogCategory;
  tags: string[];
  author_name: string | null;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  views: number;
  reading_minutes?: number;
}

export interface Faq {
  id: string;
  question: string;
  question_ar: string;
  answer: string;
  answer_ar: string;
  category: 'general' | 'rates' | 'services' | 'security';
  corridor_id: string | null;
  service_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  country_code: string | null;
  preferred_corridor: string | null;
}

export interface AffiliateClick {
  service_id: string;
  corridor_id: string | null;
  user_id: string | null;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  amount_compared: number | null;
}

export interface Testimonial {
  id: string;
  name: string;
  name_ar: string;
  location: string;
  location_ar: string;
  rating: number;
  text: string;
  text_ar: string;
  savings_egp: number;
  avatar_color: string;
}

/* ---------- Comparison API response shape ---------- */

export interface ComparisonServiceSummary {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  logo_url: string | null;
  rating: number;
  review_count: number;
  brand_color?: string;
  website_url: string | null;
}

export interface ComparisonResultItem {
  service: ComparisonServiceSummary;
  corridor_id: string;
  exchange_rate: number;
  fixed_fee: number;
  fee_currency: string;
  percent_fee: number;
  total_fee: number;
  amount_sent: number;
  amount_after_fee: number;
  amount_received: number;
  mid_market_received: number;
  savings_vs_worst: number;
  loss_vs_mid_market: number;
  visible_fee_egp: number;
  hidden_fee_egp: number;
  markup_percent: number;
  total_cost_percent: number;
  transfer_speed: TransferSpeed;
  transfer_speed_minutes: number;
  payout_methods: PayoutMethod[];
  affiliate_url: string | null;
  promo: { text: string; text_ar: string } | null;
  last_verified_at: string;
  rank: number;
  is_cheapest: boolean;
  is_fastest: boolean;
  is_best_rated: boolean;
}

export interface ComparisonResponse {
  query: {
    from: SendCurrency;
    to: 'EGP';
    amount: number;
    timestamp: string;
  };
  corridor: {
    id: string;
    code: CorridorCode;
    flag_emoji: string;
    send_country: string;
    send_country_ar: string;
  };
  mid_market_rate: number;
  results: ComparisonResultItem[];
  skipped: {
    service_slug: string;
    service_name: string;
    service_name_ar: string;
    reason: 'below_min' | 'above_max' | 'fee_exceeds_amount';
    min_amount: number | null;
    max_amount: number | null;
  }[];
  summary: {
    cheapest_service: string | null;
    fastest_service: string | null;
    best_rated_service: string | null;
    max_savings: number;
    max_savings_currency: 'EGP';
    worst_service: string | null;
    services_compared: number;
    last_updated: string;
    source: 'live' | 'demo';
  };
}
