import type { FxRatesResponse, SubmissionPayload, SubmissionResponse } from "@/lib/types";

export const MOCK_FX_RATES: FxRatesResponse = {
  base: "AUD",
  as_of: "2026-01-01",
  rates: [
    { pair: "AUD/USD", rate: 0.6512, change: 0.48, source: "fallback" },
    { pair: "AUD/EUR", rate: 0.6018, change: -0.27, source: "fallback" },
    { pair: "AUD/GBP", rate: 0.5129, change: 0.92, source: "fallback" },
  ],
};

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