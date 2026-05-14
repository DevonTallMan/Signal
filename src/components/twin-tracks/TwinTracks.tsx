// src/components/twin-tracks/TwinTracks.tsx
//
// React island for the Twin Tracks Discuss-style activity.
// Sprint 4 worked example: Hospital Remote Access (single scenario currently).
//
// Sprint 4 Increment 4.5 scope: FIRESTORE PERSISTENCE.
//   - On boot: call startSession(); use returned ID as picker seed and as
//     the persistence key. Falls back to a local UUID seed and ephemeral
//     mode if no auth (mirrors Sort & Match).
//   - On each phrase-lock (correct drop): call writeAttempt() with the
//     phrase id, the canonical correctTrack/correctSlot, the wrongDropCount
//     accumulated before this lock, whether stuck-mitigation fired, and
//     the elapsed time from scenario start to lock.
//   - On session-complete transition: call completeSession() with the
//     final score (correct outcomes count) and totalScenarios.
//   - All writes are fire-and-forget; failure logs via console.error but
//     does NOT break the UI (silent-failure pattern; trade-off documented
//     in firestore.ts).
//
// Per-scenario timer (scenarioStartedAtRef) records the lock time on each
// phrase. Resets on bootSession, handleContinue advance, and
// handleStartNewSession.
//
// What this PR does NOT do (per docs/sprint-4-scope.md):
//   - Playwright tests (Inc 4.6)

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import scenariosData from "../../data/twin-tracks/scenarios.json";
import { pickSessionScenarios } from "../../lib/twin-tracks/sessionPicker";
import {
  startSession,
  writeAttempt,
  completeSession,
} from "../../lib/twin-tracks/firestore";
import {
  registerTestApi,
  unregisterTestApi,
  type TestApiSessionState,
  type Status,
} from "../../lib/twin-tracks/testApi";
import { Glyph } from "../glyphs";
import type { GlyphName } from "../glyphs";

interface ScenarioPanel {
  id: string;
  glyph: GlyphName;
  caption: string;
}

type Track = "positive" | "negative";
type Slot = "introduce" | "explain" | "develop";

interface Phrase {
  id: string;
  text: string;
  track: Track;
  slot: Slot;
}

interface ModelAnswerCell {
  introduce: string;
  explain: string;
  develop: string;
}

interface ModelAnswer {
  positive: ModelAnswerCell;
  negative: ModelAnswerCell;
}

interface Scenario {
  id: string;
  title: string;
  questionType: "discuss";
  scenarioPanels: ScenarioPanel[];
  phrases: Phrase[];
  modelAnswer: ModelAnswer;
}

type CellId = `${Track}-${Slot}`;
type Location = "pool" | CellId;

type FeedbackKind =
  | "track-right-slot-wrong"
  | "track-wrong-slot-right"
  | "both-wrong"
  | "stuck-revealed";

interface Feedback {
  phraseId: string;
  kind: FeedbackKind;
  message: string;
}

type Outcome = "correct" | "with-help";

interface SessionState {
  sessionId: string | null;
  scenarios: Scenario[];
  currentIndex: number;
  outcomes: Outcome[];
  startedAt: number;
  completedAt: number | null;
}

const TRACKS: readonly Track[] = ["positive", "negative"] as const;
const SLOTS: readonly Slot[] = ["introduce", "explain", "develop"] as const;

const TRACK_LABELS: Record<Track, string> = {
  positive: "Positive impact",
  negative: "Negative impact",
};

const SLOT_LABELS: Record<Slot, string> = {
  introduce: "Introduce",
  explain: "Explain",
  develop: "Develop",
};

const MAX_WRONG_ATTEMPTS = 3;
const SESSION_LENGTH = 3;

function cellId(track: Track, slot: Slot): CellId {
  return `${track}-${slot}` as CellId;
}

function parseCellId(id: CellId): { track: Track; slot: Slot } {
  const [track, slot] = id.split("-") as [Track, Slot];
  return { track, slot };
}

function initialLocations(phrases: Phrase[]): Record<string, Location> {
  const out: Record<string, Location> = {};
  for (const p of phrases) out[p.id] = "pool";
  return out;
}

async function bootNewSession(): Promise<SessionState | null> {
  const allScenarios = scenariosData as Scenario[];
  const sessionHandle = await startSession();
  const seed = sessionHandle?.id ?? `local-${crypto.randomUUID()}`;
  const sessionId = sessionHandle?.id ?? null;
  const picked = pickSessionScenarios(seed, allScenarios, SESSION_LENGTH);
  if (picked.length === 0) return null;
  return {
    sessionId,
    scenarios: picked,
    currentIndex: 0,
    outcomes: [],
    startedAt: Date.now(),
    completedAt: null,
  };
}

function buildFeedback(
  phrase: Phrase,
  trackCorrect: boolean,
  slotCorrect: boolean,
  triggerStuck: boolean
): Feedback {
  if (triggerStuck) {
    return {
      phraseId: phrase.id,
      kind: "stuck-revealed",
      message: `This phrase belongs in the ${TRACK_LABELS[phrase.track]} track, ${SLOT_LABELS[phrase.slot]} slot. Drag it there.`,
    };
  }
  if (trackCorrect && !slotCorrect) {
    return {
      phraseId: phrase.id,
      kind: "track-right-slot-wrong",
      message: `Right track, wrong slot. Try ${SLOT_LABELS[phrase.slot]}.`,
    };
  }
  if (!trackCorrect && slotCorrect) {
    return {
      phraseId: phrase.id,
      kind: "track-wrong-slot-right",
      message: `Right slot, wrong track. This describes a ${phrase.track} impact.`,
    };
  }
  return {
    phraseId: phrase.id,
    kind: "both-wrong",
    message: `Both dimensions wrong. Re-read the phrase and try again.`,
  };
}

// ---------- DraggablePhrase ----------
interface DraggablePhraseProps {
  phrase: Phrase;
  locked: boolean;
  revealed: boolean;
}

function DraggablePhrase({
  phrase,
  locked,
  revealed,
}: DraggablePhraseProps): JSX.Element {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: phrase.id, disabled: locked });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: locked ? "default" : isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };

  let stateClass = "";
  if (locked) stateClass = " tt-twintracks__phrase--locked";
  else if (revealed) stateClass = " tt-twintracks__phrase--revealed";

  return (
    <div
      ref={setNodeRef}
      className={`tt-twintracks__phrase${stateClass}`}
      style={style}
      {...(locked ? {} : listeners)}
      {...attributes}
    >
      <span className="tt-twintracks__phrase-text">{phrase.text}</span>
      {locked && (
        <span className="tt-twintracks__phrase-marker tt-twintracks__phrase-marker--locked">
          LOCKED
        </span>
      )}
      {!locked && revealed && (
        <span className="tt-twintracks__phrase-marker tt-twintracks__phrase-marker--revealed">
          HINT REVEALED
        </span>
      )}
    </div>
  );
}

// ---------- Droppable ----------
interface DroppableProps {
  id: Location;
  children: React.ReactNode;
  className: string;
  ariaLabel: string;
}

function Droppable({
  id,
  children,
  className,
  ariaLabel,
}: DroppableProps): JSX.Element {
  const { isOver, setNodeRef } = useDroppable({ id });
  const overClass = isOver ? `${className} ${className}--over` : className;

  return (
    <div ref={setNodeRef} className={overClass} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

// ---------- Main component ----------
export default function TwinTracks(): JSX.Element {
  const [session, setSession] = useState<SessionState | null>(null);
  const [phraseLocations, setPhraseLocations] = useState<
    Record<string, Location>
  >({});
  const [phraseLocked, setPhraseLocked] = useState<Record<string, boolean>>(
    {}
  );
  const [phraseWrongCount, setPhraseWrongCount] = useState<
    Record<string, number>
  >({});
  const [phraseRevealed, setPhraseRevealed] = useState<Record<string, boolean>>(
    {}
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const scenarioStartedAtRef = useRef<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    })
  );

  useEffect(() => {
    void boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    registerTestApi({
      placePhrase: (phraseId, location) => {
        performDrop(phraseId, location);
      },
      clickContinue: () => {
        handleContinue();
      },
      clickStartNewSession: () => {
        handleStartNewSession();
      },
      getSessionState: (): TestApiSessionState => {
        if (!session) {
          return {
            status: "loading",
            sessionId: null,
            currentScenarioId: null,
            currentIndex: 0,
            totalScenarios: 0,
            correctCount: 0,
            withHelpCount: 0,
            placements: {},
            locked: {},
            wrongDropCount: {},
            revealed: {},
            phrasesInScenario: [],
          };
        }
        const scenario = session.scenarios[session.currentIndex];
        const roundComplete =
          Object.keys(phraseLocked).length >= scenario.phrases.length;
        const sessionComplete = session.completedAt !== null;
        const status: Status = sessionComplete
          ? "session-complete"
          : roundComplete
            ? "round-complete"
            : "placing";
        return {
          status,
          sessionId: session.sessionId,
          currentScenarioId: scenario.id,
          currentIndex: session.currentIndex,
          totalScenarios: session.scenarios.length,
          correctCount: session.outcomes.filter((o) => o === "correct").length,
          withHelpCount: session.outcomes.filter((o) => o === "with-help")
            .length,
          placements: phraseLocations,
          locked: phraseLocked,
          wrongDropCount: phraseWrongCount,
          revealed: phraseRevealed,
          phrasesInScenario: scenario.phrases.map((p) => ({
            id: p.id,
            track: p.track,
            slot: p.slot,
          })),
        };
      },
    });
    return () => {
      unregisterTestApi();
    };
  });

  async function boot(): Promise<void> {
    const next = await bootNewSession();
    if (!next) return;
    setSession(next);
    resetPhraseStateFor(next.scenarios[0]);
  }

  if (!session) {
    return (
      <div className="tt-twintracks">
        <div className="tt-twintracks__status">Loading scenarios...</div>
        <style>{commonStyles}</style>
      </div>
    );
  }

  const currentScenario = session.scenarios[session.currentIndex];
  const isRoundComplete =
    Object.keys(phraseLocked).length >= currentScenario.phrases.length;
  const isSessionComplete = session.completedAt !== null;
  const isLastScenario =
    session.currentIndex + 1 >= session.scenarios.length;
  const anyRevealedInRound = currentScenario.phrases.some(
    (p) => phraseRevealed[p.id]
  );

  function resetPhraseStateFor(scenario: Scenario): void {
    setPhraseLocations(initialLocations(scenario.phrases));
    setPhraseLocked({});
    setPhraseWrongCount({});
    setPhraseRevealed({});
    setFeedback(null);
    scenarioStartedAtRef.current = Date.now();
  }

  function handleDragStart(_event: DragStartEvent): void {
    setFeedback(null);
  }

  function performDrop(phraseId: string, dropLocation: Location): void {
    if (!session) return;
    if (phraseLocked[phraseId]) return;

    const phrase = currentScenario.phrases.find((p) => p.id === phraseId);
    if (!phrase) return;

    if (dropLocation === "pool") {
      setPhraseLocations((prev) => ({ ...prev, [phraseId]: "pool" }));
      return;
    }

    const { track: droppedTrack, slot: droppedSlot } =
      parseCellId(dropLocation);
    const trackCorrect = droppedTrack === phrase.track;
    const slotCorrect = droppedSlot === phrase.slot;

    if (trackCorrect && slotCorrect) {
      setPhraseLocations((prev) => ({ ...prev, [phraseId]: dropLocation }));
      setPhraseLocked((prev) => ({ ...prev, [phraseId]: true }));

      // Persist per-phrase-lock attempt (fire-and-forget). Guarded on a
      // Firestore session; ephemeral mode skips silently.
      //
      // wrongDropCount is capped at MAX_WRONG_ATTEMPTS for the persisted
      // record. If a student wrong-drops beyond the stuck-mitigation
      // threshold, the analytic value (did this phrase trip them?) is
      // already answered; additional wrong drops are noise. The rules
      // schema enforces wrongDropCount <= 3 plus the revealed-iff-3
      // invariant, so the cap here keeps writeAttempt valid against rules
      // in all scenarios.
      if (session.sessionId) {
        const wrongDropCount = Math.min(
          phraseWrongCount[phraseId] ?? 0,
          MAX_WRONG_ATTEMPTS
        );
        const revealed = phraseRevealed[phraseId] ?? false;
        const timeToLockMs = Date.now() - scenarioStartedAtRef.current;
        void writeAttempt({
          sessionId: session.sessionId,
          scenarioId: currentScenario.id,
          phraseId: phrase.id,
          correctTrack: phrase.track,
          correctSlot: phrase.slot,
          wrongDropCount,
          revealed,
          timeToLockMs,
        });
      }
      return;
    }

    const nextWrongCount = (phraseWrongCount[phraseId] ?? 0) + 1;
    const triggerStuck =
      nextWrongCount >= MAX_WRONG_ATTEMPTS && !phraseRevealed[phraseId];

    setPhraseLocations((prev) => ({ ...prev, [phraseId]: "pool" }));
    setPhraseWrongCount((prev) => ({ ...prev, [phraseId]: nextWrongCount }));
    if (triggerStuck) {
      setPhraseRevealed((prev) => ({ ...prev, [phraseId]: true }));
    }

    setFeedback(
      buildFeedback(phrase, trackCorrect, slotCorrect, triggerStuck)
    );
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over) return;
    performDrop(String(active.id), over.id as Location);
  }

  function handleContinue(): void {
    if (!session || !isRoundComplete) return;

    const outcome: Outcome = anyRevealedInRound ? "with-help" : "correct";
    const newOutcomes: Outcome[] = [...session.outcomes, outcome];
    const nextIndex = session.currentIndex + 1;

    if (nextIndex >= session.scenarios.length) {
      const score = newOutcomes.filter((o) => o === "correct").length;
      const totalScenarios = session.scenarios.length;
      if (session.sessionId) {
        void completeSession({
          sessionId: session.sessionId,
          score,
          totalScenarios,
        });
      }
      setSession({
        ...session,
        outcomes: newOutcomes,
        completedAt: Date.now(),
      });
      return;
    }

    setSession({
      ...session,
      currentIndex: nextIndex,
      outcomes: newOutcomes,
    });
    resetPhraseStateFor(session.scenarios[nextIndex]);
  }

  function handleStartNewSession(): void {
    setSession(null);
    void boot();
  }

  const phrasesIn = (loc: Location): Phrase[] =>
    currentScenario.phrases.filter((p) => phraseLocations[p.id] === loc);

  // ---------- Session complete view ----------
  if (isSessionComplete) {
    const correctCount = session.outcomes.filter(
      (o) => o === "correct"
    ).length;
    const withHelpCount = session.outcomes.filter(
      (o) => o === "with-help"
    ).length;
    const totalSeconds = Math.round(
      ((session.completedAt ?? Date.now()) - session.startedAt) / 1000
    );

    return (
      <div className="tt-twintracks">
        <div className="tt-twintracks__session-summary">
          <p className="tt-twintracks__session-summary-kicker">
            SESSION COMPLETE
          </p>
          <div className="tt-twintracks__session-summary-score">
            <span className="tt-twintracks__session-summary-score-value">
              {correctCount}
            </span>
            <span className="tt-twintracks__session-summary-score-divider">
              /
            </span>
            <span className="tt-twintracks__session-summary-score-total">
              {session.scenarios.length}
            </span>
          </div>
          <p className="tt-twintracks__session-summary-breakdown">
            {correctCount} solved without help.{" "}
            {withHelpCount > 0
              ? `${withHelpCount} needed the stuck-mitigation hint.`
              : "No hints needed."}
          </p>
          <p className="tt-twintracks__session-summary-time">
            Total time: {totalSeconds} seconds
          </p>
          <button
            type="button"
            className="tt-twintracks__continue"
            onClick={handleStartNewSession}
          >
            Start a new session
          </button>
        </div>
        <style>{commonStyles}</style>
      </div>
    );
  }

  // ---------- Active session view ----------
  return (
    <div className="tt-twintracks">
      <p className="tt-twintracks__progress">
        Scenario {session.currentIndex + 1} of {session.scenarios.length} ·{" "}
        {session.outcomes.filter((o) => o === "correct").length} correct
      </p>

      <p className="tt-twintracks__framing">
        Discuss-style answers balance one positive and one negative impact.
        For each, identify the introduction, explanation, and developed
        consequence. Drag each phrase to the right track and slot.
      </p>

      <div className="tt-twintracks__scenario-title">
        <p className="tt-twintracks__scenario-kicker">SCENARIO</p>
        <h2 className="tt-twintracks__scenario-name">
          {currentScenario.title}
        </h2>
      </div>

      <div
        className="tt-twintracks__panels"
        role="list"
        aria-label="Scenario comic strip"
      >
        {currentScenario.scenarioPanels.map((panel) => (
          <div
            key={panel.id}
            className="tt-twintracks__panel"
            role="listitem"
          >
            <Glyph name={panel.glyph} size={48} />
            <p className="tt-twintracks__panel-caption">{panel.caption}</p>
          </div>
        ))}
      </div>

      {!isRoundComplete && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="tt-twintracks__activity">
            <div className="tt-twintracks__grid-group">
              <p className="tt-twintracks__section-kicker">SORT INTO</p>
              <div
                className="tt-twintracks__grid"
                role="grid"
                aria-label="Twin Tracks placement grid"
              >
                <div
                  className="tt-twintracks__corner"
                  aria-hidden="true"
                ></div>
                {SLOTS.map((slot) => (
                  <div
                    key={`header-${slot}`}
                    className="tt-twintracks__col-header"
                    role="columnheader"
                  >
                    {SLOT_LABELS[slot]}
                  </div>
                ))}
                {TRACKS.flatMap((track) => [
                  <div
                    key={`label-${track}`}
                    className={`tt-twintracks__row-label tt-twintracks__row-label--${track}`}
                    role="rowheader"
                  >
                    {TRACK_LABELS[track]}
                  </div>,
                  ...SLOTS.map((slot) => {
                    const id = cellId(track, slot);
                    return (
                      <Droppable
                        key={id}
                        id={id}
                        className={`tt-twintracks__cell tt-twintracks__cell--${track}`}
                        ariaLabel={`${TRACK_LABELS[track]}, ${SLOT_LABELS[slot]}`}
                      >
                        {phrasesIn(id).map((phrase) => (
                          <DraggablePhrase
                            key={phrase.id}
                            phrase={phrase}
                            locked={phraseLocked[phrase.id] ?? false}
                            revealed={phraseRevealed[phrase.id] ?? false}
                          />
                        ))}
                      </Droppable>
                    );
                  }),
                ])}
              </div>

              {feedback && (
                <div
                  className={`tt-twintracks__feedback tt-twintracks__feedback--${feedback.kind}`}
                  role="status"
                  aria-live="polite"
                >
                  <span className="tt-twintracks__feedback-kicker">
                    {feedback.kind === "stuck-revealed"
                      ? "HINT REVEALED"
                      : "TRY AGAIN"}
                  </span>
                  <span className="tt-twintracks__feedback-text">
                    {feedback.message}
                  </span>
                </div>
              )}
            </div>

            <div className="tt-twintracks__phrase-pool">
              <p className="tt-twintracks__section-kicker">PHRASE POOL</p>
              <Droppable
                id="pool"
                className="tt-twintracks__pool"
                ariaLabel="Phrase pool"
              >
                <div className="tt-twintracks__phrases">
                  {phrasesIn("pool").map((phrase) => (
                    <DraggablePhrase
                      key={phrase.id}
                      phrase={phrase}
                      locked={false}
                      revealed={phraseRevealed[phrase.id] ?? false}
                    />
                  ))}
                  {phrasesIn("pool").length === 0 && (
                    <p className="tt-twintracks__pool-empty">
                      Pool empty. Drag phrases back here to clear a cell.
                    </p>
                  )}
                </div>
              </Droppable>
            </div>
          </div>
        </DndContext>
      )}

      {isRoundComplete && (
        <div
          className={`tt-twintracks__model-answer${
            anyRevealedInRound ? " tt-twintracks__model-answer--with-help" : ""
          }`}
        >
          <p className="tt-twintracks__model-answer-kicker">
            {anyRevealedInRound ? "MODEL ANSWER" : "SCENARIO COMPLETE"}
          </p>
          <p className="tt-twintracks__model-answer-context">
            {anyRevealedInRound
              ? "One or more phrases needed help. Read the full model answer below to see how the structure reads as continuous prose."
              : "All six phrases placed correctly. Read the full model answer below to see how the structure reads as continuous prose."}
          </p>

          {TRACKS.map((track) => (
            <section
              key={track}
              className={`tt-twintracks__model-track tt-twintracks__model-track--${track}`}
            >
              <h3 className="tt-twintracks__model-track-heading">
                {TRACK_LABELS[track]}
              </h3>
              {SLOTS.map((slot) => (
                <p key={slot} className="tt-twintracks__model-slot">
                  <span className="tt-twintracks__model-slot-label">
                    {SLOT_LABELS[slot]}
                  </span>
                  <span className="tt-twintracks__model-slot-text">
                    {currentScenario.modelAnswer[track][slot]}
                  </span>
                </p>
              ))}
            </section>
          ))}

          <button
            type="button"
            className="tt-twintracks__continue"
            onClick={handleContinue}
          >
            {isLastScenario
              ? "See session summary"
              : "Continue to next scenario"}
          </button>
        </div>
      )}

      <style>{commonStyles}</style>
    </div>
  );
}

const commonStyles = `
  .tt-twintracks {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .tt-twintracks__progress {
    margin: 0;
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
  }

  .tt-twintracks__framing {
    margin: 0;
    color: var(--dim, rgba(232, 237, 243, 0.75));
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 68ch;
  }

  .tt-twintracks__scenario-title {
    padding: 1rem 1.25rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--gold, #ffd700);
    border-radius: 2px;
  }
  .tt-twintracks__scenario-kicker {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    margin: 0 0 0.5rem;
  }
  .tt-twintracks__scenario-name {
    margin: 0;
    color: var(--ink, #e8edf3);
    font-size: 1.25rem;
    font-weight: 600;
  }

  .tt-twintracks__panels {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.75rem;
    padding: 1rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 2px;
  }
  .tt-twintracks__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 2px;
  }
  .tt-twintracks__panel-caption {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--dim, rgba(232, 237, 243, 0.75));
    text-align: center;
  }

  .tt-twintracks__activity {
    display: grid;
    grid-template-columns: 1fr 18rem;
    gap: 1.5rem;
  }

  .tt-twintracks__section-kicker {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    margin: 0 0 0.75rem;
  }

  .tt-twintracks__grid {
    display: grid;
    grid-template-columns: 8.5rem repeat(3, 1fr);
    gap: 0.5rem;
  }
  .tt-twintracks__corner {
    /* empty top-left intersection cell */
  }
  .tt-twintracks__col-header {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    text-align: center;
    padding: 0.5rem 0;
  }
  .tt-twintracks__row-label {
    display: flex;
    align-items: center;
    padding: 1rem 0.75rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 2px;
    color: var(--ink, #e8edf3);
    font-size: 0.9rem;
    font-weight: 600;
  }
  .tt-twintracks__row-label--positive {
    border-left: 2px solid var(--green, #39ff14);
  }
  .tt-twintracks__row-label--negative {
    border-left: 2px solid var(--red, #ff3b3b);
    margin-top: 0.5rem;
  }
  .tt-twintracks__cell {
    min-height: 110px;
    padding: 0.75rem;
    background: var(--void, rgba(0, 0, 0, 0.15));
    border: 1px dashed var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: border-color 120ms ease, background 120ms ease;
  }
  .tt-twintracks__cell--negative {
    margin-top: 0.5rem;
  }
  .tt-twintracks__cell--over {
    border-color: var(--green, #39ff14);
    background: rgba(57, 255, 20, 0.05);
  }

  .tt-twintracks__feedback {
    margin-top: 1rem;
    padding: 0.875rem 1rem;
    background: var(--void, rgba(0, 0, 0, 0.35));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--gold, #ffd700);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .tt-twintracks__feedback--stuck-revealed {
    border-left-color: var(--red, #ff3b3b);
  }
  .tt-twintracks__feedback-kicker {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    color: var(--gold, #ffd700);
  }
  .tt-twintracks__feedback--stuck-revealed .tt-twintracks__feedback-kicker {
    color: var(--red, #ff3b3b);
  }
  .tt-twintracks__feedback-text {
    color: var(--ink, #e8edf3);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .tt-twintracks__phrase-pool {
    display: flex;
    flex-direction: column;
  }
  .tt-twintracks__pool {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 2px;
    min-height: 80px;
    transition: border-color 120ms ease, background 120ms ease;
  }
  .tt-twintracks__pool--over {
    border-color: var(--green, #39ff14);
    background: rgba(57, 255, 20, 0.05);
  }
  .tt-twintracks__pool-empty {
    margin: 0;
    padding: 0.5rem;
    color: var(--muted, rgba(232, 237, 243, 0.55));
    font-size: 0.85rem;
    text-align: center;
    font-style: italic;
  }
  .tt-twintracks__phrases {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .tt-twintracks__phrase {
    padding: 0.75rem 1rem;
    background: var(--void, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--green, #39ff14);
    border-radius: 2px;
    color: var(--ink, #e8edf3);
    font-size: 0.85rem;
    line-height: 1.5;
    user-select: none;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    transition: border-color 160ms ease;
  }
  .tt-twintracks__phrase--locked {
    border-left-color: var(--green, #39ff14);
    box-shadow: inset 2px 0 0 var(--green, #39ff14);
  }
  .tt-twintracks__phrase--revealed {
    border-left-color: var(--red, #ff3b3b);
  }
  .tt-twintracks__phrase-text {
    display: block;
  }
  .tt-twintracks__phrase-marker {
    align-self: flex-start;
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    padding: 0.2rem 0.5rem;
    border-radius: 2px;
  }
  .tt-twintracks__phrase-marker--locked {
    color: var(--green, #39ff14);
    background: rgba(57, 255, 20, 0.1);
    border: 1px solid rgba(57, 255, 20, 0.35);
  }
  .tt-twintracks__phrase-marker--revealed {
    color: var(--red, #ff3b3b);
    background: rgba(255, 59, 59, 0.1);
    border: 1px solid rgba(255, 59, 59, 0.35);
  }

  .tt-twintracks__model-answer {
    padding: 1.5rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--green, #39ff14);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .tt-twintracks__model-answer--with-help {
    border-left-color: var(--gold, #ffd700);
  }
  .tt-twintracks__model-answer-kicker {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    margin: 0;
    color: var(--green, #39ff14);
  }
  .tt-twintracks__model-answer--with-help .tt-twintracks__model-answer-kicker {
    color: var(--gold, #ffd700);
  }
  .tt-twintracks__model-answer-context {
    margin: 0;
    color: var(--dim, rgba(232, 237, 243, 0.75));
    font-size: 0.9rem;
    line-height: 1.5;
  }
  .tt-twintracks__model-track {
    padding-top: 1rem;
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  }
  .tt-twintracks__model-track:first-of-type {
    border-top: 0;
    padding-top: 0;
  }
  .tt-twintracks__model-track-heading {
    margin: 0 0 0.75rem;
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.8rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink, #e8edf3);
    font-weight: 700;
  }
  .tt-twintracks__model-track--positive .tt-twintracks__model-track-heading {
    color: var(--green, #39ff14);
  }
  .tt-twintracks__model-track--negative .tt-twintracks__model-track-heading {
    color: var(--red, #ff3b3b);
  }
  .tt-twintracks__model-slot {
    margin: 0 0 0.75rem;
    color: var(--ink, #e8edf3);
    font-size: 0.95rem;
    line-height: 1.65;
    display: block;
  }
  .tt-twintracks__model-slot:last-child {
    margin-bottom: 0;
  }
  .tt-twintracks__model-slot-label {
    display: inline-block;
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    padding: 0.15rem 0.45rem;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
    border-radius: 2px;
    margin-right: 0.6rem;
    vertical-align: baseline;
  }
  .tt-twintracks__model-slot-text {
    display: inline;
  }

  .tt-twintracks__continue {
    align-self: flex-start;
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
    transition: background 120ms ease, box-shadow 120ms ease;
  }
  .tt-twintracks__continue:hover {
    background: #2ed60f;
    box-shadow: 0 0 0 4px rgba(57, 255, 20, 0.15);
  }

  .tt-twintracks__session-summary {
    padding: 2rem 1.5rem;
    background: var(--void, rgba(0, 0, 0, 0.25));
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--gold, #ffd700);
    border-radius: 2px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .tt-twintracks__session-summary-kicker {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: var(--gold, #ffd700);
    margin: 0;
  }
  .tt-twintracks__session-summary-score {
    font-family: "JetBrains Mono", "Courier New", monospace;
  }
  .tt-twintracks__session-summary-score-value {
    font-size: 4rem;
    color: var(--ink, #e8edf3);
    font-weight: 700;
  }
  .tt-twintracks__session-summary-score-divider {
    font-size: 2.5rem;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    margin: 0 0.5rem;
  }
  .tt-twintracks__session-summary-score-total {
    font-size: 2.5rem;
    color: var(--dim, rgba(232, 237, 243, 0.55));
  }
  .tt-twintracks__session-summary-breakdown {
    margin: 0;
    color: var(--dim, rgba(232, 237, 243, 0.75));
    font-size: 0.9rem;
    line-height: 1.5;
    max-width: 48ch;
  }
  .tt-twintracks__session-summary-time {
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.85rem;
    color: var(--dim, rgba(232, 237, 243, 0.55));
    margin: 0;
  }

  .tt-twintracks__status {
    padding: 2rem;
    text-align: center;
    color: var(--muted, rgba(232, 237, 243, 0.55));
    font-family: "JetBrains Mono", "Courier New", monospace;
    font-size: 0.85rem;
    letter-spacing: 0.1em;
  }

  @media (max-width: 900px) {
    .tt-twintracks__activity {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .tt-twintracks__panels {
      grid-template-columns: repeat(3, 1fr);
    }
    .tt-twintracks__grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    .tt-twintracks__col-header {
      display: none;
    }
    .tt-twintracks__row-label {
      margin-top: 0;
    }
    .tt-twintracks__cell {
      margin-top: 0;
    }
    .tt-twintracks__cell--negative {
      margin-top: 0;
    }
    .tt-twintracks__cell::before {
      content: attr(aria-label);
      display: block;
      font-family: "JetBrains Mono", "Courier New", monospace;
      font-size: 0.65rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--dim, rgba(232, 237, 243, 0.55));
      margin-bottom: 0.5rem;
    }
    .tt-twintracks__session-summary-score-value {
      font-size: 3rem;
    }
  }

  @media (max-width: 480px) {
    .tt-twintracks__panels {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;
