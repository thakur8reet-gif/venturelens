import type { FinancialPeriod, Startup } from "../domain";
import type { ProviderRecord } from "./provider";

const SEC_BASE = "https://data.sec.gov";
const TICKER_URL = "https://www.sec.gov/files/company_tickers.json";

type SecTicker = { cik_str: number; ticker: string; title: string };
type SecFact = {
  val: number;
  fy?: number;
  fp?: string;
  form?: string;
  filed: string;
  start?: string;
  end?: string;
};
type SecCompanyFacts = {
  entityName: string;
  cik: string;
  facts: {
    "us-gaap"?: Record<string, { units?: Record<string, SecFact[]> }>;
  };
};

export type SecCompany = {
  cik: string;
  ticker: string;
  name: string;
  slug: string;
  financials: FinancialPeriod[];
  facts: ProviderRecord[];
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

async function secJson<T>(url: string): Promise<T> {
  const userAgent = process.env.SEC_USER_AGENT;
  if (!userAgent) throw new Error("SEC_USER_AGENT is required for SEC ingestion.");
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": userAgent },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`SEC request failed: ${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

function factsForTags(company: SecCompanyFacts, tags: string[], duration: boolean) {
  const facts: SecFact[] = [];
  for (const tag of tags) {
    const units = company.facts["us-gaap"]?.[tag]?.units?.USD;
    if (!units) continue;
    facts.push(...units.filter(f =>
      f.form === "10-K" &&
      f.fp === "FY" &&
      (duration ? Boolean(f.start) && Boolean(f.end) : Boolean(f.end) && !Boolean(f.start))
    ));
  }
  return facts;
}

function latestByEnd(facts: SecFact[]) {
  const byEnd = new Map<string, SecFact>();
  for (const fact of facts) {
    if (!fact.end) continue;
    const current = byEnd.get(fact.end);
    if (!current || fact.filed > current.filed) byEnd.set(fact.end, fact);
  }
  return byEnd;
}

function valueAt(map: Map<string, SecFact>, end: string) {
  return map.get(end)?.val;
}

function buildFinancials(company: SecCompanyFacts): FinancialPeriod[] {
  const durationTags = {
    revenue: ["RevenueFromContractWithCustomerExcludingAssessedTax", "Revenues", "SalesRevenueNet"],
    grossProfit: ["GrossProfit"],
    operatingCashFlow: ["NetCashProvidedByUsedInOperatingActivities"],
    capex: ["PaymentsToAcquirePropertyPlantAndEquipment"],
  };
  const instantTags = {
    cash: ["CashAndCashEquivalentsAtCarryingValue", "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents"],
  };

  const durationMaps = Object.fromEntries(
    Object.entries(durationTags).map(([key, tags]) => [key, latestByEnd(factsForTags(company, tags, true))]),
  ) as Record<string, Map<string, SecFact>>;
  const instantMaps = Object.fromEntries(
    Object.entries(instantTags).map(([key, tags]) => [key, latestByEnd(factsForTags(company, tags, false))]),
  ) as Record<string, Map<string, SecFact>>;

  const ends = new Set<string>();
  for (const map of Object.values(durationMaps)) for (const end of map.keys()) ends.add(end);
  for (const map of Object.values(instantMaps)) for (const end of map.keys()) ends.add(end);

  return [...ends].sort().slice(-8).map(end => {
    const revenueFact = durationMaps.revenue.get(end);
    const operatingCashFlow = durationMaps.operatingCashFlow.get(end)?.val;
    const capex = durationMaps.capex.get(end)?.val;
    const periodStart = revenueFact?.start ?? durationMaps.operatingCashFlow.get(end)?.start;

    return {
      periodEnd: end,
      ...(periodStart ? { periodStart } : {}),
      revenue: revenueFact?.val,
      grossProfit: durationMaps.grossProfit.get(end)?.val,
      cash: instantMaps.cash.get(end)?.val,
      freeCashFlow:
        operatingCashFlow !== undefined && capex !== undefined
          ? operatingCashFlow - capex
          : undefined,
    };
  });
}

export async function discoverSecCompanies(tickers: string[]): Promise<SecCompany[]> {
  const directory = await secJson<Record<string, SecTicker>>(TICKER_URL);
  const wanted = new Set(tickers.map(t => t.trim().toUpperCase()).filter(Boolean));
  const selected = Object.values(directory).filter(item => wanted.has(item.ticker.toUpperCase()));

  return Promise.all(
    selected.map(async item => {
      const cik = String(item.cik_str).padStart(10, "0");
      const sourceUrl = `${SEC_BASE}/api/xbrl/companyfacts/CIK${cik}.json`;
      const company = await secJson<SecCompanyFacts>(sourceUrl);
      return {
        cik,
        ticker: item.ticker.toUpperCase(),
        name: item.title,
        slug: slugify(`${item.ticker}-${item.title}`),
        financials: buildFinancials(company),
        facts: [{
          externalId: cik,
          payload: company,
          sourceUrl,
          retrievedAt: new Date().toISOString(),
        }],
      };
    }),
  );
}

export function companyToStartup(company: SecCompany): Startup {
  return {
    id: `sec-${company.cik}`,
    slug: company.slug,
    name: company.name,
    sector: "PUBLIC_COMPANY",
    geography: "United States",
    stage: "GROWTH",
    description: `SEC reporting company ${company.ticker}. Financial values are sourced from SEC EDGAR XBRL company facts.`,
    dataSource: "sec_xbrl",
    sourceNote: "Reported financial statement facts from SEC EDGAR XBRL; derived metrics are calculated separately by VentureLens and are not presented as reported figures.",
    financials: company.financials,
  };
}
