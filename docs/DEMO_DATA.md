# Demo Dataset

The demo dataset intentionally contains a mixture of synthetic startup records and SEC-reporting public companies.

Synthetic records are retained for deterministic product demonstrations. SEC records are tagged separately so the application can expose their provenance.

When extending the dataset:

- use stable IDs and slugs;
- keep period-end dates in ISO format;
- store monetary values consistently;
- do not label synthetic numbers as reported;
- add the issuer CIK and filing period to SEC provenance notes.
