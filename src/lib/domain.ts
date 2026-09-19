export type Stage = "PRE_SEED" | "SEED" | "SERIES_A" | "SERIES_B" | "SERIES_C" | "GROWTH";

export type EvidenceType = "reported" | "calculated" | "estimated" | "company_claim" | "unavailable";

export interface FinancialPeriod {
  periodStart?: string;
  periodEnd: string;
  revenue?: number;
  arr?: number;
  grossProfit?: number;
  ebitda?: number;
  freeCashFlow?: number;
  capex?: number;
  cash?: number;
  grossBurn?: number;
  netBurn?: number;
  cac?: number;
  ltv?: number;
  nrr?: number;
  churn?: number;
  customers?: number;
  topCustomerShare?: number;
  capex?: number;
  workingCapital?: number;
}

export interface Startup {
  id: string;
  slug: string;
  name: string;
  sector: string;
  geography: string;
  stage: Stage;
  businessModel?: string;
  description?: string;
  dataSource?: "synthetic_demo" | "sec_xbrl" | "other";
  sourceNote?: string;
  financials: FinancialPeriod[];
  latestRound?: FundingRound;
}

export interface FundingRound {
  roundName: string;
  announcedAt: string;
  amount?: number;
  preMoney?: number;
  postMoney?: number;
}

export interface FundMandate {
  id: string;
  name: string;
  sectors: string[];
  geographies: string[];
  stages: Stage[];
  chequeMin: number;
  chequeMax: number;
  targetOwnershipMin?: number;
  targetOwnershipMax?: number;
  minimumGrowth?: number;
  recurringBusinessPreferred?: boolean;
  excludedSectors?: string[];
}

export interface FeatureValue {
  value: number | null;
  unit: string;
  evidence: EvidenceType;
  formula?: string;
  reason?: string;
  inputs?: string[];
}

export type FeatureSet = Record<string, FeatureValue>;

export interface DimensionScore {
  score: number | null;
  confidence: "high" | "medium" | "low" | "none";
  contributors: { feature: string; impact: "positive" | "negative"; explanation: string }[];
}

export interface AnalysisResult {
  status: "strong_fit" | "review" | "insufficient_evidence" | "mandate_mismatch";
  dimensions: Record<string, DimensionScore>;
  positives: string[];
  concerns: string[];
  missingEvidence: string[];
  diligenceQuestions: string[];
}
