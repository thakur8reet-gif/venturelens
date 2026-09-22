# SEC Data Policy

VentureLens distinguishes reported public-company data from synthetic demo inputs.

- SEC-sourced company records use `dataSource: "sec_xbrl"`.
- SEC financial values are stored in the financial period's reporting currency and normalized to the application's numeric representation.
- Each SEC record should retain the issuer CIK and filing-period provenance in `sourceNote`.
- Synthetic demo records must remain explicitly labeled as `synthetic_demo`.
- Calculated metrics must not be presented as reported filing figures.

The application should prefer primary SEC filings when public-company financial data is required.
