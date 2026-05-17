import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./lib/firebase.js";
import SignIn from "./components/SignIn.jsx";
import LessonForm from "./components/LessonForm.jsx";
import LessonView from "./components/LessonView.jsx";
import SavedDrawer from "./components/SavedDrawer.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  async function handleGenerate(input) {
    setError(null);
    setBusy(true);
    setLesson({ ...input, components: {} });
    try {
      const fn = httpsCallable(functions, "generate");
      const res = await fn(input);
      setLesson(res.data);
    } catch (err) {
      console.error("Generation failed", err);
      setError(err.message || "Generation failed");
      setLesson(null);
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }
  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold">FE Lesson Pack</h1>
            <span className="text-xs text-slate-500 hidden sm:inline">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs" onClick={() => setSavedOpen(true)}>
              Saved
            </button>
            <button className="btn-secondary text-xs" onClick={() => signOut(auth)}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[360px_1fr]">
        <div>
          <LessonForm onGenerate={handleGenerate} busy={busy} />
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              {error}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            Generations cost a few pence each. Daily cap is set in the function.
          </p>
        </div>
        <LessonView lesson={lesson} busy={busy} />
      </main>

      <SavedDrawer
        user={user}
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        onOpenLesson={setLesson}
      />
    </div>
  );
}
