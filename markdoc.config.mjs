// markdoc.config.mjs
//
// Markdoc configuration for the Signal content pipeline.
//
// Custom tags:
//   - role: inline tag for marking N·E·I structural roles within worked-
//     example answer prose. Drives Phase 1 A1 (Methodology depth: visible
//     structural highlighting on worked-example answers).
//
// Usage in mdoc files:
//   {% role name="name" %}prose...{% /role %}
//   {% role name="explain" %}prose...{% /role %}
//   {% role name="impact" %}prose...{% /role %}
//
// The component renders an inline <mark> element with role-specific
// styling that ties to the existing Signal colour convention:
//   name    -> red    (matches Sort & Match N bucket)
//   explain -> amber  (matches Sort & Match E bucket)
//   impact  -> green  (matches Sort & Match I bucket)
//
// CSS lives in src/styles/global.css under .nei-role*.

import { defineMarkdocConfig, component } from "@astrojs/markdoc/config";

export default defineMarkdocConfig({
  tags: {
    role: {
      render: component("./src/components/NeiRole.astro"),
      inline: true,
      attributes: {
        name: {
          type: String,
          required: true,
          matches: ["name", "explain", "impact"],
          description:
            "The Answer Arc role this span plays: name, explain, or impact.",
        },
      },
    },
  },
});
