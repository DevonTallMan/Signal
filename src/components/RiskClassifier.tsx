// src/components/RiskClassifier.tsx
//
// React island that mounts the Phaser UK Legislation Classifier game.
// client:only - does not SSR because Phaser touches `window` at import time.
//
// Hybrid architecture: Phaser owns interaction, React owns content rendering.
//
// Sprint 2 Increment 5 scope:
//   - 5 scenarios per session, picked by pickSessionScenarios algorithm
//   - Continue button advances to the next scenario
//   - After scenario 5, end-of-session summary panel
//   - Restart button starts a new Firestore session
//   - completeSession called when summary appears
//
// Sprint 2 A4 (post-Increment-6) addition:
//   - Session intro paragraph rendered above the first scenario,
//     read from scenarios.json `_sessionIntro`. Hides on first tier click.
//
// Sprint 2.5 test API addition:
//   - Exposes window.__signalTestApi in dev builds so Playwright tests
//     can drive the component without interacting with Phaser canvas.
//     See src/lib/risk-classifier/testApi.ts for the API surface.
//
// State machine:
//   "initialising" -> "ready" (showing scenario, waiting for tier click)
//   "ready" -> "correct" or "incorrect" (after click)
//   "correct" or "incorrect" -> "ready" (next scenario, if more remain)
//                            -> "session-complete" (if scenario 5 just answered)

import { useEffect, useRef, useState } from "react";
import {
  startSession,
  writeAttempt,
  completeSession,
} from "../lib/risk-classifier/firestore";
import type Phaser from "phaser";
import type { Tier, Scenario } from "../lib/risk-classifier/game";
import scenariosData from "../data/risk-classifier/scenarios.json";
import {
  registerTestApi,
  unregisterTestApi,
  type TestApiSessionState,
} from "../lib/risk-classifier/testApi";

const SESSION_INTRO: string =
  (scenariosData as { _sessionIntro?: string })._sessionIntro ?? "";

type Status =
  | "initialising"
  | "ready"
  | "correct"
  | "incorrect"
  | "session-complete"
  | "error";

interface IncorrectFeedback {
  selectedTier: Tier;
  matchingMistake: { tier: Tier; why: string };
}

interface SessionState {
  sessionId: string | null;
  scenarios: Scenario[];
  currentIndex: number;
  correctCount: number;
  startedAt: number;
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
  const sessionStateRef = useRef<SessionState | null>(null);
  const scenarioStartedAtRef = useRef<number>(0);
  const transitioningRef = useRef<boolean>(false);

  // Test API support: keep latest state snapshot and handler references
  // in refs so the API exposed on window can call into them without
  // stale closures.
  const testStateRef = useRef<TestApiSessionState>({
    status: "initialising",
    currentScenario: null,
    sessionId: null,
    currentIndex: 0,
    correctCount: 0,
    totalScenarios: 0,
    completionTimeMs: null,
  });
 const handleTierSelectedRef = useRef<(tier: Tier, timeToAnswerMs: number) => void>(() => {});
  const handleContinueRef = useRef<() => Promise<void>>(async () => {});

  const [status, setStatus] = useState<Status>("initialising");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [incorrectFeedback, setIncorrectFeedback] =
    useState<IncorrectFeedback | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    correct: number;
  }>({ current: 1, total: 5, correct: 0 });
  const [completionTimeMs, setCompletionTimeMs] = useState<number | null>(null);
  const [introVisible, setIntroVisible] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const PhaserModule = await import("phaser");
        const Phaser = PhaserModule.default;
        const { createGameConfig, pickSessionScenarios } = await import(
          "../lib/risk-classifier/game"
        );

        if (cancelled) return;
        if (!containerRef.current) return;

        const session = await startSession();
        if (cancelled) return;

        const seed = session?.id ?? `local-${crypto.randomUUID()}`;
        const sessionScenarios = pickSessionScenarios(seed);
        if (sessionScenarios.length === 0) {
          throw new Error("No scenarios picked for session");
        }

        sessionStateRef.current = {
          sessionId: session?.id ?? null,
          scenarios: sessionScenarios,
          currentIndex: 0,
          correctCount: 0,
          startedAt: Date.now(),
        };

        const firstScenario = sessionScenarios[0];
        setScenario(firstScenario);
        setProgress({
          current: 1,
          total: sessionScenarios.length,
          correct: 0,
        });
        scenarioStartedAtRef.current = Date.now();

        const config = createGameConfig({
          parent: containerRef.current,
          sessionId: session?.id ?? null,
          onTierSelected: (tier: Tier) => {
            const elapsed = Date.now() - scenarioStartedAtRef.current;
            handleTierSelected(tier, elapsed);
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

  function handleTierSelected(tier: Tier, timeToAnswerMs: number): void {
    const state = sessionStateRef.current;
    if (!state) return;
    const currentScenario = state.scenarios[state.currentIndex];
    if (!currentScenario) return;

    setIntroVisible(false);

    const isCorrect = tier === currentScenario.correctTier;

    if (isCorrect) {
      setStatus("correct");
      setIncorrectFeedback(null);
      state.correctCount += 1;
      setProgress((p) => ({ ...p, correct: state.correctCount }));
    } else {
      const matchingMistake = currentScenario.commonMistakes.find(
        (m) => m.tier === tier
      );
      if (!matchingMistake) {
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

    if (state.sessionId) {
      void writeAttempt({
        sessionId: state.sessionId,
        scenarioId: currentScenario.id,
        tierChosen: tier,
        correctTier: currentScenario.correctTier,
        timeToAnswerMs,
        viewedReasoning: true,
      });
    }
  }

  async function handleContinue(): Promise<void> {
    if (transitioningRef.current) return;
    transitioningRef.current = true;

    try {
      const state = sessionStateRef.current;
      if (!state) {
        return;
      }
      const nextIndex = state.currentIndex + 1;

      if (nextIndex >= state.scenarios.length) {
        if (state.sessionId) {
          void completeSession({
            sessionId: state.sessionId,
            score: state.correctCount,
            totalScenarios: state.scenarios.length,
          });
        }
        setCompletionTimeMs(Date.now() - state.startedAt);
        setStatus("session-complete");
        return;
      }

      state.currentIndex = nextIndex;
      setScenario(state.scenarios[nextIndex]);
      setProgress({
        current: nextIndex + 1,
        total: state.scenarios.length,
        correct: state.correctCount,
      });
      setIncorrectFeedback(null);
      scenarioStartedAtRef.current = Date.now();
      setStatus("ready");

      const { getClassifyScene } = await import(
        "../lib/risk-classifier/game"
      );
      if (gameRef.current) {
        const scene = getClassifyScene(gameRef.current);
        if (scene) {
          scene.unlockForNextScenario();
        }
      }
    } finally {
      transitioningRef.current = false;
    }
  }

  function handleRestart(): void {
    window.location.reload();
  }

  // Mirror current state and handler references for the test API.
  // Runs on every render so the test API always sees fresh values.
  testStateRef.current = {
    status,
    currentScenario: scenario,
    sessionId: sessionStateRef.current?.sessionId ?? null,
    currentIndex: sessionStateRef.current?.currentIndex ?? 0,
    correctCount: sessionStateRef.current?.correctCount ?? 0,
    totalScenarios: sessionStateRef.current?.scenarios.length ?? 0,
    completionTimeMs,
  };
  handleTierSelectedRef.current = handleTierSelected;
  handleContinueRef.current = handleContinue;

  // Register the test API once on mount. Production builds (where
  // import.meta.env.DEV is false) no-op inside registerTestApi, so
  // window.__signalTestApi is never set in production.
  useEffect(() => {
    registerTestApi({
      clickTier: (tier) => {
        const elapsed = Date.now() - scenarioStartedAtRef.current;
        handleTierSelectedRef.current(tier, elapsed);
      },
      continue: () => handleContinueRef.current(),
      getSessionState: () => testStateRef.current,
    });
    return () => unregisterTestApi();
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

      {(status === "ready" ||
        status === "correct" ||
        status === "incorrect") &&
        scenario && (
          <>
            {introVisible && SESSION_INTRO && (
              <div className="rc-classifier__intro">
                <p className="rc-classifier__intro-text">{SESSION_INTRO}</p>
              </div>
            )}
            <div className="rc-classifier__progress">
              Scenario {progress.current} of {progress.total} ·{" "}
              {progress.correct} correct
            </div>
            <div className="rc-classifier__scenario">
              <p className="rc-classifier__scenario-kicker">
                Scenario {scenario.id} · {scenario.difficulty}
              </p>
              <p className="rc-classifier__scenario-text">
                {scenario.scenario}
              </p>
            </div>
          </>
        )}

      <div
        ref={containerRef}
        className="rc-classifier__canvas"
        role="application"
        aria-label="UK Legislation Risk Classifier"
        style={{
          display: status === "session-complete" ? "none" : undefined,
        }}
      />

      {status === "correct" && scenario && (
        <div className="rc-classifier__feedback rc-classifier__feedback--correct">
          <p className="rc-classifier__feedback-kicker">
            Correct · {TIER_LABELS[scenario.correctTier]}
          </p>
          <h3 className="rc-classifier__feedback-heading">
            Examiner reasoning
          </h3>
          <p className="rc-classifier__feedback-text">
            {scenario.examinerReasoning}
          </p>
          <p className="rc-classifier__feedback-ref">{scenario.actReference}</p>
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
            Why {TIER_LABELS[incorrectFeedback.selectedTier]} is not the
            primary answer
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
          <p className="rc-classifier__feedback-ref">{scenario.actReference}</p>
          <button
            type="button"
            className="rc-classifier__continue"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      )}

      {status === "session-complete" && sessionStateRef.current && (
        <div className="rc-classifier__summary">
          <p className="rc-classifier__summary-kicker">Session complete</p>
          <div className="rc-classifier__summary-score">
            <span className="rc-classifier__summary-score-value">
              {sessionStateRef.current.correctCount}
            </span>
            <span className="rc-classifier__summary-score-divider">/</span>
            <span className="rc-classifier__summary-score-total">
              {sessionStateRef.current.scenarios.length}
            </span>
          </div>
          <p className="rc-classifier__summary-time">
            Total time: {Math.round((completionTimeMs ?? 0) / 1000)} seconds
          </p>
          <button
            type="button"
            className="rc-classifier__continue"
            onClick={handleRestart}
          >
            Start a new session
          </button>
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
        .rc-classifier__intro {
          padding: 1rem 1.25rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--green, #39ff14);
          border-radius: 2px;
          animation: rc-intro-fade 320ms ease-out;
        }
        .rc-classifier__intro-text {
          margin: 0;
          color: var(--ink, #e8edf3);
          font-size: 0.95rem;
          line-height: 1.6;
          font-style: italic;
        }
        @keyframes rc-intro-fade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rc-classifier__progress {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--dim, rgba(232, 237, 243, 0.55));
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
        .rc-classifier__summary {
          padding: 2rem 1.5rem;
          background: var(--void, rgba(0, 0, 0, 0.25));
          border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
          border-left: 2px solid var(--gold, #ffd700);
          border-radius: 2px;
          text-align: center;
        }
        .rc-classifier__summary-kicker {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold, #ffd700);
          margin: 0 0 1rem;
        }
        .rc-classifier__summary-score {
          font-family: "JetBrains Mono", "Courier New", monospace;
          margin-bottom: 1rem;
        }
        .rc-classifier__summary-score-value {
          font-size: 4rem;
          color: var(--ink, #e8edf3);
          font-weight: 700;
        }
        .rc-classifier__summary-score-divider {
          font-size: 2.5rem;
          color: var(--dim, rgba(232, 237, 243, 0.55));
          margin: 0 0.5rem;
        }
        .rc-classifier__summary-score-total {
          font-size: 2.5rem;
          color: var(--dim, rgba(232, 237, 243, 0.55));
        }
        .rc-classifier__summary-time {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 0.85rem;
          color: var(--dim, rgba(232, 237, 243, 0.55));
          margin: 0 0 1.5rem;
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

        @media (max-width: 640px) {
          .rc-classifier__scenario,
          .rc-classifier__feedback,
          .rc-classifier__summary {
            padding: 1rem;
          }
          .rc-classifier__feedback-text {
            font-size: 0.9rem;
          }
          .rc-classifier__summary-score-value {
            font-size: 3rem;
          }
        }
      `}</style>
    </div>
  );
}

