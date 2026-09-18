import type { FundMandate, Startup } from "./domain";
import { buildFeatures } from "./features";
import { scoreStartup } from "./scoring";

export function analyzeStartup(startup: Startup, mandate?: FundMandate) {
  const features = buildFeatures(startup);
  const analysis = scoreStartup(startup, features, mandate);
  return { startup, features, analysis, featureSetVersion: "1.0.0", modelVersion: "1.0.0" };
}
