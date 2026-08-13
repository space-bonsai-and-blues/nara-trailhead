# Make "What I need to consider" selectable on Confirm

Right now the constraint categories on Step 2 render as plain text chips — nothing to tap. Only the wellbeing rows below are interactive.

## What changes

- Constraints become the same tappable rows as the wellbeing list: title, short description, check circle, multi-select.
- Rows the classifier detected start pre-selected; the user can deselect any of them and select others from the full 11-constraint list.
- The full list of 11 is shown so nothing relevant is hidden when auto-detection is off or returns nothing.
- Only the constraints that are still selected (plus all 7 wellbeing categories) carry forward to Rating and Weighting.
- The Continue gate stays as it is: all 7 wellbeing prompts must be acknowledged, with the existing hint under the button. Constraint selection is optional — picking none is valid.
- Copy under the header changes to reflect the new behaviour: detected items are pre-ticked, tap to add or remove.

## Technical notes

- `src/routes/confirm.tsx`: replace the chip block with the same row component the wellbeing section uses (extract a small shared `CategoryRow`), add a `selectedConstraints` state seeded from the query result via an effect, render `constraintCategories` (all 11), and pass the selected IDs into `setRelevantCategories` in `onBeforeContinue`.
- `src/i18n/en.json`: update `confirm.detectedHint` / `confirm.detectedFallback` / `confirm.detectedNone` wording for the selectable list.
- No change to the classifier, scoring, flow store, or later screens.
