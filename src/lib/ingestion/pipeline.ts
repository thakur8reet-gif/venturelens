import type { StartupProvider } from "./provider";
import { deduplicateStartups } from "./normalizer";

export async function runDiscoveryPipeline(providers: StartupProvider[]) {
  const batches = await Promise.all(providers.map(p => p.discover()));
  return deduplicateStartups(batches.flat());
}
