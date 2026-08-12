# Report screen

Build the final screen of the flow, showing real numbers computed from the ratings and weights already captured in the flow store.

Note: `src/lib/scoring.ts` does not exist in the project yet (the message referred to pasting its contents, but none arrived). It will be created here implementing exactly the agreed math: per category, rating (-5..+5) × weight (0..5), summed raw into each option's total and into its constraint / wellbeing subtotals — no normalization.

## Sections, top to bottom

1. **Headline** — both options' total weighted scores side by side, using the option labels entered on the Input screen. Identical, neutral styling for both; neither is highlighted, ranked, or marked as the answer.

2. **Group breakdown** — per option, the subtotal split into its two groups. The first time each group name appears on this screen it reads "Constraint / What I need to consider" and "Wellbeing / What I care about"; every later appearance is just "Constraint" and "Wellbeing".

3. **Dealbreaker callout** — rendered only when at least one dealbreaker category was picked. Distinct background and border so it reads as separate from the score sections; lists plainly which categories were flagged.

4. **Full breakdown** — collapsed by default behind a "See full breakdown" toggle. When open, lists all 18 categories × both options. Categories that were part of this session show their rating and weight numbers; categories never rated show a "Not rated" placeholder row rather than being omitted.

## Technical notes

- New `src/lib/scoring.ts` exporting `computeScore(ratings, weights, relevantCategories)` returning, per option, `total`, `constraintSubtotal`, `wellbeingSubtotal`, and a per-category array of `{ id, rating, weight, contribution, rated }`. Pure function, no backend.
- `src/routes/report.tsx` renders inside `StepScreen` and consumes `useFlow()`. It keeps the shared shell's existing footer (the "Start over" state shown on the last step) — no `hideFooter`, no custom footer.
- "Start over" clears the flow store before navigating to `/`. The store already has a `reset()` action that restores the initial state (decision, options, relevantCategories, ratings, weights, dealbreakers); it will be exposed as `resetFlow()` for clarity, and `StepScreen` gains an optional handler on the "Start over" control so Report can call it on tap.
- Toggle state is local `useState`; the collapsed content is not rendered until opened.
- All new copy added to `src/i18n/en.json` under `report.*` keys, including the two long-form group labels, their short forms, the "Not rated" placeholder, the toggle label, and the dealbreaker callout heading. No literal strings in JSX.
- Mobile-first, existing design tokens only.
