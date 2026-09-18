import type { Startup } from "../domain";

export interface StartupProvider {
  readonly name: string;
  discover(): Promise<Startup[]>;
}

export interface ProviderRecord {
  externalId: string;
  payload: unknown;
  sourceUrl?: string;
  retrievedAt: string;
}

export interface FundingProvider {
  readonly name: string;
  discoverFunding(startupExternalId?: string): Promise<ProviderRecord[]>;
}
