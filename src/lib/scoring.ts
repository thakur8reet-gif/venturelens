import type { FeatureSet, FundMandate, Startup, AnalysisResult, DimensionScore } from "./domain";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function dimension(score: number | null, contributors: DimensionScore["contributors"]): DimensionScore {
  if (score === null) return { score: null, confidence: "none", contributors };
  const available = contributors.length;
  return { score: clamp(score), confidence: available >= 3 ? "high" : available === 2 ? "medium" : "low", contributors };
}

export function scoreStartup(startup: Startup, f: FeatureSet, mandate?: FundMandate): AnalysisResult {
  const positives: string[] = [];
  const concerns: string[] = [];
  const missingEvidence: string[] = [];
  const diligenceQuestions: string[] = [];

  const growthC = [];
  let growth = 50;
  if (f.arr_growth.value !== null) {
    const g = f.arr_growth.value;
    growth += Math.max(-25, Math.min(35, g * 50));
    growthC.push({ feature: "arr_growth", impact: g >= 0.4 ? "positive" as const : "negative" as const, explanation: `ARR growth is ${(g * 100).toFixed(1)}%.` });
    if (g >= 0.5) positives.push(`ARR growth of ${(g * 100).toFixed(1)}%.`);
    if (g < 0.2) concerns.push("ARR growth is below the configured growth reference range.");
  } else missingEvidence.push("ARR growth");
  if (f.revenue_growth.value !== null) {
    const g = f.revenue_growth.value;
    growth += Math.max(-10, Math.min(10, g * 20));
    growthC.push({ feature: "revenue_growth", impact: g >= 0.2 ? "positive" as const : "negative" as const, explanation: `Revenue growth is ${(g * 100).toFixed(1)}%.` });
  } else missingEvidence.push("Revenue growth");

  const unitC = [];
  let unit = 50;
  if (f.gross_margin.value !== null) {
    unit += (f.gross_margin.value - 0.5) * 50;
    unitC.push({ feature: "gross_margin", impact: f.gross_margin.value >= 0.65 ? "positive" as const : "negative" as const, explanation: `Gross margin is ${(f.gross_margin.value * 100).toFixed(1)}%.` });
  } else missingEvidence.push("Gross margin");
  if (f.ltv_cac.value !== null) {
    unit += Math.max(-20, Math.min(25, (f.ltv_cac.value - 2) * 8));
    unitC.push({ feature: "ltv_cac", impact: f.ltv_cac.value >= 3 ? "positive" as const : "negative" as const, explanation: `LTV/CAC is ${f.ltv_cac.value.toFixed(1)}x.` });
    if (f.ltv_cac.value >= 3) positives.push(`LTV/CAC of ${f.ltv_cac.value.toFixed(1)}x.`);
  } else missingEvidence.push("LTV/CAC");

  const capC = [];
  let capital = 60;
  if (f.burn_multiple.value !== null) {
    capital += Math.max(-30, Math.min(20, (2 - f.burn_multiple.value) * 12));
    capC.push({ feature: "burn_multiple", impact: f.burn_multiple.value <= 2 ? "positive" as const : "negative" as const, explanation: `Burn multiple is ${f.burn_multiple.value.toFixed(1)}x.` });
  } else missingEvidence.push("Burn multiple");
  if (f.runway_months.value !== null) {
    capital += Math.max(-20, Math.min(20, (f.runway_months.value - 12) * 1.2));
    capC.push({ feature: "runway_months", impact: f.runway_months.value >= 18 ? "positive" as const : "negative" as const, explanation: `Runway is ${f.runway_months.value.toFixed(1)} months.` });
  } else missingEvidence.push("Runway");

  const valuationC = [];
  let valuation: number | null = null;
  if (f.arr_multiple.value !== null) {
    valuation = 75 - Math.max(0, f.arr_multiple.value - 5) * 5;
    valuationC.push({ feature: "arr_multiple", impact: f.arr_multiple.value <= 10 ? "positive" as const : "negative" as const, explanation: `ARR multiple is ${f.arr_multiple.value.toFixed(1)}x.` });
  } else missingEvidence.push("ARR valuation multiple");

  const marketC = startup.sector ? [{ feature: "sector", impact: "positive" as const, explanation: `Sector is ${startup.sector}.` }] : [];
  const market = startup.sector ? 60 : null;

  let fundFit: number | null = null;
  const fitC = [];
  if (mandate) {
    const sector = mandate.sectors.length === 0 || mandate.sectors.some(s => s.toLowerCase() === startup.sector.toLowerCase());
    const geo = mandate.geographies.length === 0 || mandate.geographies.some(g => g.toLowerCase() === startup.geography.toLowerCase());
    const stage = mandate.stages.length === 0 || mandate.stages.includes(startup.stage);
    const excluded = mandate.excludedSectors?.some(s => s.toLowerCase() === startup.sector.toLowerCase()) ?? false;
    const cheque = startup.latestRound?.amount !== undefined ? startup.latestRound.amount >= mandate.chequeMin && startup.latestRound.amount <= mandate.chequeMax : true;
    fundFit = (sector ? 30 : 0) + (geo ? 25 : 0) + (stage ? 25 : 0) + (cheque ? 20 : 0);
    fitC.push({ feature: "sector_fit", impact: sector ? "positive" as const : "negative" as const, explanation: sector ? "Sector matches mandate." : "Sector does not match mandate." });
    fitC.push({ feature: "geography_fit", impact: geo ? "positive" as const : "negative" as const, explanation: geo ? "Geography matches mandate." : "Geography does not match mandate." });
    fitC.push({ feature: "stage_fit", impact: stage ? "positive" as const : "negative" as const, explanation: stage ? "Stage matches mandate." : "Stage does not match mandate." });
    fitC.push({ feature: "cheque_fit", impact: cheque ? "positive" as const : "negative" as const, explanation: cheque ? "Observed financing size fits cheque range." : "Observed financing size is outside cheque range." });
    if (excluded) { fundFit = 0; concerns.push("Sector is explicitly excluded by the fund mandate."); }
  }

  const riskC = [];
  let risk = 25;
  if (f.top_customer_share.value !== null) {
    risk += f.top_customer_share.value * 40;
    riskC.push({ feature: "top_customer_share", impact: f.top_customer_share.value > 0.4 ? "negative" as const : "positive" as const, explanation: `Largest-customer concentration is ${(f.top_customer_share.value * 100).toFixed(1)}%.` });
    if (f.top_customer_share.value > 0.4) concerns.push("High customer concentration.");
  }
  if (f.churn.value !== null) {
    risk += f.churn.value * 40;
    riskC.push({ feature: "churn", impact: f.churn.value > 0.1 ? "negative" as const : "positive" as const, explanation: `Reported churn is ${(f.churn.value * 100).toFixed(1)}%.` });
  }

  const dimensions = {
    growth: dimension(growth, growthC),
    unitEconomics: dimension(unit, unitC),
    capitalEfficiency: dimension(capital, capC),
    financialQuality: dimension(f.gross_margin.value !== null ? 50 + f.gross_margin.value * 40 : null, f.gross_margin.value !== null ? [{ feature: "gross_margin", impact: f.gross_margin.value >= 0.6 ? "positive" as const : "negative" as const, explanation: `Gross margin is ${(f.gross_margin.value * 100).toFixed(1)}%.` }] : []),
    market: dimension(market, marketC),
    valuation: dimension(valuation, valuationC),
    fundFit: dimension(fundFit, fitC),
    risk: dimension(risk, riskC),
  };

  if (f.top_customer_share.value !== null && f.top_customer_share.value > 0.4) diligenceQuestions.push("What is the revenue concentration across the top five customers, and how has it changed?");
  if (f.burn_multiple.value !== null && f.burn_multiple.value > 2) diligenceQuestions.push("What operational drivers explain the current burn multiple?");
  if (f.arr_multiple.value !== null && f.arr_multiple.value > 10) diligenceQuestions.push("What assumptions support the current valuation relative to comparable businesses?");
  if (missingEvidence.length) diligenceQuestions.push("Which missing operating metrics can be verified from the latest management reporting?");

  const scores = Object.values(dimensions).map(d => d.score).filter((s): s is number => s !== null);
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const mandateMismatch = mandate && dimensions.fundFit.score !== null && dimensions.fundFit.score < 50;
  const status = mandateMismatch ? "mandate_mismatch" : scores.length < 4 ? "insufficient_evidence" : average >= 72 ? "strong_fit" : "review";

  return { status, dimensions, positives, concerns, missingEvidence, diligenceQuestions };
}
