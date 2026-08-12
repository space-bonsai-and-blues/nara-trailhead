# Tell people why Continue is greyed out on the Input screen

## What's happening now

Continue only turns on when all three fields have content: the decision description, Option A, and Option B. In the current preview session the decision box is empty (only the two option fields were filled), so the button stays grey. The screen gives no explanation, which reads like a bug.

## What to change

Show a short hint just above the footer buttons whenever Continue is disabled, naming what is still missing, e.g.:

- "Add your decision description to continue."
- "Name both options to continue."
- "Fill in all three fields to continue." (when more than one is missing)

Also mark the empty required fields subtly (muted helper text under the field) so the target is obvious.

No change to the gating rule itself: all three fields stay required.

## Technical notes

- `src/routes/index.tsx`: derive the list of missing fields from `decision`, `optionA`, `optionB`; pass the matching message into the existing `footerHint` prop of `StepScreen` when `canContinue` is false.
- `src/i18n/en.json`: add `input.hintDecision`, `input.hintOptions`, `input.hintAll` — no hardcoded strings in JSX.
- No changes to `StepScreen`, the flow store, or any scoring logic.
