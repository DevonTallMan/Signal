// src/components/RiskClassifier.jsx
//
// React island that mounts the Phaser Risk Classifier game.
// client:only — does not SSR because Phaser touches `window` at import time.
//
// Sprint 1 scope: mount Phaser, render placeholder scaffold on canvas,
// log a session-start record to Firestore, confirm the spine works.
// No drag interaction, no scenarios, no animation yet.

import { useEffect, useRef, useState } from "react";
import { startSession } from "../lib/risk-classifier/firestore.js";

export default function RiskClassifier() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [status, setStatus] = useState("initialising");
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        // Dynamically import Phaser only on mount. This keeps it out of
        // the initial bundle for the rest of Signal.
        const Phaser = (await import("phaser")).default;
        const { createGameConfig } = await import(
          "../lib/risk-classifier/game.js"
        );

        if (cancelled) return;

        // Start a Firestore session before the game boots.
        // If the user is not authenticated, startSession returns null and
        // we run the game in ephemeral mode (no persistence).
        const session = await startSession();
        if (cancelled) return;
        setSessionId(session?.id ?? null);

        const config = createGameConfig({
          parent: containerRef.current,
          sessionId: session?.id ?? null,
        });

        gameRef.current = new Phaser.Game(config);
        setStatus("ready");
      } catch (err) {
        console.error("[RiskClassifier] boot failed:", err);
        setStatus("error");
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
        <div className="rc-classifier__status">Loading classifier…</div>
      )}
      {status === "error" && (
        <div className="rc-classifier__status rc-classifier__status--error">
          Could not load the classifier. Please refresh the page.
        </div>
      )}
      <div
        ref={containerRef}
        className="rc-classifier__canvas"
        role="application"
        aria-label="EU AI Act Risk Classifier"
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
          min-height: 560px;
        }
        .rc-classifier__canvas {
          width: 100%;
          min-height: 560px;
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
      `}</style>
    </div>
  );
}
