# Data Sources and Provider Strategy

VentureLens deliberately separates provider access from financial analysis.

## Provider contract

Providers implement a small discovery interface and return canonical Startup records or raw provider records. Provider-specific response shapes must not leak into the feature engine.

## Production data

The demo provider is synthetic and exists only for deterministic development/testing. Production deployments should configure licensed/public sources appropriate to the target market and comply with their terms.

## Source hierarchy

1. Regulatory/company filings where available.
2. Company-provided primary materials.
3. Reputable structured data providers.
4. Secondary research for context.
5. Model-generated estimates, explicitly marked as estimates.

No source is silently treated as authoritative for every field.
