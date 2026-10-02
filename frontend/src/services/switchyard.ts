import { apiGet, apiPost } from "@/lib/api";
import { createMockSubmission, getMockFxRates } from "@/data/mockSwitchyard";
import type { FxRatesResponse, SubmissionPayload, SubmissionResponse } from "@/lib/types";

export type SwitchyardDataMode = "mock" | "api";

// This is the only switch required when the production backend is connected.
// Keep API mode same-origin: Vite/proxy or the production host should serve /api.
export const SWITCHYARD_DATA_MODE: SwitchyardDataMode =
  import.meta.env.VITE_DATA_MODE === "api" ? "api" : "mock";

export const switchyardService = {
  getFxRates(): Promise<FxRatesResponse> {
    if (SWITCHYARD_DATA_MODE === "mock") return getMockFxRates();
    return apiGet<FxRatesResponse>("/fx/rates?base=AUD&quotes=USD,EUR,GBP");
  },

  createSubmission(payload: SubmissionPayload): Promise<SubmissionResponse> {
    if (SWITCHYARD_DATA_MODE === "mock") return createMockSubmission(payload);
    return apiPost<SubmissionResponse>("/submissions", payload);
  },
};