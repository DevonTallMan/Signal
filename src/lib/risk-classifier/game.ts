// src/lib/risk-classifier/game.ts
//
// Phaser scene definition for the Risk Classifier.
// Sprint 1 scope: render a static scaffold with four empty tier zones and a
// scaffold message. Proves the Phaser-React integration works and that the
// canvas renders at the target size. Sprint 2 adds the real gameplay.

import Phaser from "phaser";

// Signal CSS tokens, duplicated here because Phaser does not read CSS vars.
// Keep in sync with the module's styles.
const COLOURS = {
  void: 0x0d1117,
  panel: 0x141a24,
  border: 0x1e2530,
  green: 0x39ff14,
  gold: 0xffd700,
  ink: 0xe8edf3,
  muted: 0x7a8290,
  minimal: 0x39ff14,
  limited: 0xffd700,
  high: 0xff8c00,
  unacceptable: 0xff3b3b,
} as const;

interface Tier {
  key: string;
  label: string;
  colour: number;
  cssColour: string;
}

const TIERS: Tier[] = [
  { key: "minimal", label: "MINIMAL", colour: COLOURS.minimal, cssColour: "#39ff14" },
  { key: "limited", label: "LIMITED", colour: COLOURS.limited, cssColour: "#ffd700" },
  { key: "high", label: "HIGH", colour: COLOURS.high, cssColour: "#ff8c00" },
  { key: "unacceptable", label: "UNACCEPTABLE", colour: COLOURS.unacceptable, cssColour: "#ff3b3b" },
];

interface ScaffoldSceneInitData {
  sessionId: string | null;
}

class ScaffoldScene extends Phaser.Scene {
  private sessionId: string | null = null;

  constructor() {
    super({ key: "ScaffoldScene" });
  }

  init(data: ScaffoldSceneInitData): void {
    this.sessionId = data.sessionId ?? null;
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, COLOURS.void).setOrigin(0, 0);

    this.add
      .text(width / 2, 60, "RISK CLASSIFIER \u00b7 SPRINT 1 SCAFFOLD", {
        fontFamily: "JetBrains Mono, Courier New, monospace",
        fontSize: "14px",
        color: "#39ff14",
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(
        width / 2,
        90,
        "Drag-and-drop, scenarios, and scoring arrive in sprint 2.",
        {
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: "11px",
          color: "#7a8290",
        }
      )
      .setOrigin(0.5, 0.5);

    const cardW = 360;
    const cardH = 120;
    const cardX = width / 2;
    const cardY = 200;
    this.add
      .rectangle(cardX, cardY, cardW, cardH, COLOURS.panel)
      .setStrokeStyle(1, COLOURS.border);
    this.add
      .text(cardX, cardY, "[ scenario card placeholder ]", {
        fontFamily: "JetBrains Mono, Courier New, monospace",
        fontSize: "12px",
        color: "#7a8290",
      })
      .setOrigin(0.5, 0.5);

    const zoneW = width / 4 - 12;
    const zoneH = 140;
    const zoneY = height - zoneH / 2 - 40;

    TIERS.forEach((tier, i) => {
      const zoneX = (width / 4) * i + width / 8;

      this.add
        .rectangle(zoneX, zoneY, zoneW, zoneH, COLOURS.panel)
        .setStrokeStyle(2, tier.colour);

      this.add
        .text(zoneX, zoneY - 30, tier.label, {
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: "13px",
          color: tier.cssColour,
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0.5);

      this.add
        .text(zoneX, zoneY + 10, `tier ${i + 1}`, {
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: "10px",
          color: "#7a8290",
        })
        .setOrigin(0.5, 0.5);
    });

    if (this.sessionId) {
      this.add
        .text(
          width - 12,
          12,
          `session: ${this.sessionId.slice(0, 8)}`,
          {
            fontFamily: "JetBrains Mono, Courier New, monospace",
            fontSize: "10px",
            color: "#4a525e",
          }
        )
        .setOrigin(1, 0);
    }
  }
}

export interface CreateGameConfigInput {
  parent: HTMLElement;
  sessionId: string | null;
}

/**
 * Build a Phaser game config for the Risk Classifier.
 * Called by the React island with the DOM parent and (if available) a
 * Firestore session id.
 */
export function createGameConfig(
  input: CreateGameConfigInput
): Phaser.Types.Core.GameConfig {
  const { parent, sessionId } = input;

  return {
    type: Phaser.AUTO,
    parent,
    width: 880,
    height: 560,
    backgroundColor: "#0d1117",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [ScaffoldScene],
    callbacks: {
      preBoot: (game: Phaser.Game) => {
        game.registry.set("sessionId", sessionId);
      },
    },
  };
}
