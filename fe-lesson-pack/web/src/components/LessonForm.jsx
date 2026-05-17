import { useState } from "react";
import { LEVELS } from "../lib/components.js";

export default function LessonForm({ onGenerate, busy }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Level 2");

  function submit(e) {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;
    onGenerate({ subject: subject.trim(), topic: topic.trim(), level });
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div>
        <label className="label" htmlFor="subject">Subject</label>
        <input
          id="subject"
          className="field"
          placeholder="e.g. English"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          maxLength={100}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="topic">Topic</label>
        <input
          id="topic"
          className="field"
          placeholder="e.g. Using semicolons correctly"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          maxLength={200}
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="level">Level</label>
        <select
          id="level"
          className="field"
          value={level}
          onChange={e => setLevel(e.target.value)}
        >
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Generating…" : "Generate pack"}
      </button>
    </form>
  );
}
