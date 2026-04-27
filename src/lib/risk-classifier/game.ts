// src/lib/risk-classifier/game.ts
//
// Phaser game configuration for the UK Legislation Classifier.
//
// Sprint 2 Increment 2 scope:
//   - Read scenarios from JSON
//   - Render four tier buttons inside the Phaser canvas
//   - On click, invoke a callback exposed to the React parent
//   - Scenario text and feedback panels are rendered by React, not Phaser
//
// Hybrid architecture (decided 24 April 2026):
//   - Phaser owns the classify interaction (tier buttons, click handling)
//   - React owns the text-heavy parts (scenario, feedback panels)

import Phaser from "phaser";
import scenariosData from "../../data/risk-classifier/scenarios.json";

export type Tier =
  | "data-protection"
  | "computer-misuse"
  | "equality"
  | "intellectual-property";

export interface Scenario {
  id: string;
  difficulty: "clean" | "grey" | "edge";
  scenario: string;
  correctTier: Tier;
  examinerReasoning: string;
  commonMistakes: Array<{ tier: Tier; why: string }>;
  actReference: string;
  specReference: string;
}

interface ScenariosFile {
  _meta: Record<string, unknown>;
  _schema: Record<string, unknown>;
  scenarios: Scenario[];
}

const SCENARIOS = (scenariosData as ScenariosFile).scenarios;

export function getAllScenarios(): Scenario[] {
  return SCENARIOS;
}

export interface GameConfigInput {
  parent: HTMLElement;
  sessionId: string | null;
  onTierSelected: (tier: Tier) => void;
}

const TIER_LABELS: Record<Tier, string> = {
  "data-protection": "Data Protection",
  "computer-misuse": "Computer Misuse",
  equality: "Equality",
  "intellectual-property": "Intellectual Property",
};

const TIER_ORDER: Tier[] = [
  "data-protection",
  "computer-misuse",
  "equality",
  "intellectual-property",
];

class ClassifyScene extends Phaser.Scene {
  private sessionId: string | null;
  private onTierSelected: (tier: Tier) => void;

  constructor(input: { sessionId: string | null; onTierSelected: (tier: Tier) => void }) {
    super({ key: "ClassifyScene" });
    this.sessionId = input.sessionId;
    this.onTierSelected = input.onTierSelected;
  }

  create(): void {
    const { width, height } = this.scale;
    this.renderHeader(width);
    this.renderTierButtons(width, height);
    this.renderSessionLabel(width, height);
  }

  private renderHeader(width: number): void {
    this.add
      .text(width / 2, 30, "Which Act applies?", {
        fontFamily: "JetBrains Mono, Courier New, monospace",
        fontSize: "16px",
        color: "#e8edf3",
      })
      .setOrigin(0.5, 0);
  }

  private renderTierButtons(width: number, height: number): void {
    // Four buttons in a 2x2 grid centered on the canvas.
    // Buttons are 320x90 with 20px padding between, working at 800x560 base size.
    const buttonWidth = 320;
    const buttonHeight = 90;
    const gap = 24;
    const totalWidth = buttonWidth * 2 + gap;
    const totalHeight = buttonHeight * 2 + gap;
    const startX = (width - totalWidth) / 2;
    const startY = (height - totalHeight) / 2 - 20;

    TIER_ORDER.forEach((tier, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (buttonWidth + gap);
      const y = startY + row * (buttonHeight + gap);
      this.createTierButton(x, y, buttonWidth, buttonHeight, tier);
    });
  }

  private createTierButton(
    x: number,
    y: number,
    w: number,
    h: number,
    tier: Tier
  ): void {
    const bg = this.add
      .rectangle(x, y, w, h, 0x0a0e1a, 1)
      .setOrigin(0)
      .setStrokeStyle(1, 0x1f2733);

    const label = this.add
      .text(x + w / 2, y + h / 2, TIER_LABELS[tier], {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "18px",
        color: "#e8edf3",
        fontStyle: "500",
      })
      .setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });

    bg.on("pointerover", () => {
      bg.setStrokeStyle(1, 0x39ff14);
      label.setColor("#39ff14");
    });

    bg.on("pointerout", () => {
      bg.setStrokeStyle(1, 0x1f2733);
      label.setColor("#e8edf3");
    });

    bg.on("pointerdown", () => {
      bg.setFillStyle(0x1a2330, 1);
    });

    bg.on("pointerup", () => {
      bg.setFillStyle(0x0a0e1a, 1);
      this.onTierSelected(tier);
    });
  }

  private renderSessionLabel(width: number, height: number): void {
    const label = this.sessionId
      ? `session ${this.sessionId.slice(0, 8)}`
      : "no session";
    this.add
      .text(width - 12, height - 12, label, {
        fontFamily: "JetBrains Mono, Courier New, monospace",
        fontSize: "10px",
        color: "rgba(232, 237, 243, 0.35)",
      })
      .setOrigin(1, 1);
  }
}

export function createGameConfig(
  input: GameConfigInput
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: input.parent,
    backgroundColor: "#0a0e1a",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 360,
    },
    scene: new ClassifyScene({
      sessionId: input.sessionId,
      onTierSelected: input.onTierSelected,
    }),
  };
}