# Trailhead app

Hi Lovable, we're starting a new app:
Set up the app's screen flow and routing — no real logic yet, just navigation between placeholder screens in this order: Input → Confirm → Rating → Weighting → Dealbreaker Check → Report. Mobile-first, clean minimal styling. From this screen onward, every user-facing string must be pulled from a single strings/translation object (e.g. one en.json keyed by string ID) — never hardcoded directly in JSX — so the i18n shell stays translation-ready without a later rewrite.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nara-trailhead.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/73f94b06-8dcb-4dcc-81db-cc0cb1ae943f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
