# Confirm scoring.ts alignment

## What this plan does
Verify that the existing `src/lib/scoring.ts` matches the standalone scoring module the user provided, and document the equivalence. No behavior change is required.

## Current state
- `src/lib/scoring.ts` already computes `rating × weight` per category, sums into option totals, and splits into `constraint` / `wellbeing` subtotals.
- It reads `ratings`, `weights`, and `relevantCategories` from the flow store and uses the category registry for group typing.
- The Report screen consumes this via `computeScore(...)`.

## Proposed work
1. Add a short header comment in `src/lib/scoring.ts` noting that the implementation follows the deterministic scoring spec (raw `rating × weight`, no normalization).
2. Run `bun run lint` and `bun run build:dev` to confirm nothing is broken.

## Out of scope
- No interface changes to `computeScore`.
- No changes to the Report screen or flow store.
