# Spec alignment check — Trailhead v0.5

I compared the spec against the current build. Most of it already matches; five items don't.

## Already aligned (verified in code)

- Six-step flow Input → Confirm → Rating → Weighting → Dealbreaker → Report (`src/lib/steps.ts`).
- Taxonomy: 18 categories, 11 constraint / 7 wellbeing, with the exact spec names, including the comma form "Values, Identity & Ethics" in both the app registry and the classifier prompt.
- The 7 wellbeing prompts on Confirm are verbatim from the spec, one tappable row each, no single bulk-confirm button.
- Rating: dual marker, -5..+5, tap-to-select-then-drag, Next gated per marker so a deliberate neutral counts as touched.
- Weighting: single 0–5 weight per category, nothing else asked.
- Dealbreaker: exact gate prompt and both button labels, picker fully hidden until "Actually, yes", all 18 grouped under "What I need to consider" / "What I care about", multi-select, both follow-up buttons, "new round" preserves prior markers and weights, "No, I'm clear" goes straight to Report.
- Report: side-by-side neutral totals, per-option group subtotals with the combined label only on first mention, conditional set-apart dealbreaker callout, full 18-category detail collapsed behind a toggle.
- Scoring is deterministic `rating × weight`, no AI.
- i18n: every user-facing string comes from `src/i18n/en.json`; no literals in JSX.

## Gaps to fix

1. **Product name.** The app is called "Decidely" throughout (`app.name` and all six route meta titles). The spec names it Trailhead. Rename to Trailhead everywhere.
2. **Confirm group headers.** Confirm uses "Relevant constraints" and "Wellbeing check", while Dealbreaker and Report use the plain-language names. Change Confirm's two headers to "What I need to consider" and "What I care about" so the naming is consistent across the flow. The Report keeps the combined "Constraint / What I need to consider" form on first mention.
3. **Silent gate on Confirm.** Continue stays grey until all 7 wellbeing rows are tapped, with no on-screen reason — the same complaint that came up on the Input screen. Add a hint under the button: "Acknowledge each wellbeing question to continue." No change to the gate itself; the spec requires active dismissal of all 7.
4. **Input requires both options.** Spec says up to two options with two as a hard cap; today Continue requires both option fields filled. Relax to: decision text plus at least one option; the second stays optional, and the Report's Option B column falls back to its placeholder label when empty.
5. **Empty-classification path.** If the classifier returns nothing and the user lands on Rating with no constraints, only the 7 wellbeing categories carry forward. That matches the spec, but the Confirm note should say so plainly rather than reading as an error.

## Technical notes

- Name change: `app.name` and the twelve `*.meta.title` / `*.meta.description` strings in `src/i18n/en.json`; no component changes needed.
- Confirm headers: swap `confirm.detectedTitle` / `confirm.wellbeingTitle` values, add `confirm.gateHint`, pass `footerHint` in `src/routes/confirm.tsx`.
- Input gate: adjust the validity condition and hint strings in `src/routes/index.tsx`; `src/routes/report.tsx` already falls back to "Option B" when the label is blank.
- No changes to scoring, the flow store, the classifier server function, or the category registry.
