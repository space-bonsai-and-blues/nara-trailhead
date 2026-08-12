# Dealbreaker Check screen

A deliberate pause between Weighting and the Report: ask whether anything outweighs the score, and only then reveal the category picker.

## Flow

```text
Weighting -> Dealbreaker gate
   "No, I'm clear."   -> leave dealbreakers as-is -> Report
   "Actually, yes"    -> picker (all 18, grouped, multi-select)
                          -> "Take a new round of evaluation" -> merge picks into relevant list -> Rating
                          -> "Ready for final summary"        -> Report
```

## Screen behaviour

1. Gate prompt: "Before you decide — does anything here outweigh the score?" with "Actually, yes" and "No, I'm clear."
2. The picker is not rendered at all until "Actually, yes" is tapped — no disabled or greyed placeholder in the DOM.
3. Revealed picker shows two grouped sections: "What I need to consider" (11 constraint categories) and "What I care about" (7 wellbeing categories). Multi-select rows with a checked state. Categories already in the relevant list carry a subtle "already rated" indicator so new picks are obvious.
4. The two action buttons appear only after at least one pick.
   - "Take a new round of evaluation": save picks, merge any not-yet-relevant picked IDs onto the end of the relevant list (never remove or reorder existing ones), then go to Rating. Newly merged categories show up as untouched/unweighted; every prior marker value and weight stays exactly as it was.
   - "Ready for final summary": save picks, go to Report. No merge.
5. "No, I'm clear." overwrites the saved picks to empty and goes straight to the Report.
6. Re-entry (Back from the Report, or arriving again after a new round) always resets the gate to unanswered. If "Actually, yes" is tapped again, previously saved picks show pre-checked.

## Technical notes

- Flow store: change `dealbreakers` to a `string[]` of category IDs (the current `Record<string, OptionKey[]>` shape isn't used anywhere yet) with a `setDealbreakers(ids)` setter, plus a `mergeRelevantCategories(ids)` action that appends only missing IDs.
- `src/routes/dealbreakers.tsx`: local `answer` state (`null | "yes" | "no"`), reset on mount so re-entry re-asks; local selection set seeded from the store. Uses `StepScreen` with `onBack` to Weighting and its footer suppressed/replaced by the contextual buttons.
- Picker reads `constraintCategories` and `wellbeingCategories` from `src/lib/categories.ts` — no new category definitions.
- Rating and Weighting need no changes: both already page off `relevantCategories`.
- All new copy (gate prompt, both gate buttons, group headers, both action labels, "already rated" indicator) goes into `src/i18n/en.json` and is read through `t()` — no literal strings in JSX. Semantic tokens only for selected/already-rated states.
