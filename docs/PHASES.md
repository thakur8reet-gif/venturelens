# VentureLens Phase Map

## Phase 0 — Product and architecture
Defined the product boundary, explainability requirement, Vercel/Next.js direction, and separation between financial truth and AI research.

## Phase 1 — Feature engineering
Locked the v1 feature families, formulas, evidence states, applicability and missing-data policy.

## Phase 2 — Domain and data model
Implemented canonical TypeScript domain contracts and a PostgreSQL/Prisma schema for startups, financial periods, funding rounds, funds, sources, facts, feature snapshots, analyses, matches and documents.

## Phase 3 — Financial engine
Implemented deterministic feature calculations and dimension-level explainable screening with fund mandate matching.

## Phase 4 — Deal discovery
Implemented provider interfaces, a deterministic demo provider, normalization boundary, deduplication and discovery pipeline.

## Phase 5 — Analyst application
Implemented a Vercel-ready Next.js analyst dashboard, company analysis pages and JSON API endpoints.

## Phase 6 — Diligence and memo
Implemented evidence contracts, diligence-pack generation and an investment-review memo workflow.

## Phase 7 — Production hardening
Added CI, security/contribution guidance, release process, local PostgreSQL container, Prisma seed, methodology handover and long-term project reference.

## What V1 intentionally does not pretend to have

Real external market/funding data, authenticated multi-user access, production provider credentials, background workers, and a full document RAG system are integration work that must be added with legitimate data sources and deployment infrastructure. The interfaces are designed so those systems can be added without rewriting the deterministic financial engine.
