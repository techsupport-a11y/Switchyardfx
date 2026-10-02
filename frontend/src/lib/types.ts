export interface FxRate {
  pair: string;
  rate: number;
  change: number;
  source: "live" | "fallback";
}

export interface FxRatesResponse {
  base: string;
  as_of: string;
  rates: FxRate[];
}

export interface MarketQuote {
  pair: string;
  rate: number;
  change: number;
}

export interface MarketCandle {
  timestamp: string;
  close: number;
}

export interface MarketOverviewResponse {
  source: "live" | "fallback";
  provider: "Twelve Data" | "Indicative fallback";
  as_of: string;
  quotes: MarketQuote[];
  candles: MarketCandle[];
  warning: string | null;
}

export type SubmissionKind = "contact" | "newsletter" | "hedge-guide";

export interface SubmissionResponse {
  ok: boolean;
  id: string;
  received_at: string;
}

export interface SubmissionPayload {
  kind: SubmissionKind;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  annual_fx_volume?: string;
  message?: string;
  role?: string;
  cadence?: "daily" | "weekly";
  locale: string;
  consent: boolean;
}