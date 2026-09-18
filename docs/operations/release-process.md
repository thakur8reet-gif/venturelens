# Release Process

VentureLens is developed in phases and released through small, reviewable commits.

## Required checks

- TypeScript build passes.
- Unit tests pass.
- Data-model migrations are reviewed.
- Methodology changes are documented.
- No secrets or real customer data are committed.
- Synthetic data is clearly labeled.

## Versioning

Feature-set and model versions are independent from application versions. A change to analytical methodology must increment the relevant methodology version and preserve historical analysis records.
