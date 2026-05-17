import { useState, useMemo } from "react";
import { COMPONENTS } from "../lib/components.js";

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

function formatPack(lesson) {
  if (!lesson) return "";
  const header = `# ${lesson.topic}\n${lesson.subject} — ${lesson.level}\n\n`;
  return header + COMPONENTS.map(c => {
    const body = lesson.components?.[c.key] || "(missing)";
    return `## ${c.title}\n\n${body}`;
  }).join("\n\n");
}

export default function LessonView({ lesson, busy }) {
  const [active, setActive] = useState(COMPONENTS[0].key);

  const activeBody = useMemo(() => {
    if (!lesson?.components) return "";
    return lesson.components[active] || "";
  }, [lesson, active]);

  if (!lesson && !busy) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-slate-500 text-sm">
        Fill in a topic on the left, then generate. Output appears here.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              {lesson?.topic || (busy ? "Generating…" : "")}
            </h2>
            <p className="text-sm text-slate-500">
              {lesson ? `${lesson.subject} — ${lesson.level}` : ""}
            </p>
          </div>
          {lesson && (
            <button
              className="btn-secondary text-xs"
              onClick={() => copyToClipboard(formatPack(lesson))}
            >
              Copy all as Markdown
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 px-3 pt-3 overflow-x-auto border-b border-slate-200 bg-slate-50">
        {COMPONENTS.map(c => {
          const filled = !!lesson?.components?.[c.key];
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={[
                "px-3 py-2 text-xs rounded-t-md whitespace-nowrap transition-colors",
                isActive
                  ? "bg-white border-t border-x border-slate-200 text-slate-900 -mb-px font-medium"
                  : "text-slate-500 hover:text-slate-900",
                !filled && busy ? "animate-pulse" : ""
              ].join(" ")}
            >
              {c.title}
              {!filled && busy && <span className="ml-1 text-slate-400">…</span>}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {activeBody ? (
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-relaxed">
            {activeBody}
          </div>
        ) : (
          <div className="text-slate-400 text-sm">
            {busy ? "Working…" : "Empty"}
          </div>
        )}
        {activeBody && (
          <div className="mt-4">
            <button
              className="btn-secondary text-xs"
              onClick={() => copyToClipboard(activeBody)}
            >
              Copy this section
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
