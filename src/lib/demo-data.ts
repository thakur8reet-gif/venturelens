import type { FundMandate, Startup } from "./domain";

export const demoFund: FundMandate = {
  id: "demo-fund",
  name: "VentureLens Demo Fund",
  sectors: ["SaaS", "AI"],
  geographies: ["India"],
  stages: ["SEED", "SERIES_A"],
  chequeMin: 2_000_000,
  chequeMax: 15_000_000,
  targetOwnershipMin: 0.08,
  targetOwnershipMax: 0.20,
  minimumGrowth: 0.4,
};

export const demoStartups: Startup[] = [
  {
    id: "acme-ai",
    slug: "acme-ai",
    name: "Acme AI",
    sector: "AI",
    geography: "India",
    stage: "SERIES_A",
    businessModel: "B2B SaaS",
    description: "Synthetic demonstration company used to exercise the VentureLens analytical workflow.",
    financials: [
      { periodEnd: "2024-03-31", revenue: 4_500_000, arr: 5_000_000, grossProfit: 3_000_000, cash: 18_000_000, netBurn: 1_200_000, cac: 180_000, ltv: 720_000, nrr: 1.16, churn: 0.04, topCustomerShare: 0.18 },
      { periodEnd: "2025-03-31", revenue: 8_000_000, arr: 9_500_000, grossProfit: 5_900_000, cash: 14_000_000, netBurn: 1_100_000, cac: 190_000, ltv: 780_000, nrr: 1.18, churn: 0.035, topCustomerShare: 0.20 },
      { periodEnd: "2026-03-31", revenue: 14_500_000, arr: 17_000_000, grossProfit: 11_300_000, cash: 11_000_000, netBurn: 1_000_000, cac: 205_000, ltv: 860_000, nrr: 1.21, churn: 0.03, topCustomerShare: 0.22 },
    ],
    latestRound: { roundName: "Series A", announcedAt: "2026-04-15", amount: 8_000_000, preMoney: 32_000_000, postMoney: 40_000_000 },
  },
  {
    id: "northstar",
    slug: "northstar",
    name: "Northstar Systems",
    sector: "SaaS",
    geography: "India",
    stage: "SEED",
    businessModel: "B2B SaaS",
    description: "Synthetic demonstration company with strong growth but weaker capital efficiency.",
    financials: [
      { periodEnd: "2025-03-31", revenue: 2_000_000, arr: 2_400_000, grossProfit: 1_200_000, cash: 12_000_000, netBurn: 1_900_000, cac: 260_000, ltv: 650_000, nrr: 1.04, churn: 0.08, topCustomerShare: 0.44 },
      { periodEnd: "2026-03-31", revenue: 3_800_000, arr: 4_800_000, grossProfit: 2_300_000, cash: 8_000_000, netBurn: 2_000_000, cac: 330_000, ltv: 690_000, nrr: 1.02, churn: 0.11, topCustomerShare: 0.47 },
    ],
    latestRound: { roundName: "Seed", announcedAt: "2026-05-20", amount: 5_000_000, preMoney: 15_000_000, postMoney: 20_000_000 },
  },
];
