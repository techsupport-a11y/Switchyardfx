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