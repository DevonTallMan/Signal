const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const Anthropic = require("@anthropic-ai/sdk");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "europe-west2", maxInstances: 5 });

const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

// Optional: lock to a single email. Leave empty to allow any signed-in user.
const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL || "";
const DAILY_CALL_LIMIT = 40;

const MODEL = "claude-sonnet-4-6";

const COMPONENTS = [
  {
    key: "overview",
    title: "Lesson overview",
    instruction:
      "Two short paragraphs. First: what this lesson is and where it sits in a scheme of work. Second: the single most important thing the learner should leave able to do."
  },
  {
    key: "outcomes",
    title: "Learning outcomes",
    instruction:
      "Three to five outcomes, each beginning with a Bloom verb appropriate to the level. Each on its own line, prefixed with '- '."
  },
  {
    key: "starter",
    title: "Starter activity",
    instruction:
      "A 5 to 10 minute opener. Include the exact prompt or question the teacher reads aloud or projects, plus a one-sentence note on what to listen for in answers."
  },
  {
    key: "main",
    title: "Main activity",
    instruction:
      "A 25 to 35 minute core activity. Step-by-step. Include timings per step. Include at least one worked example if the topic admits one."
  },
  {
    key: "differentiation",
    title: "Differentiation",
    instruction:
      "Two short sections labelled 'Support' and 'Stretch'. Three concrete moves under each. No generic phrases like 'use scaffolding' without saying what the scaffold is."
  },
  {
    key: "assessment",
    title: "Checks for understanding",
    instruction:
      "Three quick formative checks: one cold-call question, one written exit ticket, one peer-check task. Include exemplar answers."
  },
  {
    key: "plenary",
    title: "Plenary",
    instruction:
      "A 5 to 10 minute close. Should require the learner to articulate what they now know that they did not at the start. Avoid 'thumbs up / thumbs down'."
  }
];

function systemPrompt(subject, topic, level) {
  return `You are an experienced UK further education lecturer planning a 60-minute lesson.

Subject: ${subject}
Topic: ${topic}
Level: ${level}

Write for a specific real cohort at this level. Avoid filler, hedging, and pedagogy buzzwords. Be concrete. Use British English spelling.

Output strict JSON only, no surrounding prose or markdown fences. The JSON object must have exactly these keys: ${COMPONENTS.map(c => `"${c.key}"`).join(", ")}.

For each key, follow the instruction:

${COMPONENTS.map(c => `- ${c.key}: ${c.instruction}`).join("\n")}

Every value must be a string. Use \\n for line breaks within strings. Do not include any key not listed above.`;
}

function parseJsonResponse(text) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

async function checkAndIncrementUsage(uid) {
  const today = new Date().toISOString().slice(0, 10);
  const ref = db.doc(`users/${uid}/usage/${today}`);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? (snap.data().count || 0) : 0;
    if (count >= DAILY_CALL_LIMIT) {
      throw new HttpsError(
        "resource-exhausted",
        `Daily limit of ${DAILY_CALL_LIMIT} generations reached.`
      );
    }
    tx.set(ref, {
      count: count + 1,
      lastAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return count + 1;
  });
}

exports.generate = onCall(
  {
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 120,
    memory: "512MiB"
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required.");
    }
    if (ALLOWED_EMAIL && request.auth.token.email !== ALLOWED_EMAIL) {
      throw new HttpsError("permission-denied", "This account is not allowed.");
    }

    const { subject, topic, level } = request.data || {};
    for (const [k, v] of Object.entries({ subject, topic, level })) {
      if (typeof v !== "string" || !v.trim() || v.length > 200) {
        throw new HttpsError("invalid-argument", `Missing or invalid: ${k}`);
      }
    }

    await checkAndIncrementUsage(request.auth.uid);

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() });

    let pack;
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4000,
        system: systemPrompt(subject.trim(), topic.trim(), level.trim()),
        messages: [
          { role: "user", content: "Generate the lesson pack now." }
        ]
      });
      const text = response.content
        .filter(block => block.type === "text")
        .map(block => block.text)
        .join("");
      pack = parseJsonResponse(text);
    } catch (err) {
      console.error("Generation failed", err);
      throw new HttpsError("internal", err.message || "Generation failed");
    }

    for (const c of COMPONENTS) {
      if (typeof pack[c.key] !== "string") {
        pack[c.key] = "(missing — regenerate)";
      }
    }

    const lessonId = db.collection("_").doc().id;
    const lessonRef = db.doc(`users/${request.auth.uid}/lessons/${lessonId}`);
    const lessonDoc = {
      subject: subject.trim(),
      topic: topic.trim(),
      level: level.trim(),
      components: pack,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      model: MODEL
    };
    await lessonRef.set(lessonDoc);

    return { lessonId, ...lessonDoc, createdAt: Date.now() };
  }
);

exports.deleteLesson = onCall({ timeoutSeconds: 30 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const { lessonId } = request.data || {};
  if (typeof lessonId !== "string" || !lessonId) {
    throw new HttpsError("invalid-argument", "lessonId required");
  }
  await db.doc(`users/${request.auth.uid}/lessons/${lessonId}`).delete();
  return { ok: true };
});
