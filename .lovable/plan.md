# Rating and Weighting screens

Replace the two placeholders with real UI, backed by a new shared flow store.

## Flow store

A React context provider mounted in the root layout holds everything the flow needs:

- `decision`, `optionA`, `optionB` (from Input)
- `relevantCategories` — the category IDs this decision is evaluated on
- `ratings` — per category, per option, a value from -5 to +5 plus a "touched" flag per marker
- `weights` — per category, 0-5
- `dealbreakers` — reserved for the next screen

The provider lives above the router outlet, so navigating between steps (including a
Dealbreaker → Rating round-trip) never resets values. Input and Confirm move their local
state into the store. `relevantCategories` starts empty and is written by the Confirm screen
on Continue: the 5 stubbed constraint IDs it displays as chips plus all 7 wellbeing IDs (12
today). Confirm's chips are therefore the actual source of what Rating and Weighting page
through, and swapping the stub for real classification later changes only that list.

## Rating screen (/rating)

One category at a time, paged within the step (not a long scroll).

Each view shows:

- The category name and its prompt
- A horizontal track from -5 to +5 with 0 marked as the neutral centre
- Two markers, labelled with the actual option text the user typed on Input

Interaction is tap-to-select-then-drag: tapping a marker makes it active (visually
distinguished), and only the active marker responds to dragging or arrow keys. The other
marker stays put until it is separately tapped. A marker becomes "touched" once it has been
selected and released at least once — including a release back at neutral. Untouched markers
render visually distinct (outlined/muted) from touched ones.

"Next" advances to the next category, or to Weighting on the last one, and is disabled until
both markers in the current view are touched. "Back" steps to the previous category, or to
Confirm from the first. Values write to the store as they change, so returning to a category
shows the previous positions and touched state.

## Weighting screen (/weighting)

Same category list, same one-at-a-time paging.

Each view shows the category name and a row of six tappable numbers, 0 through 5, left to
right. Tapping selects one; tapping another moves the selection. There is no default
selection, and "Next" is disabled until a number is tapped for the current category. Labels
for "doesn't matter" (0) and "matters a lot" (5) sit below the row, not inside the buttons.

Missing rating data never crashes this screen — it renders independently of Rating's values.

## Technical notes

- New `src/lib/flow-store.tsx` (context + provider + `useFlow()` hook), mounted in
  `src/routes/__root.tsx`.
- New `src/components/RatingSlider.tsx` — pointer-event based track with the two markers,
  keyboard accessible, `role="slider"` with aria value/label per marker.
- New `src/components/NumberScale.tsx` — the 0-5 tap row.
- Both routes manage a local `categoryIndex` for paging and render inside `StepScreen`,
  which gains optional `onNext` / `onBack` handlers and sub-step progress so the header
  counter can read "Category 3 of 18".
- All new copy goes into `src/i18n/en.json` and is read through `t()`; no literal strings in
  JSX. Colors use existing semantic tokens only, including active/selected states.
- Input and Confirm are updated to read and write the store instead of local `useState`.
