# VentureLens

**Live deployment:** https://venturelens-tau.vercel.app/

Explainable venture capital investment intelligence platform.

VentureLens is a production-oriented foundation for VC deal sourcing, startup analysis, fund matching, diligence, and investment-memo workflows.

IMPORTANT: Included company records are synthetic demonstration data. They are not real investment recommendations and must not be represented as real market data.

## What is built

- Versioned feature-engineering contracts for growth, unit economics, capital efficiency, financial quality, market, valuation, fund fit, and risk.
- Deterministic financial calculations with explicit formulas and missing-data handling.
- Dimension-level explainable screening instead of an opaque single score.
- Configurable fund mandates for sector, geography, stage, cheque range, and growth requirements.
- Provider interfaces and a discovery pipeline designed for replaceable production data sources.
- PostgreSQL/Prisma persistence model with source provenance and reproducible analysis versions.
- Next.js analyst dashboard designed for Vercel.
- Evidence-driven diligence questions and investment memo generation.
- CI configuration and tests for the financial engine.

## Architecture

External providers -> ingestion -> normalization -> feature engine -> screening/fund match -> diligence/evidence -> investment memo -> Next.js analyst UI -> Vercel.

## Repository layout

src/app: Next.js UI and API routes
src/components: reusable UI
src/lib/domain.ts: domain contracts
src/lib/features.ts: deterministic feature engine
src/lib/scoring.ts: explainable screening
src/lib/analysis.ts: analysis orchestration
src/lib/ingestion: provider and discovery pipeline
src/lib/research: evidence, diligence, memo layer
prisma/schema.prisma: PostgreSQL data model
docs: architecture, methodology, data sources, operations and project handover
tests: deterministic feature and screening tests

## Local setup

Requirements: Node.js 20+, PostgreSQL 15+.

1. Copy .env.example to .env.
2. Set DATABASE_URL.
3. Install dependencies with npm install.
4. Generate Prisma client with npm run db:generate.
5. Apply the schema with npm run db:migrate.
6. Run tests with npm test.
7. Start development with npm run dev.

The current UI uses deterministic synthetic data so it can run without third-party data-provider credentials.

## Methodology

VentureLens distinguishes reported facts, calculated metrics, estimated values, company claims, and unavailable evidence.

Missing values remain unknown. They are never converted to zero.

Every persisted analysis records a feature-set version and model version. This enables methodology changes without silently rewriting historical analyses.

## Real data

Phase 8 adds a zero-cost SEC EDGAR ingestion path. The ingestion job is server-side, stores source provenance, and persists annual public-company financial facts. Synthetic demo data remains separate from ingested market data.

## Production roadmap

1. Connect licensed/public company and funding data providers.
2. Add authentication and role-based access.
3. Add production PostgreSQL repositories to the API layer.
4. Expand ingestion with durable jobs, retries, rate limits, and provider monitoring.
5. Add comparable-company and market-data services.
6. Add document ingestion, retrieval, and citation-backed research.
7. Add scenario analysis and portfolio workflows where supported by evidence.
8. Harden security, privacy, audit logging, and operational controls.

## Disclaimer

VentureLens is an analytical workflow and research tool. It does not provide personalized investment advice, guarantee outcomes, or predict investment returns.
