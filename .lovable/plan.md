# Make the Confirm screen's constraints selectable and fix group naming

Note: there is no `trailhead-spec.md` in this project, so the naming rule below comes from your message. Naming is applied as you described.

## What's wrong now

- The "Relevant constraints" chips are static labels, not selectable — users can't pick or drop any of them.
- Continue only unlocks after all 7 wellbeing rows are tapped, with no on-screen explanation.
- Section names use "Relevant constraints" / "Wellbeing check" instead of the standard names.

## What to change

1. Constraints become selectable rows, same tap interaction as the wellbeing rows (multi-select, tap to add, tap again to remove). Auto-detected ones start pre-selected; when detection fails all 11 are shown, still selectable, and the user can deselect what doesn't apply.
2. Continue unlocks as soon as at least one category is selected in either section — no requirement to pick from both, no requirement to acknowledge all 7. A quiet hint under the button when nothing is picked yet: "Pick at least one category to continue."
3. Section headers on this screen become "What I need to consider" (constraints) and "What I care about" (wellbeing) — matching the Dealbreaker screen. Those names stay the same everywhere in the flow; only the Report keeps "Constraint / What I need to consider" and "Wellbeing / What I care about" on first appearance, then the short forms.
4. What carries forward to Rating and Weighting is exactly what the user selected here, instead of the current "all detected constraints + all 7 wellbeing".

## Technical notes

- `src/routes/confirm.tsx`: replace the read-only chip list with the same row component pattern used for wellbeing; keep one `selected` set covering both groups; seed it from the classifier result once the query resolves; pass `footerHint` and `continueDisabled={selected.size === 0}`; call `setRelevantCategories([...selected])` in `onBeforeContinue`, in registry order.
- `src/i18n/en.json`: rename `confirm.detectedTitle` / `confirm.wellbeingTitle` to the two standard names, update their hint strings, add `confirm.gateHint`.
- Report strings (`report.constraintFull`, `report.wellbeingFull`, short forms) stay untouched.
- No change to scoring, the flow store shape, or the classifier server function.
