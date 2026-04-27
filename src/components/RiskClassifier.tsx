// src/components/RiskClassifier.tsx
//
// React island that mounts the Phaser UK Legislation Classifier game.
// client:only - does not SSR because Phaser touches `window` at import time.
//
// Hybrid architecture: Phaser owns interaction, React owns scenario text and
// feedback panels. Pivoted from EU AI Act on 24 April 2026.
//
// Sprint 2 Increment 2 scope:
//   - Render one hardcoded scenario above the Phaser canvas
//   - Phaser scene presents four tier buttons
//   - Click handlers log to console only; feedback panels arrive in Increment 3
//   - Mobile-responsive layout established here

import { useEffect, useRef, useState } from "react";
import { startSession } from "../lib/risk-classifier/firestore";
import type Phaser from "phaser";
import type { Tier, Scenario } from "../lib/risk-classifier/game";

type Status = "initialising" | "ready" | "error";

export default function RiskClassifier(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [status, setStatus] = useState<Status>("initialising");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const PhaserModule = await import("phaser");
        const Phaser = PhaserModule.default;
        const { createGameConfig, getAllScenarios } = await import(
          "../lib/risk-classifier/game"
        );

        if (cancelled) return;
        if (!containerRef.current) return;

        const session = await startSession();
        if (cancelled) return;
        setSessionId(session?.id ?? null);

        const allScenarios = getAllScenarios();
        if (allScenarios.length === 0) {
          throw new Error("No scenarios available");
        }
        const firstScenario = allScenarios[0];
        setScenario(firstScenario);

        const config = createGameConfig({
          parent: containerRef.current,
          sessionId: session?.id ?? null,
          onTierSelected: (tier: Tier) => {
            // Increment 2: just log. Increment 3 will wire feedback.
            // eslint-disable-next-line no-console
            console.log("[RiskClassifier] tier selected:", tier, "for scenario:", firstScenario.id);
          },
        });

        gameRef.current = new Phaser.Game(config);
        setStatus("ready");
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[RiskClassifier] boot failed:", err);
        if (!cancelled) setStatus("error");
      }
    }

    boot();

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rc-classifier">
      {status === "initialising" && (
        <div className="rc-classifier__status">Loading classifier...</div>
      )}
      {status === "error" && (
        <div className="rc-classifier__status rc-classifier__status--error">
          Could not load the classifier. Please refresh the page.
        </div>
      )}

      {status === "ready" && scenario && (
        <div className="rc-classifier__scenario">
          <p className="rc-classifier__scenario-kicker">Scenario {scenario.id} · {scenario.difficulty}</p>
          <p className="rc-classifier__scenario-text">{scenario.scenario}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="rc-classifier__canvas"
        role="application"
        aria-label="UK Legislation Risk Classifier"
      />

      {sessionId && (
        <div className="rc-classifier__session-id" aria-hidden="true">
          session: {sessionId.slice(0, 8)}
        </div>
      )}

      <style>{`
        .rc-classifier {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .rc-classifier__scenario {
          padding: 1.25rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--gold, #ffd700);
          border-radius: 2px;
        }
        .rc-classifier__scenario-kicker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--dim, rgba(232, 237, 243, 0.55));
          margin: 0 0 0.5rem;
        }
        .rc-classifier__scenario-text {
          margin: 0;
          color: var(--ink, #e8edf3);
          font-size: 1rem;
          line-height: 1.6;
        }
        .rc-classifier__canvas {
          width: 100%;
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rc-classifier__canvas canvas {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        .rc-classifier__status {
          padding: 2rem;
          text-align: center;
          color: var(--muted, rgba(232, 237, 243, 0.55));
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
        }
        .rc-classifier__status--error {
          color: #ff5c5c;
        }
        .rc-classifier__session-id {
          position: absolute;
          bottom: 0.5rem;
          right: 0.75rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          color: var(--muted, rgba(232, 237, 243, 0.35));
          letter-spacing: 0.05em;
        }

        @media (max-width: 640px) {
          .rc-classifier__scenario {
            padding: 1rem;
          }
          .rc-classifier__scenario-text {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}