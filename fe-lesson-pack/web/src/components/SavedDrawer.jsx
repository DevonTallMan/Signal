import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../lib/firebase.js";

export default function SavedDrawer({ user, open, onClose, onOpenLesson }) {
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || !open) return;
    const q = query(
      collection(db, `users/${user.uid}/lessons`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user, open]);

  async function handleDelete(id) {
    if (!confirm("Delete this lesson?")) return;
    const fn = httpsCallable(functions, "deleteLesson");
    await fn({ lessonId: id });
  }

  const filtered = lessons.filter(l => {
    if (!search.trim()) return true;
    const needle = search.toLowerCase();
    return (
      l.topic?.toLowerCase().includes(needle) ||
      l.subject?.toLowerCase().includes(needle) ||
      l.level?.toLowerCase().includes(needle)
    );
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="ml-auto w-full max-w-md h-full bg-white border-l border-slate-200 shadow-xl relative flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold">Saved lessons</h3>
          <button className="btn-secondary text-xs" onClick={onClose}>Close</button>
        </div>
        <div className="px-5 py-3 border-b border-slate-200">
          <input
            className="field"
            placeholder="Search topic, subject, level…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="p-5 text-sm text-slate-500">
              {lessons.length === 0 ? "No lessons yet." : "Nothing matches that search."}
            </p>
          )}
          <ul className="divide-y divide-slate-100">
            {filtered.map(l => (
              <li key={l.id} className="p-4 hover:bg-slate-50">
                <button
                  className="text-left w-full"
                  onClick={() => { onOpenLesson(l); onClose(); }}
                >
                  <div className="font-medium text-sm">{l.topic}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {l.subject} — {l.level}
                  </div>
                </button>
                <button
                  className="text-xs text-slate-400 hover:text-red-600 mt-2"
                  onClick={() => handleDelete(l.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
