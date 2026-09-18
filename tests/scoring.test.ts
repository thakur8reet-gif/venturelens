import { describe, expect, it } from "vitest";
import { analyzeStartup } from "../src/lib/analysis";
import { demoFund, demoStartups } from "../src/lib/demo-data";

describe("screening engine", () => {
  it("returns dimension-level scores and an explainable status", () => {
    const result = analyzeStartup(demoStartups[0], demoFund);
    expect(result.analysis.dimensions.growth.score).not.toBeNull();
    expect(result.analysis.dimensions.fundFit.score).toBe(100);
    expect(result.analysis.status).toBeDefined();
  });

  it("flags concentration as a diligence concern", () => {
    const result = analyzeStartup(demoStartups[1], demoFund);
    expect(result.analysis.concerns.some(x => x.includes("customer concentration"))).toBe(true);
    expect(result.analysis.diligenceQuestions.length).toBeGreaterThan(0);
  });
});
