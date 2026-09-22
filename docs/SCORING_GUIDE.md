# Scoring Evidence Model

VentureLens separates analytical dimensions from evidence quality.

A dimension can be:

- **high confidence** when multiple relevant reported inputs are available;
- **medium confidence** when the conclusion relies on a smaller set of reported or calculated inputs;
- **low confidence** when material inputs are missing or indirect;
- **none** when the dimension cannot be evaluated.

Missing data should reduce confidence rather than be silently imputed.
