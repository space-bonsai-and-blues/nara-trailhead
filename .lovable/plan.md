# Fix: admin dashboard 404 on the live URLs

## What's happening

The admin dashboard route exists in the project (`/admin-dashboard`, behind the signed-in area), along with `/auth` and `/claim-admin`. But the live site was last published before the admin/auth work was added, so the deployed version simply doesn't contain those pages — hence 404 on both the Lovable URL and the custom domain.

## The fix

Re-publish the project. This pushes the current version (including auth, claim-admin, and the admin dashboard) to:

- https://nara-trailhead.lovable.app/admin-dashboard
- https://trailhead.naraforest.com/admin-dashboard

No code changes needed.

## Steps

1. Run a security scan and review results before publishing.
2. Publish the current version to the existing slug `nara-trailhead` (custom domain updates automatically).
3. Verify `/admin-dashboard` loads on the published URL and redirects to sign-in when signed out.

## Note

After publishing, visiting `/admin-dashboard` while signed out redirects to the sign-in page — that's expected, not a 404.
