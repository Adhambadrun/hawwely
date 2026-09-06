<p align="center">
  <img src="assets/images/logo.svg" alt="Hawwely" width="96" />
</p>

<h1 align="center">حوّلي — Hawwely mobile app</h1>

<p align="center">
  Native Android/iOS companion to <a href="../README.md">hawwely.com</a>: compare the 12 money-transfer services that send money to Egypt,
  get the real amount in EGP after every fee, and receive a push notification when the rate you're waiting for arrives.
  Arabic (RTL, Egyptian dialect) by default, English as a second language.
</p>

---

## Stack

| Area | Choice |
| --- | --- |
| Runtime | **Expo SDK 52** (React Native 0.76, new architecture), **Expo Router 4** (file-based routing, typed routes, deep links) |
| Styling | Design tokens in `theme/` (same palette as the website: `#00C853` primary, `#1B2A4A` navy, `#FFD700` gold) + **NativeWind 4** for utility classes |
| Fonts | **Cairo** (Arabic) & **Inter** (Latin) via `@expo-google-fonts/*`, picked automatically per language |
| State | **Zustand** persisted to AsyncStorage (`hawwely:store`): language, currency, amount, payout, recent comparisons, saved alerts, push token, prefs |
| Data | The website's REST API (`/api/rates/compare`, `/api/rates`, `/api/rates/history`, `/api/reviews`, `/api/reports`, `/api/clicks`) + **Supabase** (magic-link auth, `rate_alerts` table). Every call falls back to the bundled demo data / last cached payload when offline |
| Forms | React Hook Form + Zod with Arabic/English error messages |
| Motion & feel | `react-native-reanimated` 3 + **Moti** (fade/slide/stagger), `expo-haptics` on every meaningful tap, animated counters, skeletons |
| Notifications | `expo-notifications` — Android channel `rate-alerts`, deep link in `data.url` opened by the root layout |
| i18n | `i18next` / `react-i18next` — `i18n/locales/{ar,en}.json` (keys 1:1 in both files), RTL switch with `I18nManager` + reload via `expo-updates` |
| Builds | **EAS** (`eas.json`: `development`, `preview` APK, `production` AAB) |

## Quick start

```bash
cd mobile
npm install
cp .env.example .env            # fill in the Supabase URL + anon key (same project as the website)
npm run assets                  # generates icon / splash / adaptive icon / notification icon
npx expo start                  # press a for Android emulator, i for iOS simulator, or scan the QR in Expo Go
```

> **Demo mode.** With an empty `.env` the app still works end-to-end: the comparison engine runs
> on the bundled demo rates (`lib/shared/data/*`), reviews and blog posts come from the seed data,
> and alerts are kept locally. Point `EXPO_PUBLIC_API_URL` at a deployed website to get live rates.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase project (auth + `rate_alerts`). Optional — omit for demo mode |
| `EXPO_PUBLIC_API_URL` | Base URL of the website whose `/api/*` routes power the app (default `https://hawwely.com`) |
| `EXPO_PUBLIC_WHATSAPP_NUMBER` | Support number opened from the profile tab (international format, digits only) |

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | `expo lint` |
| `npm run assets` | Regenerates everything in `assets/` from the brand SVG (needs `sharp`) |
| `npm run sync:shared` | Copies the website's pure TypeScript modules (types, calculator, formatters, constants, demo data) into `lib/shared/` — **never edit `lib/shared/` by hand**, edit the website and re-sync |
| `npm run export:android` | Bundles the Android JS with Metro into `dist/` (smoke test that the whole tree compiles) |
| `npm run build:preview` | EAS internal-distribution APK |
| `npm run build:android` | EAS production app bundle (auto-increments `versionCode`) |
| `npm run submit:android` | Uploads the last production build to the Play internal track |

## Project layout

```
mobile/
├── app/                         # Expo Router routes
│   ├── _layout.tsx              # fonts, i18n, RTL, providers, deep links, notification taps
│   ├── index.tsx                # → onboarding (first launch) or tabs
│   ├── (onboarding)/            # 3 swipeable screens
│   ├── (tabs)/                  # home · rates · alerts · services · profile
│   ├── compare/results.tsx      # ranked results, sort, savings banner, affiliate CTA
│   ├── corridor/[id].tsx        # SAR→EGP…: live rate, chart (7/30/90d), best service, tips, FAQs
│   ├── service/[slug].tsx       # provider profile: fees per corridor, pros/cons, reviews, "send now"
│   ├── alert/create.tsx         # target-rate alert (push / email / WhatsApp)
│   ├── review.tsx · report.tsx  # write a review · report a wrong rate
│   ├── blog/                    # list + markdown article
│   ├── settings.tsx             # language, haptics, notifications, cache
│   ├── auth.tsx                 # magic-link sign-in
│   └── (modals)/                # fee-breakdown · currency-picker · savings-detail
├── components/                  # ui/ layout/ compare/ rates/ home/ services/ reviews/ shared/
├── lib/
│   ├── api/                     # REST client with cache + demo fallback, alerts (Supabase)
│   ├── hooks/                   # useAsyncData, useAuth, useNetwork, useLang
│   ├── shared/                  # ← generated from the website (types, calculator, formatters…)
│   ├── supabase/client.ts       # Supabase JS client w/ SecureStore session
│   ├── notifications.ts         # permissions, channel, local test notification
│   └── utils/                   # storage cache, haptics, share text, zod validators
├── store/useStore.ts            # Zustand store
├── theme/                       # colors, typography, spacing, radius, shadows
├── i18n/                        # i18next setup + ar/en dictionaries
├── assets/                      # generated icons/splash (npm run assets)
├── scripts/                     # generate-assets.js, sync-shared.js
├── app.json · eas.json          # Expo / EAS config (scheme hawwely://, applinks hawwely.com)
└── tailwind.config.js · global.css · metro.config.js · babel.config.js
```

## Deep links

The app registers the `hawwely://` scheme and verified `https://hawwely.com` links (Android App Links / iOS Universal Links).
Paths mirror the website so a shared web URL opens the matching screen:

| URL | Screen |
| --- | --- |
| `hawwely://compare/results?currency=SAR&amount=1000` | comparison results |
| `hawwely://corridor/sar-to-egp` | corridor page |
| `hawwely://service/wise` | service page |
| `hawwely://blog/<slug>` | article |
| `hawwely://alert/create?currency=AED` | new alert |
| `hawwely://auth?...` | magic-link callback |

Rate-alert pushes include `data.url` (e.g. `/corridor/sar-to-egp`) and are routed the same way when tapped.

## Offline behaviour

- Every GET is cached in AsyncStorage with a timestamp (`lib/utils/storage.ts`); if the network call fails
  the cached payload is shown with a "last updated …" note and an offline banner appears at the top.
- With no cache and no network, the comparison engine runs locally against the bundled demo rates so
  the app is never empty.

## Release checklist

1. `npm run typecheck && npm run lint`
2. `npm run assets` (commit the regenerated `assets/`)
3. Replace `extra.eas.projectId` in `app.json` with your EAS project id (`eas init`)
4. Put the Play service account JSON at `mobile/google-service-account.json` (git-ignored) for `eas submit`
5. `npm run build:preview` → test the APK on a real Android device (RTL, notifications, deep links)
6. `npm run build:android` → `npm run submit:android`

## Notes

- Changing the language flips `I18nManager` and requires an app reload; the settings screen offers it
  (uses `expo-updates` `reloadAsync`, which is a no-op in Expo Go).
- `notify_via` in the database only knows `email | whatsapp | telegram`; `push` is stored on the device
  together with the Expo push token and is delivered by the website's `/api/cron/check-alerts` job.
- The app never moves money: every "send" button opens the provider's own site/app through the
  affiliate-tracked link (`POST /api/clicks`).
