// src/components/TerminologyDrill.tsx
//
// A quick-fire terminology recall drill. Auxiliary to the NEI submission
// on the same topic page. Intentionally small in scope:
//
//   - Definition-on-front, term-on-back (cued recall of terminology)
//   - Reveal then self-rate: student reads the cue, tries to recall the
//     term, clicks Reveal, then rates 'got it' or 'didn't get it'
//   - Binary outcome only (no 5-point scale). Per the Brainscape
//     evaluation report, metacognitive nuance here invites overthinking
//     and inconsistent use between students.
//   - Full run of all prompts every time (no rolling scheduler yet).
//     Spaced scheduling ships in a follow-up PR once we have data.
//   - Ratings persisted to Firestore for future scheduling, but the
//     drill works offline-in-memory if the save fails. Students still
//     get the retrieval practice whether or not the write succeeds.
//
// Deliberately does not replicate Brainscape's UI. This is a warm-up
// before the real work (the NEI submission below on the same page),
// not a destination in itself.

import { useMemo, useState } from 'react';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '../lib/useAuth';
import { saveDrillRating, type DrillOutcome } from '../lib/drillStore';
import { saveDrillRatingWithScheduler } from '../lib/drillScheduler/firestore';
import { app } from '../lib/firebase';

export interface DrillItem {
  id: string;
  cue: string;
  answer: string;
}

export interface TerminologyDrillProps {
  topicId: string;
  items: DrillItem[];
}

type Phase = 'cue' | 'revealed' | 'done';

interface ItemResult {
  itemId: string;
  outcome: DrillOutcome;
}

export default function TerminologyDrill({
  topicId,
  items,
}: TerminologyDrillProps) {
  const { user } = useAuth();
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>('cue');
  const [results, setResults] = useState<ItemResult[]>([]);

  const current = items[cursor];
  const total = items.length;
  const summary = useMemo(() => {
    const got = results.filter((r) => r.outcome === 'got').length;
    return { got, total };
  }, [results, total]);

  async function rate(outcome: DrillOutcome) {
    if (!current) return;

    setResults((prev) => [
      ...prev,
      { itemId: current.id, outcome },
    ]);

    // Fire-and-forget save. Failure is silent on purpose; a broken save
    // should not interrupt the drill. We log to the console so problems
    // are discoverable during development.
    //
    // Sprint 6 Inc 6.4: scheduler write is the primary path. The wrapper
    // does a transactional read-modify-write that subsumes the legacy
    // 5-field save and adds the Leitner scheduler state. If the wrapper
    // throws (network, contention beyond retry, rules rejection) we fall
    // back to the legacy saveDrillRating so the rating still lands.
    // Risk 5 in docs/sprint-6-scope.md: the drill UX must keep working
    // even if the scheduler is broken.
    if (user) {
      const db = getFirestore(app);
      const uid = user.uid;
      const termId = current.id;
      void (async () => {
        try {
          await saveDrillRatingWithScheduler(db, uid, topicId, termId, outcome);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(
            'Scheduler write failed; falling back to legacy save:',
            err,
          );
          try {
            await saveDrillRating(uid, topicId, termId, outcome);
          } catch (fallbackErr) {
            // eslint-disable-next-line no-console
            console.warn(
              'Legacy drill rating save also failed:',
              fallbackErr,
            );
          }
        }
      })();
    }

    const next = cursor + 1;
    if (next >= total) {
      setPhase('done');
    } else {
      setCursor(next);
      setPhase('cue');
    }
  }

  function restart() {
    setCursor(0);
    setPhase('cue');
    setResults([]);
  }

  if (total === 0) {
    return null;
  }

  if (phase === 'done') {
    return (
      <div className="drill-done">
        <div className="drill-done__score">
          <span className="drill-done__got">{summary.got}</span>
          <span className="drill-done__divider">/</span>
          <span className="drill-done__total">{summary.total}</span>
        </div>
        <p className="drill-done__line">
          That's the warm-up done. Now put what you recalled into a full
          answer below.
        </p>
        <div className="drill-done__actions">
          <a href="#nei-assessment" className="drill-done__cta">
            Go to the question →
          </a>
          <button
            type="button"
            className="drill-done__restart"
            onClick={restart}
          >
            Run the drill again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="drill">
      <div className="drill__progress">
        <span className="drill__counter">
          {cursor + 1} of {total}
        </span>
        <div className="drill__progress-bar">
          <div
            className="drill__progress-fill"
            style={{ width: `${(cursor / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="drill__card">
        <div className="eyebrow">Cue</div>
        <p className="drill__cue">{current.cue}</p>

        {phase === 'revealed' && (
          <>
            <div className="drill__divider" />
            <div className="eyebrow">Term</div>
            <p className="drill__answer">{current.answer}</p>
          </>
        )}
      </div>

      {phase === 'cue' && (
        <div className="drill__actions">
          <button
            type="button"
            className="drill__reveal"
            onClick={() => setPhase('revealed')}
          >
            Reveal term
          </button>
        </div>
      )}

      {phase === 'revealed' && (
        <div className="drill__actions drill__actions--rate">
          <button
            type="button"
            className="drill__miss"
            onClick={() => rate('miss')}
          >
            Didn't get it
          </button>
          <button
            type="button"
            className="drill__got"
            onClick={() => rate('got')}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
