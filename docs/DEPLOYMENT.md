# Deployment

Signal's static site is built with Astro and served by Cloudflare Pages.

## How it works

- Cloudflare Pages watches the `main` branch of `DevonTallMan/Signal`
- Every push to `main` triggers a build
- Every PR against `main` creates a preview deployment at
  `<commit-hash>.signal-dev.pages.dev`
- Production (when Signal launches): `<domain-to-decide>`
- Preview: `signal-dev.pages.dev`

## Build settings (set in Cloudflare Pages dashboard)

- Framework preset: Astro
- Build command: `npm install && SKIP_KEYSTATIC=true npm run build`
- Build output directory: `dist`
- Root directory: (leave empty)
- Node.js version: 20

## Environment variables

- `SKIP_KEYSTATIC=true` — required. Tells Astro to skip the Keystatic
  admin UI integration so the build produces pure static output with
  no server adapter requirement. Without this, `npm run build` fails
  with `NoAdapterInstalled`.

## Preview site indexing

`public/robots.txt` currently disallows all indexing. This is correct
for the preview URL. When Signal moves to its production domain,
update `robots.txt` to allow indexing of canonical routes.

## The Keystatic admin UI is NOT deployed

By design. `SKIP_KEYSTATIC=true` strips the `/keystatic` route from
the production build. Authoring happens locally via `npm run dev`
(authors still see `/keystatic` on localhost).

If/when remote authoring becomes necessary (multiple contributors
without local dev setups), the pattern is: deploy a second
environment with Keystatic enabled to a separate URL, used only by
authors. The community pattern for this is documented at:
https://keystatic.com/docs/deploying-astro

## First-time setup (already done, here for reference)

1. Cloudflare account at cloudflare.com (free tier is sufficient)
2. Cloudflare dashboard → Workers & Pages → Create → Connect to Git
3. Authorise Cloudflare's GitHub App, scoped to `DevonTallMan/Signal`
4. Select the repo, branch `main`
5. Framework preset: Astro
6. Build command: `npm install && SKIP_KEYSTATIC=true npm run build`
7. Build output directory: `dist`
8. Environment variables: `SKIP_KEYSTATIC=true`
9. Preview deployments: enabled for all PR branches
10. Save and deploy

After first successful build, the preview URL is
`signal-dev.pages.dev` (or similar if the project name differs).

## Diagnosing build failures

Cloudflare Pages build logs are at:
Dashboard → Workers & Pages → signal-dev → Deployments → [click failed deployment] → View build log

The same checks that run in CI run during the build. If `npm run typecheck`
or the content integrity scripts would fail in CI, they will fail here
too. CI is the first line of defence; deployment failures usually mean
CI was bypassed or a flaky transient issue (npm registry, node version).
