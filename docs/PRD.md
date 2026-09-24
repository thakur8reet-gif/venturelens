# VentureLens — Product Requirements Document

## 1. Product summary

VentureLens is an investment-diligence intelligence application for evaluating companies using structured financial evidence, operating metrics, data provenance, and transparent derived analysis.

The product separates reported facts from calculated metrics, estimated values, and company claims so an investor can understand what is known, how it was obtained, and what remains unavailable.

## 2. Problem

Investment research is often fragmented across filings, company materials, financial models, and analyst notes. VentureLens should reduce that fragmentation by providing a consistent company-analysis workflow with explicit evidence and missing-data handling.

## 3. Target users

- Venture capital and growth-investment teams
- Investment analysts and associates
- Founders preparing investor diligence
- Researchers comparing companies across periods

## 4. Product goals

1. Provide a structured company intelligence view.
2. Ingest public-company financial information from SEC EDGAR/XBRL.
3. Preserve source provenance for reported inputs.
4. Calculate useful investment metrics from available inputs.
5. Make unavailable data explicit instead of silently inventing values.
6. Support repeatable comparison and diligence workflows.
7. Keep demo fixtures clearly separated from live data.

## 5. Core user workflow

1. Open the VentureLens dashboard.
2. Browse demo companies or the live SEC universe.
3. Select a company.
4. Inspect reported financial periods and source provenance.
5. Review derived metrics and analytical signals.
6. Identify missing or unavailable evidence.
7. Use the resulting evidence set for investment diligence.

## 6. Data principles

### Source hierarchy

Live public-company financial data should come from authoritative SEC EDGAR/XBRL filings and company facts where available.

### Evidence classification

Each metric should distinguish among:

- `reported` — directly reported by a source
- `calculated` — derived from reported inputs
- `estimated` — explicitly estimated
- `company_claim` — stated by the company but not independently verified
- `unavailable` — required evidence is absent

### Missing data

Missing evidence must remain visible as unavailable. The product must not silently substitute synthetic or fabricated values for missing live data.

### Demo/live separation

`src/lib/demo-data.ts` is for synthetic demonstration fixtures. Live SEC records belong to the SEC ingestion path.

## 7. Functional requirements

### FR-1 Company discovery

Users must be able to browse configured live SEC companies and identify the ticker, company name, sector/geography when available, and data source.

### FR-2 Company detail

Users must be able to open a company-specific intelligence view containing reported financial periods, source information, and derived analysis.

### FR-3 SEC ingestion

The application must retrieve company facts from SEC EDGAR/XBRL for configured public-company tickers.

### FR-4 Financial analysis

The application should calculate supported metrics only when the required inputs are available and valid.

### FR-5 Provenance

Reported financial values must retain a traceable source reference.

### FR-6 Missing-data handling

Unavailable facts must be represented explicitly and must not be replaced with synthetic values.

### FR-7 Demo mode

The application must retain a clearly labeled synthetic demo dataset for development and demonstration.

### FR-8 Validation

Changes to the application must pass the project's automated test and build checks before release.

## 8. Non-functional requirements

- **Reliability:** ingestion failures should surface as controlled errors.
- **Traceability:** analytical outputs should be explainable from their inputs.
- **Maintainability:** ingestion, domain models, analysis, and UI should remain separated.
- **Security:** secrets and credentials must not be committed to the repository.
- **Performance:** company discovery and detail views should avoid unnecessary repeated requests.
- **Correctness:** reported and derived values must never be conflated.

## 9. Out of scope for the current product phase

- Automated investment decisions
- Trading or brokerage execution
- Guaranteed valuation or return forecasts
- Replacing professional investment, legal, or accounting diligence
- Treating synthetic demo data as real company financial data

## 10. Success criteria

The current product phase is successful when:

- A user can discover a live SEC company.
- A user can open its detail page.
- Reported figures are distinguishable from derived metrics.
- Source provenance is visible.
- Missing facts remain explicitly unavailable.
- Demo data remains clearly separated from live SEC data.
- CI validates the application build and tests.

## 11. Future product areas

Potential future phases include additional data providers, richer company comparison, stronger diligence workflows, portfolio-level analysis, and deeper research/AI assistance. These should be added only with explicit provenance and evidence policies.

## 11. Product roadmap

### Phase 1 — Evidence foundation

- SEC EDGAR/XBRL ingestion
- Structured financial periods
- Evidence classification
- Provenance and missing-data handling
- Live company discovery and detail views

### Phase 2 — Diligence intelligence

- Cross-company comparison
- Historical trend analysis
- Expanded operating metrics
- Evidence-backed diligence summaries
- More robust data-quality diagnostics

### Phase 3 — Research platform

- Additional authoritative data providers
- Portfolio-level views
- Research workflows and saved analyses
- Deeper AI-assisted research with source-grounded outputs

## 12. Acceptance criteria

A release satisfies this PRD when the core workflow can be completed without relying on fabricated live-company financial data:

1. A configured SEC company can be discovered.
2. Its detail page loads the company's SEC facts.
3. Reported values are distinguishable from derived values.
4. Source provenance is available for reported inputs.
5. Missing facts remain unavailable.
6. Synthetic demo fixtures remain clearly labeled.
7. Automated tests and the production build pass.
8. A failed external data provider produces a controlled failure rather than silently switching data sources.

