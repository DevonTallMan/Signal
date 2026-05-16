// markdoc.config.mjs
//
// Markdoc configuration for the Signal content pipeline.
//
// Tag families:
//   role  : inline. N·E·I structural highlighting in worked-example prose.
//   illo  : block.  Section-break illustrations on prose topic pages.
//   comic-*: block. Cyberpunk-comic topic format (Inc 7.0+). Only used on
//           topics whose frontmatter has display_style: "comic".

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

    panels: {
      render: component("./src/components/Comic/Panels.astro"),
      description: "Grid wrapper for a sequence of comic panels.",
    },
    panel: {
      render: component("./src/components/Comic/Panel.astro"),
      attributes: {
        id: { type: String, required: false },
        num: { type: String, required: true },
        eyebrow: { type: String, required: true },
        headline: { type: String, required: true },
        illo: { type: String, required: false },
      },
      description: "Single comic panel with illustration, headline and body.",
    },
    takeaway: {
      render: component("./src/components/Comic/Takeaway.astro"),
      description: "Closing line of a panel. One per panel.",
    },
    def: {
      render: component("./src/components/Comic/Def.astro"),
      description: "Inline yellow-bordered definition card inside a panel.",
    },
    "term-card": {
      render: component("./src/components/Comic/TermCard.astro"),
      attributes: {
        center: { type: Boolean, required: false, default: true },
      },
      description: "Centered glitch-stamped quote box.",
    },
    "docs-compare": {
      render: component("./src/components/Comic/DocsCompare.astro"),
      description: "Two-document side-by-side compare row.",
    },
    doc: {
      render: component("./src/components/Comic/Doc.astro"),
      attributes: {
        title: { type: String, required: true },
      },
      description: "A single document within docs-compare.",
    },
    cloud: {
      render: component("./src/components/Comic/Cloud.astro"),
      description: "Chip cloud for lifecycle stages and similar.",
    },
    chip: {
      render: component("./src/components/Comic/Chip.astro"),
      inline: true,
      description: "A single chip within a cloud.",
    },
    closer: {
      render: component("./src/components/Comic/Closer.astro"),
      attributes: {
        line: { type: String, required: true },
        body: { type: String, required: false },
      },
      description: "Closing block at the end of a comic topic.",
    },
    step: {
      render: component("./src/components/Comic/Step.astro"),
      attributes: {
        num: { type: String, required: true },
        head: { type: String, required: true },
      },
      description: "A numbered step inside a closer.",
    },
    "comic-illo": {
      render: component("./src/components/Comic/ComicIllo.astro"),
      attributes: {
        panel: { type: String, required: true },
      },
      description:
        "SVG illustration slot inside a panel-illo region. Resolves named panels at the component level.",
    },
  },
});
