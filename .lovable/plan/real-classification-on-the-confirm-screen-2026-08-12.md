# Real classification on the Confirm screen

Replace the Confirm screen's hardcoded 5-category stub with a real AI classification of the user's decision text, using your own OpenAI key (`gpt-4o-mini`). Scoring stays untouched.

## Where the secret lives

This app doesn't run Deno edge functions — server-side code runs as TanStack Start server functions on the app's own backend. The equivalent of the Supabase secrets panel is Lovable's secret store: I'll open a secure form in chat where you paste `OPENAI_API_KEY`. The value goes straight into the encrypted store, never into the chat or the repo, and becomes `process.env.OPENAI_API_KEY` available only inside server handlers. No Supabase connection is needed for this step.

## What gets built

- A server function `extractConcerns` holding your classifier verbatim in spirit: same system prompt, same 18-category taxonomy, `gpt-4o-mini`, `temperature: 0`, JSON-object response format, strict schema validation, 3 total attempts with 300ms/900ms backoff, and the same fail-open behaviour (full 11-constraint list on failure, empty list on blank input, 4000-char input cap). CORS and the OPTIONS preflight are dropped — same-origin RPC doesn't need them.
- Confirm screen calls it with the decision text from the flow store on mount, showing a loading state while it runs, then rendering the returned constraint categories as the chips that today are stubbed.
- Wellbeing rows, acknowledgement gating, and the Continue behaviour stay exactly as they are.
- If the call falls back, the screen still works — it just shows the full constraint list; a quiet note tells the user the list is broad because auto-detection didn't complete.
- If the classifier succeeds but returns zero constraint categories (nothing in the text touched one), the chips area is not left blank: it shows a short note saying no specific constraints were detected and that the wellbeing questions below still apply. Continue stays gated only on the 7 acknowledgements, so an empty constraint list never blocks the flow.

- All new copy (loading, fallback note) goes into `src/i18n/en.json`; no literal strings in JSX.

## Technical notes

- `src/lib/extract-concerns.functions.ts` — `createServerFn({ method: "POST" })` with an input validator on `{ userMessage: string }`; the OpenAI fetch, prompt, retry loop, and validation live in `src/lib/extract-concerns.server.ts` so the server-function module stays a thin wrapper.
- `process.env['OPENAI_API_KEY']` is read inside the handler, never at module scope.
- The function returns `{ categories, source }` where `categories` are the exact spec names; a name→ID map in `src/lib/categories.ts` translates them to existing registry IDs (e.g. `"Risk & Uncertainty"` → `risk`). The map keys are copied verbatim from `extract-concerns.ts` / the classifier's own `VALID_CATEGORIES` list — including the comma form `"Values, Identity & Ethics"`, which is also what `src/i18n/en.json` already uses. The slashed "Values/Identity & Ethics" spelling in Project Knowledge is a typo and will not be used anywhere. Unknown names are ignored.
- Confirm uses `useServerFn` + `useQuery` keyed on the decision text (not a route loader — the route is public and prerendered).
- `setRelevantCategories` on Continue keeps its current shape: detected constraint IDs + all 7 wellbeing IDs, so Rating/Weighting/Report need no changes.
