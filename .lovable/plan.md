# Footer "forget me" styling update

## Goal
Make the "forget me" action in the footer visually match the preceding description line and add an underline.

## Changes

1. **Update `src/components/AppFooter.tsx`**:
   - Change the "forget me" button color from `text-destructive` to `text-muted-foreground` so it matches the description line.
   - Change `hover:underline` to `underline` so the underline is always visible, while keeping `underline-offset-2`.

## Out of scope
- No copy changes.
- No functional change to the "forget me" behavior or dialog.
