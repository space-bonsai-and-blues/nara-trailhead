# Screen flow, routing, and i18n shell

Set up the six-step navigation skeleton with placeholder screens and a strict "no hardcoded strings" rule from day one.

## Screens and order

```text
/ (Input) → /confirm → /rating → /weighting → /dealbreakers → /report
```

Each screen is a placeholder: a title, a short description line, a Back and a Continue button wired to the neighbouring step. No real form logic, validation, or data yet.

## Navigation shell

- Shared step layout used by all six screens: compact mobile-first container, step counter ("Step 2 of 6"), progress bar, page title.
- Continue moves forward, Back moves back; the first screen has no Back, the last shows "Start over" returning to Input.
- Direct URL access to any step works (no gating yet).

## i18n shell

- One source file `src/i18n/en.json` holding every user-facing string keyed by ID (e.g. `input.title`, `common.continue`, `report.body`).
- A tiny `t("key")` helper plus a `useTranslation()` hook reading from a locale registry, so adding `fr.json` later is a one-line change.
- Rule going forward: no literal user-facing text in JSX — including button labels, aria-labels, page titles, and route `head()` metadata (titles/descriptions come from the same keys).

## Styling

Mobile-first, clean and minimal: generous whitespace, single-column layout capped at a comfortable reading width, muted neutral palette with one accent, large tap targets. All colors via semantic design tokens in `src/styles.css` — no hardcoded color utilities.

## Technical notes

- Route files under `src/routes/`: `index.tsx` (Input) replaces the placeholder page, plus `confirm.tsx`, `rating.tsx`, `weighting.tsx`, `dealbreakers.tsx`, `report.tsx`.
- Navigation with TanStack `<Link>` / `useNavigate`; step order defined once in a `steps.ts` config that the shared layout and nav buttons both read, so reordering later is a single edit.
- Each route defines its own `head()` (title/description/og) sourced from the strings file.
- No backend, no state persistence in this pass.
