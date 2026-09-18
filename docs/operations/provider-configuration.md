# Provider Configuration

External data providers are adapters, not business logic.

A production provider should implement:

- authentication through environment secrets;
- request retries with bounded backoff;
- rate limiting;
- pagination;
- schema validation;
- source timestamps;
- stable external IDs;
- idempotent upserts;
- provider health metrics.

The application must remain usable with no provider credentials by using the deterministic demo provider in local development.
