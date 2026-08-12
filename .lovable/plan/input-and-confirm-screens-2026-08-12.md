# Input and Confirm screens

Replace the two placeholder screens with real UI. Still no backend or classification logic — the Confirm screen's constraint categories are stubbed.

## Input screen (`/`)

- Free-text box: "Describe your decision" — multi-line, generous height, placeholder copy from the strings file.
- Two labelled fields, "Option A" and "Option B" — exactly two, fixed, no add/remove control.
- Single "Continue" action at the bottom of the existing step shell (no Back, since this is step 1).
- Continue is disabled until the description and both option fields have text.

## Confirm screen (`/confirm`)

Two sections under the step header.

**Relevant categories (stub)** — a small set of pill/chips showing: Time, Money, Effort, Quality, Risk & Uncertainty. Labelled as auto-detected for this decision, with a short note that this is provisional. Real classification picks from the full 11-category set later.

**Wellbeing categories** — a scrollable list, one compact row each, in this order:

```text
Enjoyment & Satisfaction   Would you actually look forward to this, day to day?
True Passion               Is this something you'd care about even if no one was watching or paying you for it?
Social & Relational        How would this affect your relationship with the people close to you?
Values, Identity & Ethics  Does this sit right with who you are?
Accomplishment             Would this feel like real progress to you?
Health                     What would this do to your health — body or mind?
Financial Stability        Would this leave you feeling steady, or on edge, financially?
```

- Each row is its own tap target: tapping marks it acknowledged (tick appears, row dims); tapping again undoes it.
- No single confirm-all button, no full-screen cards — rows stay inline in the list.
- A quiet counter shows progress ("3 of 7 acknowledged").
- Continue stays disabled until all 7 rows are acknowledged.

## Technical notes

- All new copy — labels, placeholders, prompts, counter text, disabled hints — goes into `src/i18n/en.json` and is read via `t()`. No literal strings in JSX.
- `StepScreen` gains an optional `children` slot (replacing the dashed placeholder box) and optional props to control the Continue button's disabled state, so both screens keep the shared header/progress/footer.
- Screen state is local `useState` for now; wiring it to shared decision state comes with the later steps.
- `src/lib/categories.ts` defines the complete source of truth for all 18 categories: 11 constraint categories and 7 wellbeing categories. Each entry carries an ID, type (`constraint` | `wellbeing`), and string-key references for title and description.
- The Confirm screen's stubbed "relevant categories" are just a hardcoded array of 5 constraint IDs (`Time`, `Money`, `Effort`, `Quality`, `Risk & Uncertainty`) selected from that full set. Later screens (Rating, Weighting, Dealbreakers, Report) will read variable subsets from the same module without adding new category definitions.
- Styling stays mobile-first with semantic tokens only; rows use card/border/muted tokens and a `min-h-12` tap target.
