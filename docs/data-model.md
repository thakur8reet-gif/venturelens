# VentureLens Data Model

The persistence model is PostgreSQL via Prisma.

## Core entities

- Startup — canonical company identity and operating context.
- FinancialPeriod — periodized financial and operating metrics.
- FundingRound — financing history and transaction terms.
- Fund — configurable investment mandate.
- Source — provenance for external/company information.
- SourceFact — individual evidence-bearing facts.
- FeatureSnapshot — versioned derived feature set.
- Analysis — reproducible assessment tied to feature/model versions.
- FundMatch — startup-to-fund mandate match.
- Document — diligence material linked to sources.

## Reproducibility

An analysis stores both featureSetVersion and modelVersion. This allows future methodology changes without mutating prior analytical records.

## Data quality

Facts contain evidence type, confidence, and period metadata. Unknown values remain null. The application must not coerce missing financial data to zero.
