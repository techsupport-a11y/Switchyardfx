# SwitchYard FX Frontend

Standalone React 19 + Vite + TypeScript frontend for SwitchYard FX. The package is ready to copy into a dedicated frontend repository.

## Run locally

```bash
yarn
cp .env.example .env
yarn dev
```

## Data modes

The UI defaults to fully interactive mock mode. All mock behavior lives in `src/data/mockSwitchyard.ts`.

```env
VITE_DATA_MODE=mock
```

To connect the backend, serve or proxy it under the same-origin `/api` prefix and switch to:

```env
VITE_DATA_MODE=api
```

The only frontend integration boundary is `src/services/switchyard.ts`. It currently expects:

- `GET /api/market/overview` — server-proxied Twelve Data quotes and 15-minute AUD/USD candles, with an indicative fallback
- `GET /api/fx/rates?base=AUD&quotes=USD,EUR,GBP`
- `POST /api/submissions`

The corresponding hand-written TypeScript request/response contracts are in `src/lib/types.ts`. Change the service and those types together if the backend contract differs.

## Frontend structure

- `src/pages/` — route-level screens
- `src/components/` — shared shell, forms, and UI components
- `src/services/switchyard.ts` — backend adapter
- `src/data/mockSwitchyard.ts` — isolated demo data and simulated mutations
- `src/lib/types.ts` — API contracts
- `src/lib/api.ts` — typed HTTP transport over `/api`

No backend secrets, database code, or server runtime is required in this folder.

The Twelve Data key must remain in the backend environment as `TWELVE_DATA_API_KEY`. Never add it to a `VITE_*` variable or browser code.