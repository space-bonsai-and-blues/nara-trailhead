# Close public sign-up

Now that you have signed in and claimed admin access, public account creation will be removed from the app.

## What will change

1. **Auth page (`src/routes/auth.tsx`)**
   - Remove the "Create account" / sign-up mode.
   - Remove the "Need an account? Create one" switch link.
   - Keep **Sign in** and **Forgot password** working exactly as before.
   - Default the page to sign-in only.

2. **Translations (`src/i18n/en.json` and other locale files)**
   - Keep existing sign-up keys so they remain available if you ever re-enable sign-ups, but add a new sign-in-only hint if useful.
   - No hardcoded English copy in JSX.

3. **Header (`src/components/AppHeader.tsx`)**
   - No change needed: the "Sign in" link still points to `/auth` for existing users who need to sign in.

## Out of scope

- This change is UI-level. It removes the sign-up form from the app; it does not reconfigure the backend auth provider, because Lovable Cloud does not expose that control.
- If you later want an admin toggle to re-open sign-ups, that can be added as a separate task.

## Verification

- Open `/auth` in the preview: only email/password sign-in and "Forgot password?" should appear.
- "Need an account? Create one" should no longer be visible.
- Existing admin sign-in continues to work.
