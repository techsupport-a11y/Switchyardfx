# SwitchYard FX living spec

## Product
Premium responsive corporate FX risk-management marketing site for mid-market CFOs and treasury teams in Sydney. Routes cover Home, About, Services, Market Insights, article detail, Contact, Login, Privacy Policy, Terms of Service, Compliance, and a branded 404.

## Data model
- `FxRate`: pair, rate, change, source (`live` or `fallback`); fetched through `GET /api/fx/rates`.
- `SubmissionCreate`: contact, newsletter, or hedge-guide lead with email, optional company/contact fields, consent, locale, and optional cadence/role; stored in MongoDB through `POST /api/submissions`.

## Key flows
- Header and footer links route across all marketing pages.
- Custom language menu persists the selected locale in localStorage, drives a hidden Google Translate Element when available, and sets Arabic RTL.
- Home dashboard tabs and hedging horizon toggles change local demo data; live rates show Frankfurter data or clearly labelled indicative fallback.
- Hedge guide, newsletter, and contact forms validate in-browser, require consent, persist to MongoDB, and show a success state.
- Booking CTAs link to Cal.com, WhatsApp CTAs use wa.me, and login is a branded demo flow without auth gating.

## Auth
No real authentication or seeded accounts. `/login` is intentionally a non-blocking branded demo login screen.

## Integrations
Frankfurter public FX API via backend with fallback; hidden Google Translate bridge; external Cal.com and WhatsApp links. No private third-party credentials are required.

## Frontend handoff mode
- The `frontend/` directory is a standalone repository-ready package.
- `VITE_DATA_MODE=mock` is the default and uses isolated interactive demo behavior from `src/data/mockSwitchyard.ts`.
- `VITE_DATA_MODE=api` routes all data through `src/services/switchyard.ts`, currently matching `GET /api/fx/rates` and `POST /api/submissions`.
- Backend replacement requires editing the service adapter and mirrored interfaces only; pages and components do not call endpoints directly.

## Homepage interaction refresh
- Hero uses a layered market command centre with currency/horizon controls, animated SVG exposure line, live ticker, floating status cards, and reduced-motion-safe pointer depth.
- Added CFO outcomes, animated proof metrics, interactive exposure scenarios, and client-story carousel sections.
- Scroll reveals use eased fade/blur motion with reduced-motion fallback.
- Header/cookie/WhatsApp layering and mobile bottom spacing are normalized to prevent overlap; dark section labels use the sage contrast color.

## Live hero market data
- `GET /api/market/overview` proxies Twelve Data on the server and returns batched AUD/USD, AUD/EUR, AUD/GBP quotes plus 32 ascending AUD/USD 15-minute closes.
- The API key is backend-only in `backend/.env`; it is never exposed to Vite or browser requests.
- Responses are cached in-process for 60 seconds to conserve provider quota.
- Provider errors, incomplete payloads, and HTTP 429s return clearly labeled indicative fallback quotes and candles.
- The hero refreshes once per minute and exposes 2H, 4H, 6H, and 1D chart windows.

## Global shell shape
- Header uses a centered max-1280px floating capsule with 20px corners and scroll-state blur/shadow.
- Footer is separated from page content by a small light gap and uses 32px rounded top corners.