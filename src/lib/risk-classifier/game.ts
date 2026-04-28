// src/lib/risk-classifier/game.ts
//
// Phaser game configuration for the UK Legislation Classifier.
//
// Sprint 2 Increment 2: scenario rendering and tier buttons.
// Sprint 2 Increment 3: button locking after first click.
// Sprint 2 Increment 4: click callback wired to React for Firestore persistence.
// Sprint 2 Increment 5: pickSessionScenarios for 5-scenario sessions, plus
//   unlockForNextScenario reset method on the scene and getClassifyScene
//   accessor for React to call between scenarios.
//
// Hybrid architecture: Phaser owns interaction, React owns content rendering.

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

const ALL_SCENARIOS = (scenariosData as ScenariosFile).scenarios;

export function getAllScenarios(): Scenario[] {
  return ALL_SCENARIOS;
}

/**
 * Pick 5 scenarios for a single session.
 *
 * Algorithm: tier-balanced (one from each of the four tiers) plus one
 * wildcard. Within-session order is difficulty-progressive: clean first,
 * grey middle, edge last where possible.
 *
 * Selection is deterministic by seed; passing a different seed gives a
 * different set. For Increment 5, the seed is the session ID, so each
 * Firestore session sees a different but reproducible set.
 */
export function pickSessionScenarios(seed: string): Scenario[] {
  // Group scenarios by tier
  const byTier: Record<Tier, Scenario[]> = {
    "data-protection": [],
    "computer-misuse": [],
    equality: [],
    "intellectual-property": [],
  };
  ALL_SCENARIOS.forEach((s) => {
    byTier[s.correctTier].push(s);
  });

  // Deterministic pseudo-random helper: integer hash from seed string
  function hashChar(s: string, salt: number): number {
    let h = salt;
    for (let i = 0; i < s.length; i += 1) {
      h = (h * 31 + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  // For each tier, pick one scenario deterministically based on seed
  const selected: Scenario[] = [];
  const tiers: Tier[] = [
    "data-protection",
    "computer-misuse",
    "equality",
    "intellectual-property",
  ];
  tiers.forEach((tier, idx) => {
    const candidates = byTier[tier];
    if (candidates.length === 0) return;
    const pickIdx = hashChar(seed, idx + 1) % candidates.length;
    selected.push(candidates[pickIdx]);
  });

  // Wildcard: pick from all scenarios not already selected
  const selectedIds = new Set(selected.map((s) => s.id));
  const remaining = ALL_SCENARIOS.filter((s) => !selectedIds.has(s.id));
  if (remaining.length > 0) {
    const wildcardIdx = hashChar(seed, 99) % remaining.length;
    selected.push(remaining[wildcardIdx]);
  }

  // Sort by difficulty: clean -> grey -> edge
  const difficultyOrder: Record<Scenario["difficulty"], number> = {
    clean: 0,
    grey: 1,
    edge: 2,
  };
  selected.sort(
    (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  );

  return selected;
}

export interface GameConfigInput {
  parent: HTMLElement;
  sessionId: string | null;
  onTierSelected: (tier: Tier) => void;
}

export interface GameHandle {
  game: Phaser.Game;
  resetForNextScenario: () => void;
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

interface TierButton {
  tier: Tier;
  bg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

class ClassifyScene extends Phaser.Scene {
  private sessionId: string | null;
  private onTierSelected: (tier: Tier) => void;
  private buttons: TierButton[] = [];
  private locked: boolean = false;

  constructor(input: {
    sessionId: string | null;
    onTierSelected: (tier: Tier) => void;
  }) {
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
      const button = this.createTierButton(x, y, buttonWidth, buttonHeight, tier);
      this.buttons.push(button);
    });
  }

  private createTierButton(
    x: number,
    y: number,
    w: number,
    h: number,
    tier: Tier
  ): TierButton {
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
      if (this.locked) return;
      bg.setStrokeStyle(1, 0x39ff14);
      label.setColor("#39ff14");
    });

    bg.on("pointerout", () => {
      if (this.locked) return;
      bg.setStrokeStyle(1, 0x1f2733);
      label.setColor("#e8edf3");
    });

    bg.on("pointerdown", () => {
      if (this.locked) return;
      bg.setFillStyle(0x1a2330, 1);
    });

    bg.on("pointerup", () => {
      if (this.locked) return;
      bg.setFillStyle(0x0a0e1a, 1);
      this.lock();
      this.onTierSelected(tier);
    });

    return { tier, bg, label };
  }

  private lock(): void {
    this.locked = true;
    this.buttons.forEach(({ bg, label }) => {
      bg.disableInteractive();
      bg.setStrokeStyle(1, 0x1f2733);
      label.setColor("rgba(232, 237, 243, 0.35)");
      bg.setFillStyle(0x0a0e1a, 1);
    });
  }

  // Called by React when the user clicks Continue and the next scenario should
  // be live. Resets the buttons to interactive and clears the locked state.
  unlockForNextScenario(): void {
    this.locked = false;
    this.buttons.forEach(({ bg, label }) => {
      bg.setInteractive({ useHandCursor: true });
      bg.setStrokeStyle(1, 0x1f2733);
      label.setColor("#e8edf3");
      bg.setFillStyle(0x0a0e1a, 1);
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

/**
 * Get a reference to the active ClassifyScene from a running Phaser.Game.
 * Used by React to call unlockForNextScenario when the Continue button is
 * clicked.
 */
export function getClassifyScene(game: Phaser.Game): ClassifyScene | null {
  const scene = game.scene.getScene("ClassifyScene");
  return scene as ClassifyScene | null;
}
