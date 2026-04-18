// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Keystatic mounts server routes for its /keystatic admin UI, which needs
// an adapter. For production builds we don't want the admin UI shipping
// to students, so we skip the keystatic integration entirely when
// SKIP_KEYSTATIC=true is set. Set this flag in CI and in your deploy
// pipeline. Leave it unset for local dev so authors get the admin UI.
//
// Official Keystatic recipe:
// https://keystatic.com/docs/recipes/astro-disable-admin-ui-in-production
const SKIP_KEYSTATIC = process.env.SKIP_KEYSTATIC === 'true';

export default defineConfig({
  site: 'https://signal-dev.pages.dev', // preview URL; swap to production domain at launch
  integrations: [
    react(),
    markdoc(),
    ...(SKIP_KEYSTATIC ? [] : [keystatic()]),
  ],
  output: 'static',
});
