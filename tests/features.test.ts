import { describe, expect, it } from "vitest";
import { buildFeatures } from "../src/lib/features";
import { demoStartups } from "../src/lib/demo-data";

describe("feature engine", () => {
  it("calculates ARR growth without treating missing values as zero", () => {
    const f = buildFeatures(demoStartups[0]);
    expect(f.arr_growth.value).toBeCloseTo(17 / 9.5 - 1, 5);
    expect(f.arr_growth.evidence).toBe("calculated");
  });

  it("calculates runway from cash and net burn", () => {
    const f = buildFeatures(demoStartups[0]);
    expect(f.runway_months.value).toBeCloseTo(11);
  });
});
