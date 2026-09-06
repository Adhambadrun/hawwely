<p align="center">
  <img src="public/logo.svg" alt="Hawwely" width="220" />
</p>

<h1 align="center">HAWWELY (حوّلي) — Send More. Pay Less.</h1>

<p align="center">
  The "Skyscanner for Egyptian remittances": compare exchange rates and fees of 12 money-transfer
  services from the Gulf, Europe and the US to Egypt — in Arabic (RTL, Egyptian dialect) first, English second.
</p>

---

## What's inside

| Area | Stack |
| --- | --- |
| Framework | **Next.js 14 (App Router)**, TypeScript `strict`, React 18 |
| Styling | Tailwind CSS + design tokens (`#00C853` primary, `#1B2A4A` navy, `#FFD700` gold), self-hosted **Cairo** (Arabic) & **Inter** (Latin) |
| i18n | `next-intl` — Arabic at `/`, English under `/en` (`as-needed` prefix), full RTL |
| Data | **Supabase** (Postgres + Auth magic links + RLS). Runs in **demo mode** with bundled seed data when no DB is configured |
| State / forms | Zustand (persisted), React Hook Form + Zod (Arabic validation messages), Axios |
| Charts / icons | Recharts, Lucide |
| PWA | `@ducanh2912/next-pwa` (service worker in production builds), web manifest, offline banner |
| SEO | Metadata API, JSON-LD (Organization, WebSite + SearchAction, FAQPage, Article, BreadcrumbList, Product/Service), dynamic `sitemap.xml`, `robots.txt`, hreflang, OG/Twitter |
| Analytics | Vercel Analytics + optional Umami |
| Deploy | Vercel (`vercel.json` includes the two cron jobs) |

## Quick start

```bash
git clone https://github.com/Adhambadrun/hawwely.git
cd hawwely
npm install
cp .env.example .env.local     # optional – the site works without any keys (demo mode)
npm run dev                    # http://localhost:3000
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev server / production build / serve |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (`next/core-web-vitals`) |
| `npm test` | Vitest unit tests (rate-calculation engine, helpers) |
| `npm run seed:sql` | Regenerate `supabase/seed.sql` from `lib/data/*` |
| `npm run assets` | Regenerate icons, OG image and placeholder service logos in `public/` |

## Environment variables

Copy `.env.example` → `.env.local`. Everything is optional; missing variables degrade gracefully.

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public reads + Auth (magic link). Without them the app serves bundled seed data ("demo" source). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only writes: clicks, reviews, reports, subscribers, contact, cron jobs. Never exposed to the browser. |
| `EXCHANGE_RATE_API_KEY`, `FREE_CURRENCY_API_KEY`, `OPEN_EXCHANGE_RATES_KEY` | Mid-market rate providers (tried in order, then `open.er-api.com` free tier, then a baseline fallback). |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_URL` | Umami analytics script. |
| `WISE_AFFILIATE_ID`, `REMITLY_AFFILIATE_ID`, `PAYSEND_AFFILIATE_ID`, `WORLDREMIT_AFFILIATE_ID` | Substituted into service affiliate URL templates (`{WISE_AFFILIATE_ID}` …). |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` | Canonical URLs / metadata. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Floating WhatsApp button + contact page. |
| `CRON_SECRET` | Protects `/api/cron/*`, `/api/rates/refresh`, `/api/alerts/check` (`Authorization: Bearer <secret>` — Vercel Cron sends it automatically). |

## Database setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com) and copy the URL / keys into `.env.local`.
2. Apply the schema — either paste `supabase/migrations/0001_schema.sql` into the SQL editor, or with the CLI:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
3. Seed the catalogue (12 services, 10 corridors, sample rates + 30 days of history, FAQs, blog posts, reviews):
   ```bash
   npm run seed:sql          # regenerates supabase/seed.sql from lib/data/*
   psql "$SUPABASE_DB_URL" -f supabase/seed.sql
   ```
   Local stack: `supabase start && supabase db reset` applies migrations **and** `seed.sql` automatically.
4. Auth → URL configuration: add `https://<your-domain>/api/auth/callback` (and `http://localhost:3000/api/auth/callback`) to the redirect allow-list. Magic-link e-mail is the only sign-in method used (rate alerts).

> ⚠️ **Rates in the seed are samples** derived from baseline mid-market rates and each provider's typical pricing. Replace them with verified data before launch — the `/api/cron/update-rates` job refreshes mid-market rates every 30 minutes, and `/api/reports` + the admin can override provider markups.

### Schema overview

`services`, `corridors`, `rates` (current snapshot, unique per service × corridor), `rate_history` (time series), `profiles` (auto-created on sign-up), `rate_alerts`, `reviews` (auto-updates `services.rating`), `user_reports`, `blog_posts`, `subscribers`, `affiliate_clicks`, `faqs`, plus `contact_messages`. RLS: public read for the catalogue/approved content, owner-only for profiles/alerts/reports; all writes from the API go through the service role.

## Project structure

```
app/
  [locale]/            # ar (root) + en pages: home, compare, send-money/[corridor]/[service],
                       # services/[slug], rates/[corridor], alerts, blog/[slug], reviews(/write),
                       # report-rate, about, faq, contact, privacy, terms (+ loading/error/not-found)
  api/                 # rates(+compare/history/refresh), alerts(+check), reviews, reports, clicks,
                       # subscribe, contact, auth(callback/logout), cron(update-rates/check-alerts)
  sitemap.ts robots.ts manifest.ts
components/            # layout, home, compare, corridors, rates, services, reviews, blog, alerts, shared, ui
lib/
  exchange/            # calculator.ts (comparison engine), providers.ts (FX APIs), cache.ts
  api/                 # server data layer (Supabase → seed fallback)
  data/                # seed data: services, corridors, rates profiles, faqs, blog, reviews, legal
  supabase/            # browser / server / admin clients
  utils/               # formatters, validators (Zod), constants, affiliate, helpers
messages/ar.json en.json
store/useStore.ts      # Zustand (currency, amount, payout, toasts, session id)
supabase/              # migrations/0001_schema.sql, seed.sql, config.toml
scripts/               # generate-seed-sql.ts, generate-assets.ts
```

## How the comparison works

`lib/exchange/calculator.ts` implements the engine exactly as specified:

1. `fees = fixed_fee + amount × percent_fee / 100`
2. `amountAfterFees = amount − fees` → `amountReceived = amountAfterFees × exchange_rate`
3. `idealAmount = amount × midMarketRate` → `totalCostPercent`, `markupPercent`
4. Sort by `amountReceived` desc → `rank`, `savingsVsWorst`, `is_cheapest`, `is_fastest`

`GET /api/rates/compare?from=SAR&to=EGP&amount=1000&payout=bank_transfer` returns the documented shape (`query`, `mid_market_rate`, `results[]`, `summary`). Responses are cached for 60 s at the edge; rate pages use ISR (`revalidate = 1800`).

## Affiliate tracking

`SendButton` → `POST /api/clicks { service_id, corridor_id, amount, session_id }` → server logs the click (`affiliate_clicks`), builds the affiliate URL from env IDs and returns it → the browser opens it in a new tab. Falls back to the plain affiliate URL if the request fails.

## Deployment (Vercel)

1. Import the repo, set the environment variables above.
2. `vercel.json` schedules `update-rates` (`*/30 * * * *`) and `check-alerts` (`5,35 * * * *`); set `CRON_SECRET` in the project.
3. Add your domain to `NEXT_PUBLIC_APP_URL` and to Supabase Auth redirect URLs.

## Mobile app (Expo)

The native Android/iOS companion lives in [`mobile/`](mobile/README.md) — Expo SDK 52 + Expo Router,
same Supabase project and the same `/api/*` routes as this site, Arabic-first with full RTL, offline cache,
push rate alerts and `hawwely://` deep links that mirror the web URLs.

```bash
cd mobile && npm install && cp .env.example .env && npm run assets && npx expo start
```

Pure TypeScript modules (types, calculator, formatters, constants, demo data) are shared with the website via
`npm run sync:shared`, which copies them into `mobile/lib/shared/` — edit the website copy and re-sync.

## Disclaimer

حوّلي لا يقوم بتحويل الأموال. نحن منصة مقارنة مستقلة. الأسعار المعروضة للإرشاد فقط وقد تختلف عند التحويل الفعلي.

Hawwely does not transfer money. We are an independent comparison platform; displayed rates are indicative and may differ at the time of transfer.
