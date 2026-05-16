// markdoc.config.mjs
//
// Markdoc configuration for the Signal content pipeline.
//
// Custom tags:
//   - role: inline tag for marking N·E·I structural roles within worked-
//     example answer prose. Drives Phase 1 A1 (Methodology depth: visible
//     structural highlighting on worked-example answers).
//   - illo: block tag for inserting topic-page section-break
//     illustrations. Used in CA 4.1 Data Protection to give the prose
//     visual anchors at each major section.
//
// Usage in mdoc files:
//   {% role name="name" %}prose...{% /role %}      (inline)
//   {% role name="explain" %}prose...{% /role %}   (inline)
//   {% role name="impact" %}prose...{% /role %}    (inline)
//   {% illo panel="scope" /%}                       (block, on its own line)
//   {% illo panel="regime" /%}
//   {% illo panel="actors" /%}
//   {% illo panel="principles" /%}
//   {% illo panel="lawful-bases" /%}
//   {% illo panel="rights" /%}
//
// The role component renders an inline <mark> element. The illo
// component renders a <figure> with an inline SVG.
//
// CSS lives in src/styles/global.css under .nei-role* (role) and
// .topic-illo* (illo).

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
    illo: {
      render: component("./src/components/TopicIllo.astro"),
      attributes: {
        panel: {
          type: String,
          required: true,
          matches: [
            "scope",
            "regime",
            "actors",
            "principles",
            "lawful-bases",
            "rights",
          ],
          description:
            "Which section-break illustration to render. Currently scoped to the CA 4.1 Data Protection topic.",
        },
      },
    },
  },
});
