// src/components/AnswerArcDemo.tsx
//
// The Answer Arc demo for Signal's public landing page. A three-step
// wizard that lets an unauthenticated visitor try the N/E/I structure
// against a fixed CRM scenario, with local heuristic marking.
//
// Deliberately self-contained. No auth, no AXIOM-7 call, no Firestore.
// This is a marketing interaction, not a real submission. Its purpose
// is to communicate the shape of the Answer Arc to a visitor in under
// thirty seconds.
//
// Ported from the legacy Edtech landing's inline vanilla-JS demo at
// devontallman.github.io/Edtech/, with these changes:
//   - Ported to React + TypeScript
//   - Renamed 'Concept' to 'Name' throughout, to match Signal's
//     Answer Arc framework (the legacy C/E/I letters are from
//     before the rename; Signal is N/E/I everywhere else)
//   - CSS lifted into src/styles/landing.css (landing-only scope)
//   - CTA points to /signin (was login.html)
//
// The marking logic is deliberately kept simple (length thresholds
// and keyword presence) because this is a structural prompt, not
// an assessment. The copy on the caveat line tells visitors that
// the real platform marks their actual answer against the real
// scheme.

import { useState, type ChangeEvent } from 'react';

type StepIndex = 0 | 1 | 2;

interface StepConfig {
  letter: 'N' | 'E' | 'I';
  label: string;
  stepClass: string;
  pillClass: string;
  letterClass: string;
  mark: number;
  prompt: string;
  hint: string;
  placeholder: string;
  exemplar: string;
}

const STEPS: StepConfig[] = [
  {
    letter: 'N',
    label: 'NAME',
    stepClass: 'stN',
    pillClass: '',
    letterClass: 'n',
    mark: 1,
    prompt: 'Name the specific technique or feature.',
    hint: 'One sentence. What, exactly, is the business doing with the CRM?',
    placeholder: 'e.g. customer segmentation by purchase history...',
    exemplar: 'Customer segmentation based on purchase history and frequency.',
  },
  {
    letter: 'E',
    label: 'EXPLAIN',
    stepClass: 'stE',
    pillClass: 'pe',
    letterClass: 'e',
    mark: 2,
    prompt: 'Explain how it works.',
    hint: 'The mechanism, not the definition. Use words like "because", "by", or "allows".',
    placeholder:
      'e.g. the CRM groups customers by purchase value, allowing...',
    exemplar:
      'The CRM analyses past transactions and groups customers into tiers by value and buying pattern, allowing the business to identify who is high-spend, who is lapsing, and who is one-off.',
  },
  {
    letter: 'I',
    label: 'IMPACT',
    stepClass: 'stI',
    pillClass: 'pi',
    letterClass: 'i',
    mark: 3,
    prompt: 'State the business consequence.',
    hint: 'Name a measurable outcome. Retention, revenue, cost, efficiency.',
    placeholder: 'e.g. increases retention by targeting high-value customers...',
    exemplar:
      'This increases customer lifetime value because targeted retention campaigns cost less than acquiring new customers, protecting recurring revenue.',
  },
];

// Heuristic keyword lists, lifted unchanged from Edtech source.
// Not a real marking engine, see module docstring.
const EXPLAIN_KEYWORDS = [
  'because',
  'by ',
  'allow',
  'enable',
  'so that',
  'which',
  'means',
  'through',
];

const IMPACT_KEYWORDS = [
  'increas',
  'reduc',
  'improv',
  'revenue',
  'cost',
  'retain',
  'retention',
  'customer',
  'loyalty',
  'efficien',
  'profit',
  'sales',
  'save',
  'saving',
  'lifetime',
  'growth',
  'advantage',
];

interface Marking {
  total: 0 | 1 | 2 | 3;
  nameMark: boolean;
  explainMark: boolean;
  impactMark: boolean;
  status: string;
  nameFeedback: { pass: boolean; text: string };
  explainFeedback: { pass: boolean; text: string };
  impactFeedback: { pass: boolean; text: string };
}

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

function mark(answers: [string, string, string]): Marking {
  const [nameRaw, explainRaw, impactRaw] = answers;
  const name = nameRaw.trim();
  const explain = explainRaw.trim();
  const impact = impactRaw.trim();

  const nameMark = name.length >= 8;
  const explainMark =
    explain.length >= 15 && containsAny(explain, EXPLAIN_KEYWORDS);
  const impactMark =
    impact.length >= 10 && containsAny(impact, IMPACT_KEYWORDS);

  const total = ((nameMark ? 1 : 0) +
    (explainMark ? 1 : 0) +
    (impactMark ? 1 : 0)) as 0 | 1 | 2 | 3;

  let status: string;
  if (total === 3) status = '// FULL MARKS // STRUCTURAL MOVE COMPLETE';
  else if (total === 2) status = '// TWO OF THREE // WHERE MOST STUDENTS STOP';
  else if (total === 1) status = '// PARTIAL // NAMED BUT NOT EXPLAINED';
  else status = '// STRUCTURE THIN // SEE WORKED EXAMPLE';

  return {
    total,
    nameMark,
    explainMark,
    impactMark,
    status,
    nameFeedback: {
      pass: nameMark,
      text: nameMark
        ? 'Name given.'
        : 'Too thin. Name the specific technique.',
    },
    explainFeedback: {
      pass: explainMark,
      text: explainMark
        ? 'Mechanism explained.'
        : 'No mechanism. Use "because" or "by".',
    },
    impactFeedback: {
      pass: impactMark,
      text: impactMark
        ? 'Impact stated.'
        : 'No business outcome named.',
    },
  };
}

export default function AnswerArcDemo() {
  const [step, setStep] = useState<StepIndex>(0);
  const [answers, setAnswers] = useState<[string, string, string]>([
    '',
    '',
    '',
  ]);
  const [marking, setMarking] = useState<Marking | null>(null);
  const [shakeStep, setShakeStep] = useState<StepIndex | null>(null);

  function updateAnswer(index: StepIndex, value: string) {
    setAnswers((prev) => {
      const next = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  }

  function attemptAdvance(from: StepIndex) {
    if (answers[from].trim().length < 3) {
      setShakeStep(from);
      setTimeout(() => setShakeStep(null), 1200);
      return;
    }
    if (from < 2) {
      setStep((from + 1) as StepIndex);
    }
  }

  function attemptSubmit() {
    if (answers[2].trim().length < 3) {
      setShakeStep(2);
      setTimeout(() => setShakeStep(null), 1200);
      return;
    }
    setMarking(mark(answers));
  }

  function showExample(index: StepIndex) {
    updateAnswer(index, STEPS[index].exemplar);
  }

  function reset() {
    setMarking(null);
    setStep(0);
    setAnswers(['', '', '']);
    setShakeStep(null);
  }

  return (
    <div className="aarc-root">
      <div className="aarc-prog">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`aarc-dot${i <= step || marking ? ' on' : ''}`}
          />
        ))}
      </div>

      <div className="aarc-scn">
        <p className="aarc-scn-l">T-LEVEL DIGITAL // SCENARIO</p>
        <p className="aarc-scn-t">
          A retail business has introduced a CRM system to manage customer
          data. Explain one benefit of this to the business.
        </p>
      </div>

      {!marking && (
        <>
          {STEPS.map((cfg, i) => {
            const index = i as StepIndex;
            const hidden = index > step;
            return (
              <StepCard
                key={cfg.letter}
                cfg={cfg}
                index={index}
                hidden={hidden}
                value={answers[index]}
                shaking={shakeStep === index}
                onChange={(v) => updateAnswer(index, v)}
                onNext={() => attemptAdvance(index)}
                onSubmit={attemptSubmit}
                onShowExample={() => showExample(index)}
                isLast={index === 2}
              />
            );
          })}
        </>
      )}

      {marking && (
        <ResultCard
          marking={marking}
          answers={answers}
          onReset={reset}
        />
      )}
    </div>
  );
}

interface StepCardProps {
  cfg: StepConfig;
  index: StepIndex;
  hidden: boolean;
  value: string;
  shaking: boolean;
  onChange: (v: string) => void;
  onNext: () => void;
  onSubmit: () => void;
  onShowExample: () => void;
  isLast: boolean;
}

function StepCard({
  cfg,
  hidden,
  value,
  shaking,
  onChange,
  onNext,
  onSubmit,
  onShowExample,
  isLast,
}: StepCardProps) {
  if (hidden) return null;
  return (
    <div className={`aarc-step ${cfg.stepClass}`}>
      <div className="aarc-sh">
        <div className={`aarc-ltr ${cfg.letterClass}`}>{cfg.letter}</div>
        <div className="aarc-sm">
          <p className="aarc-sl">
            STEP {cfg.mark} / 3 // {cfg.label}
          </p>
        </div>
        <div className={`aarc-pill${cfg.pillClass ? ' ' + cfg.pillClass : ''}`}>
          MARK {cfg.mark}
        </div>
      </div>
      <p className="aarc-pmt">{cfg.prompt}</p>
      <p className="aarc-hnt">{cfg.hint}</p>
      <textarea
        className={`aarc-ta${shaking ? ' bad' : ''}`}
        placeholder={cfg.placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
      />
      <div className="aarc-act">
        <button
          type="button"
          className="aarc-btn pri"
          onClick={isLast ? onSubmit : onNext}
        >
          {isLast ? 'SEE MY ANSWER MARKED ⟶' : 'NEXT ⟶'}
        </button>
        <button type="button" className="aarc-lnk" onClick={onShowExample}>
          Show a worked example
        </button>
      </div>
    </div>
  );
}

interface ResultCardProps {
  marking: Marking;
  answers: [string, string, string];
  onReset: () => void;
}

function ResultCard({ marking, answers, onReset }: ResultCardProps) {
  const markClass =
    marking.total === 3
      ? ''
      : marking.total === 2
        ? 'pt'
        : 'fl';

  return (
    <div className="aarc-res">
      <div className="aarc-rt">
        <div className={`aarc-mk${markClass ? ' ' + markClass : ''}`}>
          {marking.total}
          <span className="of">/ 3 MARKS</span>
        </div>
        <p className="aarc-rst">{marking.status}</p>
      </div>

      <div className="aarc-ans">
        <span className="aarc-prt aarc-prtN">{answers[0]}</span>{' '}
        <span className="aarc-prt aarc-prtE">{answers[1]}</span>{' '}
        <span className="aarc-prt aarc-prtI">{answers[2]}</span>
      </div>

      <div className="aarc-bk">
        <FeedbackLine label="NAME" fb={marking.nameFeedback} />
        <FeedbackLine label="EXPLAIN" fb={marking.explainFeedback} />
        <FeedbackLine label="IMPACT" fb={marking.impactFeedback} />
      </div>

      <p className="aarc-cv">
        This demo scores structure. The platform marks your actual answer
        against the real scheme, with feedback on specificity, terminology,
        and depth.
      </p>

      <div className="aarc-ft">
        <a href="/signin" className="aarc-btn pri aarc-cta-link">
          ACCESS THE PLATFORM ⟶
        </a>
        <button type="button" className="aarc-lnk" onClick={onReset}>
          Try another answer
        </button>
      </div>
    </div>
  );
}

function FeedbackLine({
  label,
  fb,
}: {
  label: string;
  fb: { pass: boolean; text: string };
}) {
  return (
    <div className="aarc-bl">
      <span className="aarc-bll">{label}</span>
      <span className="aarc-bt">
        <span className={fb.pass ? 'aarc-ok' : 'aarc-no'}>
          {fb.pass ? 'PASS' : 'FAIL'}
        </span>{' '}
        {fb.text}
      </span>
    </div>
  );
}
