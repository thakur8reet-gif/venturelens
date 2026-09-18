import type { Startup } from "../domain";
import type { ProviderRecord } from "./provider";

export interface NormalizedFact {
  startupId: string;
  field: string;
  value: unknown;
  source: string;
  sourceUrl?: string;
  retrievedAt: string;
  evidence: "reported" | "company_claim" | "estimated";
}

export function normalizeProviderRecord(record: ProviderRecord, startupId: string): NormalizedFact[] {
  if (!record.payload || typeof record.payload !== "object") return [];
  return [{
    startupId,
    field: "provider_payload",
    value: record.payload,
    source: "external_provider",
    sourceUrl: record.sourceUrl,
    retrievedAt: record.retrievedAt,
    evidence: "reported",
  }];
}

export function deduplicateStartups(startups: Startup[]): Startup[] {
  const bySlug = new Map<string, Startup>();
  for (const startup of startups) {
    const key = startup.slug.trim().toLowerCase();
    if (!bySlug.has(key)) bySlug.set(key, startup);
  }
  return [...bySlug.values()];
}
