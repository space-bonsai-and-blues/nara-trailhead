# Make both Confirm sections selectable (Step 2 of 6)

Right now the constraint categories render as plain text chips — nothing to tap — and the wellbeing rows work as an acknowledge-all gate. Both become the same thing: pick what applies.

## What changes

- "What I need to consider" becomes tappable rows like the wellbeing list: title, description, check circle, multi-select. All 11 are shown.
- Rows the classifier detected start pre-selected; the user can deselect them and select others.
- "What I care about" stays as rows, but they are selections rather than acknowledgements — all 7 shown, none pre-selected.
- Continue enables as soon as at least one category is selected in either section. No requirement to pick from both, and no requirement to touch all 7 wellbeing prompts.
- Footer hint while nothing is picked: "Pick at least one category to continue."
- Only the selected categories carry forward to Rating and Weighting.
- Copy under each header updated: detected items are pre-ticked, tap to add or remove.

## Technical notes

- `src/routes/confirm.tsx`: extract a shared `CategoryRow`, hold one `selected` set covering both groups, seed it from the classifier result via an effect, render `constraintCategories` and `wellbeingCategories` as rows, gate Continue on `selected.size > 0`, pass the selected IDs to `setRelevantCategories` in `onBeforeContinue`.
- `src/i18n/en.json`: update `confirm.detectedHint` / `confirm.detectedFallback` / `confirm.detectedNone` / `confirm.wellbeingHint`, replace `confirm.gateHint` with the pick-one wording; reuse a counter string for each section.
- No change to the classifier, scoring, flow store, Dealbreaker screen, or Report.
