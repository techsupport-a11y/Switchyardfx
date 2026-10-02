import type { FxRatesResponse, MarketOverviewResponse, SubmissionPayload, SubmissionResponse } from "@/lib/types";

export const MOCK_FX_RATES: FxRatesResponse = {
  base: "AUD",
  as_of: "2026-01-01",
  rates: [
    { pair: "AUD/USD", rate: 0.6512, change: 0.48, source: "fallback" },
    { pair: "AUD/EUR", rate: 0.6018, change: -0.27, source: "fallback" },
    { pair: "AUD/GBP", rate: 0.5129, change: 0.92, source: "fallback" },
  ],
};

export const MOCK_MARKET_OVERVIEW: MarketOverviewResponse = {
  source: "fallback",
  provider: "Indicative fallback",
  as_of: new Date().toISOString(),
  quotes: MOCK_FX_RATES.rates.map(({ pair, rate, change }) => ({ pair, rate, change })),
  candles: [0.6504, 0.6508, 0.6502, 0.6511, 0.6515, 0.6509, 0.6518, 0.6522, 0.6517, 0.6525, 0.6521, 0.6516, 0.6528, 0.6531, 0.6526, 0.6534, 0.6530, 0.6524, 0.6519, 0.6527, 0.6535, 0.6532, 0.6528, 0.6538, 0.6541, 0.6536, 0.6544, 0.6540, 0.6547, 0.6543, 0.6549, 0.6552].map((close, index) => ({ timestamp: `${index * 15}`, close })),
  warning: "Live market data is unavailable; showing indicative values.",
};

export async function getMockMarketOverview(): Promise<MarketOverviewResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 280));
  return { ...MOCK_MARKET_OVERVIEW, as_of: new Date().toISOString() };
}

export async function getMockFxRates(): Promise<FxRatesResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 280));
  return MOCK_FX_RATES;
}

export async function createMockSubmission(payload: SubmissionPayload): Promise<SubmissionResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 520));
  if (!payload.consent) throw new Error("Consent is required");
  return {
    ok: true,
    id: `demo-${crypto.randomUUID()}`,
    received_at: new Date().toISOString(),
  };
}