// src/lib/risk-classifier/game.ts
//
// Phaser game configuration for the UK Legislation Classifier.
// Sprint 2 Increment 1 scope: boot the canvas, render a placeholder scene,
// confirm Phaser-Astro-React island integration works end to end.
//
// Hybrid architecture (decided 24 April 2026):
//   - Phaser owns the classify interaction (scenario presentation, tier buttons)
//   - React owns the feedback panels (examiner reasoning, common mistakes)
// The React layer reads game state via callbacks emitted from the scene.
//
// Subsequent increments will replace the placeholder scene with the real
// classifier flow.

import Phaser from "phaser";

export interface GameConfigInput {
  parent: HTMLElement;
  sessionId: string | null;
}

class BootScene extends Phaser.Scene {
  private sessionId: string | null;

  constructor(sessionId: string | null) {
    super({ key: "BootScene" });
    this.sessionId = sessionId;
  }

  create(): void {
    const { width, height } = this.scale;
    const centreX = width / 2;
    const centreY = height / 2;

    this.add
      .text(centreX, centreY - 20, "UK Legislation Classifier", {
        fontFamily: "JetBrains Mono, Courier New, monospace",
        fontSize: "28px",
        color: "#e8edf3",
      })
      .setOrigin(0.5);

    this.add
      .text(
        centreX,
        centreY + 20,
        this.sessionId
          ? `session ${this.sessionId.slice(0, 8)} ready`
          : "no session (unauthenticated)",
        {
          fontFamily: "JetBrains Mono, Courier New, monospace",
          fontSize: "14px",
          color: "#39ff14",
        }
      )
      .setOrigin(0.5);

    this.add
      .text(centreX, centreY + 60, "Increment 1: scaffold mounted", {
        fontFamily: "JetBrains Mono, Courier New, monospace",
        fontSize: "12px",
        color: "rgba(232, 237, 243, 0.55)",
      })
      .setOrigin(0.5);
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
      height: 560,
    },
    scene: new BootScene(input.sessionId),
  };
}