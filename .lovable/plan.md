# Step 8 — Persistent header with language switcher

## Where language state lives

A new `LocaleProvider` (React context) mounted in `src/routes/__root.tsx`, wrapping `FlowProvider`. It is kept separate from the flow store so a language switch can never touch decision text, ratings, weights, or dealbreaker picks — the flow store is not re-created or reset when the locale changes.

- Default locale: `en`.
- Persisted to `localStorage` under one key, read in a `useEffect` after hydration (avoids SSR mismatch), so it survives every screen change in the session and page reloads.
- `useTranslation()` in `src/i18n/index.ts` changes from "always English" to "reads the active locale from context", so every existing screen re-renders in the new language with zero per-screen edits. The standalone `t()` export stays as-is for route `head()` metadata (English titles/descriptions, evaluated outside React).

## Locale registry

`src/i18n/index.ts` currently imports only `en.json`. It gets all 22 files registered in one place, plus a `localeMeta` table:

```text
code       autonym         english name
en         English         (shown as just "English")
th         ไทย             Thai
vi         Tiếng Việt      Vietnamese
id         Bahasa Indonesia  Indonesian
ms         Bahasa Melayu   Bahasa Malaysia
ta         தமிழ்            Tamil
zh-Hans    简体中文         Chinese, Simplified
zh-Hant    繁體中文         Chinese, Traditional
lo         ລາວ             Lao
my         မြန်မာ           Burmese
km         ខ្មែរ             Khmer
ja         日本語           Japanese
ko         한국어           Korean
hi         हिन्दी            Hindi
ne         नेपाली           Nepali
fil        Filipino        Filipino
mn         Монгол          Mongolian
tet        Tetun           Tetum
si         සිංහල           Sinhala
bn         বাংলা            Bengali
ur         اردو            Urdu
pt         Português       Portuguese
```

The switcher renders this registry, so it lists exactly what exists in `src/i18n/` — adding or removing a file changes the list with no other edit. Entries display as `Autonym (English name)`, English as just `English`.

## Persistent header

New `src/components/AppHeader.tsx`, rendered once in `__root.tsx` above `<Outlet />` so it appears on every screen (Input, Confirm, Rating, Weighting, Dealbreaker, Report) rather than being added per route.

- Sticky top bar, same `max-w-md` mobile-first container as the screens, using existing semantic tokens (`bg-background/border-border`, backdrop blur).
- Left: the Trailhead wordmark (`app.name`). Right: the language switcher.
- `StepScreen` gets a small top-padding adjustment so its step-progress row sits below the new bar; no other structural change to the screens.

## Switcher UI

- shadcn `DropdownMenu` trigger showing a globe icon plus the current locale's short autonym; the menu is scrollable (max height) with 22 rows, current locale check-marked.
- Each non-English row: language label, then a small ⓘ button. Tapping ⓘ opens a `Popover` (tap-to-reveal, works on touch; not an always-visible inline note) containing exactly:
  `"<English name> · AI-translated, not yet reviewed for accuracy"`.
  This string is hardcoded English in the component and never routed through the translation files, for every language including when the UI is displayed in that language. The ⓘ tap does not select the language.
- Urdu is listed and marked identically to the others; no RTL handling, no `dir` switching in this pass.

## Fonts

Add Google-hosted Noto families via `<link>` tags in the `__root.tsx` `head().links` (Tailwind v4 forbids remote `@import` in `styles.css`): Noto Sans, Noto Sans Thai, Lao, Myanmar, Khmer, Tamil, Devanagari, Sinhala, Bengali, Arabic, and Noto Sans SC/TC/JP/KR. Then extend `--font-sans` in the `@theme` block of `src/styles.css` to a stack listing the existing display font first and the Noto families as fallbacks, so any script resolves to a font that covers it. Loaded with `display=swap`, weights limited to 400/500/600 to keep the payload reasonable.

## Out of scope

RTL layout for Urdu, edits to any translation JSON content, and localizing the ⓘ marker copy.
