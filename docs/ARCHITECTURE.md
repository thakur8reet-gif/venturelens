# VentureLens Architecture

## Product flow

Ingest data -> normalize facts -> engineer features -> screen -> match funds -> diligence -> investment memo.

## Boundaries

- **Domain:** canonical startup, fund, financing, financial-period, source, and analysis types.
- **Feature engine:** deterministic calculations only.
- **Screening:** configurable mandate rules and dimension scoring.
- **Ingestion:** provider interfaces with replaceable adapters.
- **Research:** document/evidence workflows. LLM output is never the financial source of truth.
- **Web:** Next.js application and API boundary.
- **Persistence:** PostgreSQL-compatible schema via Prisma.

## Principles

1. Explainability over opaque scores.
2. Missing data is unknown, never zero.
3. Material facts retain provenance.
4. Derived values retain formulas and input references.
5. Fund mandates are configuration.
6. Methodology changes are versioned.
7. External providers are isolated behind interfaces.
