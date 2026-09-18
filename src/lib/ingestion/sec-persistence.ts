import type { SecCompany } from "./sec";
import { prisma } from "../db";

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function persistSecCompanies(companies: SecCompany[]) {
  let startups = 0;
  let periods = 0;
  let facts = 0;

  for (const company of companies) {
    const startup = await prisma.startup.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        sector: "PUBLIC_COMPANY",
        geography: "United States",
        stage: "GROWTH",
        description: `SEC reporting company ${company.ticker}`,
      },
      create: {
        slug: company.slug,
        name: company.name,
        sector: "PUBLIC_COMPANY",
        geography: "United States",
        stage: "GROWTH",
        description: `SEC reporting company ${company.ticker}`,
      },
    });
    startups++;

    const source = await prisma.source.create({
      data: {
        name: `SEC XBRL Company Facts — ${company.ticker}`,
        uri: company.facts[0]?.sourceUrl,
        sourceType: "SEC_XBRL",
        retrievedAt: new Date(company.facts[0]?.retrievedAt ?? new Date().toISOString()),
      },
    });

    for (const period of company.financials) {
      const periodEnd = toDate(period.periodEnd);
      const periodStart = new Date(periodEnd);
      periodStart.setUTCFullYear(periodEnd.getUTCFullYear() - 1);

      await prisma.financialPeriod.upsert({
        where: { id: `sec-${company.cik}-${company.ticker}-${period.periodEnd}` },
        update: {
          revenue: period.revenue,
          grossProfit: period.grossProfit,
          cash: period.cash,
          ebitda: period.ebitda,
          freeCashFlow: period.freeCashFlow,
        },
        create: {
          id: `sec-${company.cik}-${company.ticker}-${period.periodEnd}`,
          startupId: startup.id,
          periodStart,
          periodEnd,
          revenue: period.revenue,
          grossProfit: period.grossProfit,
          cash: period.cash,
          ebitda: period.ebitda,
          freeCashFlow: period.freeCashFlow,
        },
      });
      periods++;
    }

    const payload = company.facts[0]?.payload;
    await prisma.sourceFact.create({
      data: {
        startupId: startup.id,
        sourceId: source.id,
        field: "sec_companyfacts",
        value: payload as object,
        evidence: "REPORTED",
        confidence: 1,
      },
    });
    facts++;
  }

  return { startups, periods, facts };
}
