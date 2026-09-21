import { PrismaClient, CompanyStage, EvidenceType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fund = await prisma.fund.upsert({
    where: { name: "VentureLens Demo Fund" },
    update: {},
    create: {
      name: "VentureLens Demo Fund",
      description: "Synthetic fund mandate for local development.",
      mandate: {
        sectors: ["SaaS", "AI"],
        geographies: ["India"],
        stages: ["SEED", "SERIES_A"],
        chequeMin: 2000000,
        chequeMax: 15000000,
      },
    },
  });

  const source = await prisma.source.create({
    data: {
      name: "VentureLens Synthetic Demo Dataset",
      sourceType: "synthetic",
    },
  });

  const startup = await prisma.startup.upsert({
    where: { slug: "acme-ai" },
    update: {},
    create: {
      slug: "acme-ai",
      name: "Acme AI",
      sector: "AI",
      geography: "India",
      stage: CompanyStage.SERIES_A,
      businessModel: "B2B SaaS",
      description: "Synthetic demonstration company.",
      financials: {
        create: [
          { periodStart: new Date("2025-04-01"), periodEnd: new Date("2026-03-31"), revenue: 14500000, arr: 17000000, grossProfit: 11300000, cash: 11000000, netBurn: 1000000, cac: 205000, ltv: 860000, nrr: 1.21, churn: 0.03, topCustomerShare: 0.22 }
        ]
      },
      rounds: {
        create: [{ roundName: "Series A", announcedAt: new Date("2026-04-15"), amount: 8000000, preMoney: 32000000, postMoney: 40000000 }]
      }
    }
  });

  await prisma.sourceFact.create({
    data: {
      startupId: startup.id,
      sourceId: source.id,
      field: "demo_dataset",
      value: { synthetic: true },
      evidence: EvidenceType.COMPANY_CLAIM,
      confidence: 0.1,
    }
  });

  const startup2 = await prisma.startup.upsert({
    where: { slug: "novagrid-ai" },
    update: {},
    create: { slug: "novagrid-ai", name: "NovaGrid AI", sector: "AI", geography: "India", stage: CompanyStage.SEED, businessModel: "B2B SaaS", description: "Synthetic demo company focused on AI workflow automation." }
  });

  console.log(`Seeded ${startup.name} and ${fund.name}`);
}

main().finally(() => prisma.$disconnect());
