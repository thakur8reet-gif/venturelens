import type { FeatureSet, FinancialPeriod, Startup } from "./domain";

const unavailable = (unit: string, reason: string): { value: null; unit: string; evidence: "unavailable"; reason: string } => ({
  value: null, unit, evidence: "unavailable", reason
});

const calc = (value: number | null, unit: string, formula: string, inputs: string[]) => ({
  value, unit, evidence: "calculated" as const, formula, inputs
});

const isPositive = (value: number | undefined): value is number => value !== undefined && value > 0;\n\nconst sortPeriodsAscending = (periods: FinancialPeriod[]) => [...periods].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));\n\nconst latestTwo = (periods: FinancialPeriod[]) => sortPeriodsAscending(periods).slice(-2).reverse();

const emptyFeatures = (): FeatureSet => ({
  revenue: unavailable("currency", "Revenue unavailable"),
  arr: unavailable("currency", "ARR unavailable"),
  revenue_growth: unavailable("ratio", "Need comparable revenue periods"),
  arr_growth: unavailable("ratio", "Need comparable ARR periods"),
  revenue_cagr_2y: unavailable("ratio", "Need three comparable annual revenue periods for 2Y CAGR"),
  arr_cagr_2y: unavailable("ratio", "Need three comparable annual ARR periods for 2Y CAGR"),
  revenue_cagr_3y: unavailable("ratio", "Need four annual/comparable periods for 3Y CAGR"),
  gross_margin: unavailable("ratio", "Need gross profit and revenue"),
  ebitda_margin: unavailable("ratio", "Need EBITDA and revenue"),
  fcf_margin: unavailable("ratio", "Need free cash flow and revenue"),
  ltv_cac: unavailable("multiple", "Need positive CAC and LTV"),
  cac_payback_months: unavailable("months", "Need CAC, gross profit, and customer count"),
  runway_months: unavailable("months", "Need cash and positive monthly net burn"),
  burn_multiple: unavailable("multiple", "Need current/prior ARR and net burn"),
  arr_capital_efficiency: unavailable("multiple", "Need ARR and a positive financing amount"),
  nrr: unavailable("ratio", "NRR unavailable"),
  churn: unavailable("ratio", "Churn unavailable"),
  top_customer_share: unavailable("ratio", "Customer concentration unavailable"),
  arr_multiple: unavailable("multiple", "Need post-money valuation and ARR"),
  dilution: unavailable("ratio", "Need financing amount and post-money valuation"),
});

export function buildFeatures(startup: Startup): FeatureSet {
  const periods = sortPeriodsAscending(startup.financials);
  const latest = periods.at(-1);
  const previous = periods.at(-2);
  const twoYearsAgo = periods.length >= 3 ? periods.at(-3) : undefined;
  const threeYearsAgo = periods.length >= 4 ? periods.at(-4) : undefined;
  const f: FeatureSet = {};

  if (!latest) return emptyFeatures();

  f.revenue = latest.revenue !== undefined ? { value: latest.revenue, unit: "currency", evidence: "reported" } : unavailable("currency", "Revenue unavailable");
  f.arr = latest.arr !== undefined ? { value: latest.arr, unit: "currency", evidence: "reported" } : unavailable("currency", "ARR unavailable");

  f.revenue_growth = latest.revenue !== undefined && previous?.revenue && previous.revenue > 0
    ? calc(latest.revenue / previous.revenue - 1, "ratio", "(revenue_t / revenue_t-1) - 1", ["revenue"])
    : unavailable("ratio", "Need two comparable revenue periods");

  f.arr_growth = latest.arr !== undefined && previous?.arr && previous.arr > 0
    ? calc(latest.arr / previous.arr - 1, "ratio", "(arr_t / arr_t-1) - 1", ["arr"])
    : unavailable("ratio", "Need two comparable ARR periods");

  f.revenue_cagr_2y = latest.revenue !== undefined && twoYearsAgo?.revenue && twoYearsAgo.revenue > 0
    ? calc(Math.pow(latest.revenue / twoYearsAgo.revenue, 1 / 2) - 1, "ratio", "(revenue_t / revenue_t-2)^(1/2) - 1", ["revenue"])
    : unavailable("ratio", "Need three comparable annual revenue periods for 2Y CAGR");

  f.arr_cagr_2y = latest.arr !== undefined && twoYearsAgo?.arr && twoYearsAgo.arr > 0
    ? calc(Math.pow(latest.arr / twoYearsAgo.arr, 1 / 2) - 1, "ratio", "(arr_t / arr_t-2)^(1/2) - 1", ["arr"])
    : unavailable("ratio", "Need three comparable annual ARR periods for 2Y CAGR");

  f.revenue_cagr_3y = latest.revenue !== undefined && threeYearsAgo?.revenue && threeYearsAgo.revenue > 0
    ? calc(Math.pow(latest.revenue / threeYearsAgo.revenue, 1 / 3) - 1, "ratio", "(revenue_t / revenue_t-3)^(1/3) - 1", ["revenue"])
    : unavailable("ratio", "Need four annual/comparable periods for 3Y CAGR");

  f.gross_margin = latest.grossProfit !== undefined && latest.revenue && latest.revenue > 0
    ? calc(latest.grossProfit / latest.revenue, "ratio", "gross_profit / revenue", ["gross_profit", "revenue"])
    : unavailable("ratio", "Need gross profit and revenue");

  f.ebitda_margin = latest.ebitda !== undefined && latest.revenue && latest.revenue > 0
    ? calc(latest.ebitda / latest.revenue, "ratio", "ebitda / revenue", ["ebitda", "revenue"])
    : unavailable("ratio", "Need EBITDA and revenue");

  f.fcf_margin = latest.freeCashFlow !== undefined && latest.revenue && latest.revenue > 0
    ? calc(latest.freeCashFlow / latest.revenue, "ratio", "free_cash_flow / revenue", ["free_cash_flow", "revenue"])
    : unavailable("ratio", "Need FCF and revenue");

  f.ltv_cac = latest.ltv !== undefined && latest.cac !== undefined && latest.cac > 0
    ? calc(latest.ltv / latest.cac, "multiple", "ltv / cac", ["ltv", "cac"])
    : unavailable("multiple", "Need positive CAC and LTV");

  f.cac_payback_months = latest.cac !== undefined && latest.grossProfit !== undefined && latest.revenue && latest.revenue > 0
    ? latest.customers && latest.customers > 0
      ? calc(latest.cac / ((latest.grossProfit / latest.customers) / 12), "months", "cac / monthly_gross_profit_per_customer", ["cac", "gross_profit", "customers"])
      : unavailable("months", "Need CAC, gross profit, and customer count to derive a per-customer payback period")
    : unavailable("months", "Need CAC and gross profit");

  f.runway_months = latest.cash !== undefined && latest.netBurn !== undefined && latest.netBurn > 0
    ? calc(latest.cash / latest.netBurn, "months", "cash / monthly_net_burn", ["cash", "net_burn"])
    : unavailable("months", "Need cash and positive monthly net burn");

  f.burn_multiple = latest.netBurn !== undefined && latest.arr !== undefined && previous?.arr !== undefined
    ? (() => {
        const netNewArr = latest.arr - previous.arr;
        return netNewArr > 0
          ? calc((latest.netBurn * 12) / netNewArr, "multiple", "(monthly_net_burn * 12) / net_new_arr", ["net_burn", "arr"])
          : unavailable("multiple", "Net new ARR is not positive");
      })()
    : unavailable("multiple", "Need current/prior ARR and net burn");

  f.arr_capital_efficiency = latest.arr !== undefined && startup.latestRound?.amount && startup.latestRound.amount > 0
    ? calc(latest.arr / startup.latestRound.amount, "multiple", "arr / latest_capital_raised", ["arr", "capital_raised"])
    : unavailable("multiple", "Need ARR and a positive financing amount");

  f.nrr = latest.nrr !== undefined ? { value: latest.nrr, unit: "ratio", evidence: "reported" } : unavailable("ratio", "NRR unavailable");
  f.churn = latest.churn !== undefined ? { value: latest.churn, unit: "ratio", evidence: "reported" } : unavailable("ratio", "Churn unavailable");
  f.top_customer_share = latest.topCustomerShare !== undefined ? { value: latest.topCustomerShare, unit: "ratio", evidence: "reported" } : unavailable("ratio", "Customer concentration unavailable");

  if (startup.latestRound?.postMoney && latest.arr && latest.arr > 0) {
    f.arr_multiple = calc(startup.latestRound.postMoney / latest.arr, "multiple", "post_money / arr", ["post_money", "arr"]);
  } else {
    f.arr_multiple = unavailable("multiple", "Need post-money valuation and ARR");
  }

  if (startup.latestRound?.amount && startup.latestRound.postMoney && startup.latestRound.postMoney > 0) {
    f.dilution = calc(startup.latestRound.amount / startup.latestRound.postMoney, "ratio", "new_investment / post_money", ["round_amount", "post_money"]);
  } else {
    f.dilution = unavailable("ratio", "Need financing amount and post-money valuation");
  }

  return f;
}

export function featureCompleteness(features: FeatureSet): number {
  const values = Object.values(features);
  if (!values.length) return 0;
  return values.filter(v => v.evidence !== "unavailable").length / values.length;
}

export function getLatestTwoPeriods(startup: Startup) {
  return latestTwo(startup.financials);
}
