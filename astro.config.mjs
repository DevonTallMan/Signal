// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

// Static output. Keystatic only runs server-side in dev; in prod, content is
// already baked into the build.
export default defineConfig({
  site: 'https://signal.example.com', // update when domain is known
  integrations: [react(), markdoc(), keystatic()],
  output: 'static',
});
