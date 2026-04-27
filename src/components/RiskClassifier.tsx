// src/components/RiskClassifier.tsx
//
// React island that mounts the Phaser UK Legislation Classifier game.
// client:only - does not SSR because Phaser touches `window` at import time.
//
// Hybrid architecture: Phaser owns interaction, React owns feedback panels.
//
// Sprint 2 Increment 3 scope:
//   - One scenario rendered above canvas (uklaw-001 hardcoded, same as Increment 2)
//   - Click triggers feedback panel: correct shows examinerReasoning,
//     incorrect shows examinerReasoning + matching commonMistakes entry
//   - Continue button visible after answer; click does nothing (Increment 5 wires it)
//
// State machine:
//   "initialising" -> "ready" (waiting for click)
//   "ready" -> "correct" or "incorrect" (after click)
//   "correct" or "incorrect" -> END (Increment 3 doesn't advance further)

import { useEffect, useRef, useState } from "react";
import { startSession } from "../lib/risk-classifier/firestore";
import type Phaser from "phaser";
import type { Tier, Scenario } from "../lib/risk-classifier/game";

type Status = "initialising" | "ready" | "correct" | "incorrect" | "error";

interface IncorrectFeedback {
  selectedTier: Tier;
  matchingMistake: { tier: Tier; why: string };
}

const TIER_LABELS: Record<Tier, string> = {
  "data-protection": "Data Protection",
  "computer-misuse": "Computer Misuse",
  equality: "Equality",
  "intellectual-property": "Intellectual Property",
};

export default function RiskClassifier(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [status, setStatus] = useState<Status>("initialising");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [incorrectFeedback, setIncorrectFeedback] =
    useState<IncorrectFeedback | null>(null);

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
            handleTierSelected(tier, firstScenario);
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

  function handleTierSelected(tier: Tier, scenarioFor: Scenario): void {
    if (tier === scenarioFor.correctTier) {
      setStatus("correct");
      setIncorrectFeedback(null);
    } else {
      const matchingMistake = scenarioFor.commonMistakes.find(
        (m) => m.tier === tier
      );
      if (!matchingMistake) {
        // Defensive: every wrong tier should have a matching commonMistakes entry,
        // but if it doesn't, fall back to a generic message rather than crash.
        setStatus("incorrect");
        setIncorrectFeedback({
          selectedTier: tier,
          matchingMistake: {
            tier,
            why: "(No specific feedback available for this answer.)",
          },
        });
      } else {
        setStatus("incorrect");
        setIncorrectFeedback({ selectedTier: tier, matchingMistake });
      }
    }
  }

  function handleContinue(): void {
    // Increment 3: continue button does nothing. Increment 5 will advance to the
    // next scenario.
    // eslint-disable-next-line no-console
    console.log("[RiskClassifier] continue clicked (no-op in Increment 3)");
  }

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

      {(status === "ready" || status === "correct" || status === "incorrect") &&
        scenario && (
          <div className="rc-classifier__scenario">
            <p className="rc-classifier__scenario-kicker">
              Scenario {scenario.id} · {scenario.difficulty}
            </p>
            <p className="rc-classifier__scenario-text">{scenario.scenario}</p>
          </div>
        )}

      <div
        ref={containerRef}
        className="rc-classifier__canvas"
        role="application"
        aria-label="UK Legislation Risk Classifier"
      />

      {status === "correct" && scenario && (
        <div className="rc-classifier__feedback rc-classifier__feedback--correct">
          <p className="rc-classifier__feedback-kicker">
            Correct · {TIER_LABELS[scenario.correctTier]}
          </p>
          <h3 className="rc-classifier__feedback-heading">Examiner reasoning</h3>
          <p className="rc-classifier__feedback-text">
            {scenario.examinerReasoning}
          </p>
          <p className="rc-classifier__feedback-ref">
            {scenario.actReference}
          </p>
          <button
            type="button"
            className="rc-classifier__continue"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      )}

      {status === "incorrect" && scenario && incorrectFeedback && (
        <div className="rc-classifier__feedback rc-classifier__feedback--incorrect">
          <p className="rc-classifier__feedback-kicker">
            Not quite · You chose {TIER_LABELS[incorrectFeedback.selectedTier]}
          </p>
          <h3 className="rc-classifier__feedback-heading">
            Why {TIER_LABELS[incorrectFeedback.selectedTier]} is not the primary
            answer
          </h3>
          <p className="rc-classifier__feedback-text">
            {incorrectFeedback.matchingMistake.why}
          </p>
          <h3 className="rc-classifier__feedback-heading rc-classifier__feedback-heading--secondary">
            The primary answer is {TIER_LABELS[scenario.correctTier]}
          </h3>
          <p className="rc-classifier__feedback-text">
            {scenario.examinerReasoning}
          </p>
          <p className="rc-classifier__feedback-ref">
            {scenario.actReference}
          </p>
          <button
            type="button"
            className="rc-classifier__continue"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      )}

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
        .rc-classifier__feedback {
          padding: 1.5rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-radius: 2px;
        }
        .rc-classifier__feedback--correct {
          border-left: 2px solid #39ff14;
        }
        .rc-classifier__feedback--incorrect {
          border-left: 2px solid #ff6b6b;
        }
        .rc-classifier__feedback-kicker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin: 0 0 1rem;
        }
        .rc-classifier__feedback--correct .rc-classifier__feedback-kicker {
          color: #39ff14;
        }
        .rc-classifier__feedback--incorrect .rc-classifier__feedback-kicker {
          color: #ff6b6b;
        }
        .rc-classifier__feedback-heading {
          color: var(--ink, #e8edf3);
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }
        .rc-classifier__feedback-heading--secondary {
          margin-top: 1.5rem;
        }
        .rc-classifier__feedback-text {
          margin: 0 0 1rem;
          color: var(--ink, #e8edf3);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .rc-classifier__feedback-ref {
          margin: 0 0 1.5rem;
          color: var(--dim, rgba(232, 237, 243, 0.55));
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.8rem;
          line-height: 1.5;
        }
        .rc-classifier__continue {
          background: var(--green, #39ff14);
          color: var(--void, #0a0e1a);
          border: 0;
          padding: 0.75rem 1.5rem;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.85rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          border-radius: 2px;
        }
        .rc-classifier__continue:hover {
          background: #2ed60f;
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
          .rc-classifier__scenario,
          .rc-classifier__feedback {
            padding: 1rem;
          }
          .rc-classifier__feedback-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}