# Confirm copy fixes + Report alignment

## Step 2 of 6 (Confirm)

- Screen description becomes: "Select all factors you need to weigh under these two categories."
- "What I need to consider" description becomes: "Tap the ones that need to be considered."
- No pre-selection: the auto-detection result no longer ticks any row, so the counter starts at "0 of 11 selected". Detection still runs quietly but does not change the selection.
- Loading/fallback/none variants of that description are dropped in favour of the single line above.
- "What I care about" section: unchanged.
- Continue still unlocks after at least one selection in either section.

## Report page

- Score squares: the two cards get a shared grid so the option name block has one fixed height and the numbers sit on the same visual line regardless of how long an option name is. Nothing else about their styling changes, so neither option looks favoured.
- "Where the score comes from": both boxes always use the full labels "Constraint / What I need to consider" and "Wellbeing / What I care about". The shortened second-use labels are removed.

## How the total score is calculated

For each category you selected: rating x weight, added up.

Example — two categories selected:

```text
Money      Option A rating +4, Option B rating -2, weight 5
Health     Option A rating -1, Option B rating +3, weight 3

Option A total = (+4 x 5) + (-1 x 3) = 20 - 3 = +17
Option B total = (-2 x 5) + (+3 x 3) = -10 + 9 = -1
```

Constraint and Wellbeing subtotals are the same sums split by which group each category belongs to. Ratings run -5..+5, weights 0..5, so weight 0 removes a category from the result. Categories you did not select contribute 0.

## Technical notes

- `src/i18n/en.json`: update `confirm.description`, `confirm.detectedHint`; remove now-unused `confirm.detectedLoading` / `detectedFallback` / `detectedNone` usage.
- `src/routes/confirm.tsx`: delete the pre-tick effect and the conditional hint/loader branches; keep the query so classification stays available for later use.
- `src/routes/report.tsx`: give the total cards a consistent label block height; replace `groupLabel()` progressive shortening with the constant full labels; `report.constraintShort` / `report.wellbeingShort` strings removed.
