# VentureLens Project Reference

This document is the long-term handover note for future development.

## Product

VentureLens is a VC intelligence workflow:

Deal discovery -> startup screening -> fund matching -> diligence -> investment memo

It is designed for analyst prioritization, not automated investment decisions.

## Core technical decisions

- Frontend/application: Next.js + TypeScript.
- Deployment target: Vercel.
- Persistence target: PostgreSQL via Prisma.
- Financial calculations: deterministic TypeScript domain library.
- External data: adapter interfaces.
- AI/research: evidence-backed layer separate from the financial truth layer.
- Methodology: versioned.
- Missing data: null/unknown, never zero.

## Current version

Application foundation: 1.0.0
Feature set: 1.0.0
Screening model: 1.0.0

## How to change the system safely

### Changing a feature

1. Read docs/methodology/feature-engineering-v1.md.
2. Update the feature definition and formula.
3. Add or modify deterministic tests.
4. Increment the feature-set version.
5. Update provenance behavior if inputs change.
6. Review downstream scoring and memo behavior.

### Changing screening

1. Read docs/methodology/recommendation-model-v1.md.
2. Keep dimensions separate and explainable.
3. Do not silently turn missing evidence into a positive or negative signal.
4. Increment the model version.
5. Preserve historical analyses.

### Changing data providers

Implement a new provider adapter under src/lib/ingestion. Do not put provider-specific payload assumptions into the feature engine.

### Adding AI

Keep the model behind the research/evidence boundary. The LLM may extract, summarize, retrieve, and draft; it must not silently become the source of financial truth.

## Demo data

The demo startup records are synthetic fixtures for development and tests. Replace them with licensed/public production sources before making real-world claims.
