# Data Provenance

Every startup record should make its evidence class visible.

| Source | Meaning |
| --- | --- |
| `sec_xbrl` | Public-company filing data sourced from SEC reporting |
| `synthetic_demo` | Deliberately synthetic data used for product demonstrations |
| `other` | Data obtained from another documented source |

Derived metrics use `calculated` evidence and retain their formula and input names.

The UI should distinguish reported, calculated, estimated, company-claimed, and unavailable values.
