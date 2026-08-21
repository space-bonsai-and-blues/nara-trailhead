# Update footer copy

## Goal
Change the persistent footer text so it reads:

> Trailhead keeps a private record of this session to help improve the app · forget me

## Changes

1. **Update English strings** in `src/i18n/en.json`:
   - `footer.forgetMeDescription` → `Trailhead keeps a private record of this session to help improve the app`
   - `footer.forgetMe` → `forget me` (lower-case, as requested)
   - Leave `footer.forgetMeConfirm` and `footer.forgetMeDone` unchanged unless visual review suggests they need tightening.

2. **Verify layout** in `src/components/AppFooter.tsx`:
   - The component already pulls `footer.forgetMeDescription` and `footer.forgetMe` from i18n, so no JSX change is required.
   - Because the new description is longer, check that the footer still renders cleanly on the current mobile-first layout and does not push the action button into an awkward position.

3. **Out of scope for this plan**:
   - Other locale files. The requested copy is in English; translations for the 21 remaining locales can be handled separately if needed.
   - Any functional change to the "forget me" behavior (deletion logic, dialog text, etc.).
