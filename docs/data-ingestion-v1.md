# VentureLens Real Data Ingestion v1

## Objective

Replace synthetic-only data with a reproducible, zero-cost public-data pipeline while keeping the provider boundary open for future licensed private-market sources.

## Current source

SEC EDGAR XBRL Company Facts.

The SEC states that its EDGAR data APIs provide company submissions and extracted XBRL data without API keys. The XBRL APIs are updated as filings are disseminated. VentureLens accesses them server-side because the SEC data API does not support browser CORS.

## Flow

Live API / analyst preview
    -> GET /api/sec/companies

Vercel Cron
    -> GET /api/jobs/ingest/sec
    -> SEC company directory
    -> SEC Company Facts API
    -> validation + normalization
    -> PostgreSQL / Prisma
       -> Startup
       -> FinancialPeriod
       -> Source
       -> SourceFact
       -> IngestionJob
    -> feature engine (next integration step)

The `/api/sec/companies` route exposes the same live SEC adapter without requiring PostgreSQL. This is useful for validating the provider connection in the deployed application before enabling persistence.

## Security

The ingestion endpoint requires CRON_SECRET and SEC_USER_AGENT. The SEC user-agent should identify the operator and include a contact email, following SEC automated-access guidance. Do not commit either value.

## Scope

V1 intentionally ingests a configurable ticker list rather than attempting to ingest every SEC filer on every cron invocation.

Default tickers: AAPL, MSFT, NVDA.

Configure more tickers with SEC_TICKERS, for example:
SEC_TICKERS=AAPL,MSFT,NVDA,AMZN,META

These are real public companies; they are not VC recommendations.

## Financial facts

The first adapter maps standardized annual US-GAAP facts useful to VentureLens: revenue, gross profit, cash, operating cash flow, capital expenditure, and free cash flow derived as operating cash flow minus capital expenditure.

EBITDA is intentionally left unavailable because it is not a consistently standardized SEC XBRL fact across issuers.

## Data lineage

Each ingestion creates a Source record and a SourceFact containing the provider payload. Financial periods are keyed deterministically by SEC company, ticker, and period end so repeated ingestion updates the same financial period.

The current implementation keeps the raw company-facts payload in PostgreSQL to stay at zero infrastructure cost. Object storage can be introduced later without changing the canonical model.

## Local setup

After configuring PostgreSQL, run `npm run db:push` to apply the current Prisma schema without requiring a paid database or migration service.

## Limitations

SEC covers public filers, not the private startup universe. The first pass is annual, not quarterly. The initial adapter does not infer ARR, CAC, LTV, NRR, valuation, or other private-company metrics. Financial methodology must be validated further before live investment use.
