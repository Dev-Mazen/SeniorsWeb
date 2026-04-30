"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Question = {
  id: string;
  question: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
};

export default function QuestionsClient({ questions: initial }: { questions: Question[] }) {
  const [questions, setQuestions] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  async function addQuestion() {
    if (!newText.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const nextOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.display_order)) + 1 : 1;
    const { data, error } = await supabase
      .from("awards_questions")
      .insert({ question: newText.trim(), display_order: nextOrder, is_active: true })
      .select()
      .single();
    if (!error && data) {
      setQuestions((prev) => [...prev, data]);
      setNewText("");
      setAdding(false);
    }
    setLoading(false);
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("awards_questions").update({ question: editText.trim() }).eq("id", editingId);
    setQuestions((prev) =>
      prev.map((q) => (q.id === editingId ? { ...q, question: editText.trim() } : q))
    );
    setEditingId(null);
    setEditText("");
    setLoading(false);
  }

  async function toggleActive(q: Question) {
    const supabase = createClient();
    await supabase.from("awards_questions").update({ is_active: !q.is_active }).eq("id", q.id);
    setQuestions((prev) => prev.map((item) => (item.id === q.id ? { ...item, is_active: !item.is_active } : item)));
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this award question? This cannot be undone.")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("awards_questions").delete().eq("id", id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setLoading(false);
  }

  const sorted = [...questions].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-5xl mx-auto px-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
             <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Academic Recognition Protocol</p>
          </div>
          <h2 className="serif text-6xl font-black tracking-tighter text-on-surface pb-2">Award <span className="italic text-primary">Questions</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 flex items-center gap-4">
             <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {questions.length} Protocols Loaded</span>
             <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
             <span className="flex items-center gap-2 text-green-600"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" /> {questions.filter((q) => q.is_active).length} Active for Voting</span>
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="group relative flex items-center gap-4 px-10 py-5 bg-on-surface text-surface rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-black/10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <span className="material-symbols-outlined text-xl relative z-10">add_circle</span>
          <span className="relative z-10">Deploy New Category</span>
        </button>
      </header>

      {/* Add form Overlay/Card */}
      {adding && (
        <div className="mb-12 animate-in zoom-in-95 duration-500 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-xl opacity-50" />
          <div className="bg-white/80 dark:bg-neutral-950/60 backdrop-blur-3xl rounded-[3rem] p-10 border border-primary/20 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined font-black">edit_note</span>
               </div>
               <h4 className="serif text-2xl font-black text-on-surface">Category Definition</h4>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <input
                autoFocus
                className="flex-1 px-8 py-6 bg-surface-container-high/40 dark:bg-white/5 rounded-[2rem] border border-outline-variant/10 focus:outline-none focus:ring-4 focus:ring-primary/10 text-on-surface text-xl font-bold tracking-tight placeholder:opacity-30 placeholder:font-normal transition-all"
                placeholder="e.g. Most Likely to Innovate..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addQuestion()}
              />
              <div className="flex gap-4">
                <button
                  onClick={addQuestion}
                  disabled={loading || !newText.trim()}
                  className="px-10 py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest disabled:opacity-30 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500"
                >
                  Confirm Deployment
                </button>
                <button
                  onClick={() => { setAdding(false); setNewText(""); }}
                  className="px-8 py-6 bg-on-surface/5 dark:bg-white/5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500"
                >
                  Abort
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions list Canvas */}
      <div className="space-y-6 pb-40">
        {sorted.length === 0 ? (
          <div className="text-center py-40 bg-white/40 dark:bg-neutral-950/20 rounded-[4rem] border-2 border-outline-variant/10 border-dashed backdrop-blur-3xl group">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-700">
               <span className="material-symbols-outlined text-6xl text-primary/20">emoji_events</span>
            </div>
            <h3 className="serif text-3xl font-black text-on-surface tracking-tight mb-3">No Protocols Active</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Initiate category deployment to begin the awards sequence.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sorted.map((q, i) => (
              <div
                key={q.id}
                className={`group flex items-center gap-8 p-8 bg-white/60 dark:bg-neutral-950/40 backdrop-blur-3xl rounded-[3rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] hover:scale-[1.01] hover:border-primary/20 transition-all duration-700 ${!q.is_active ? "opacity-60" : ""}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-on-surface/5 dark:bg-white/5 flex items-center justify-center text-sm font-black text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shadow-inner">
                  {String(i + 1).padStart(2, '0')}
                </div>

                {editingId === q.id ? (
                  <input
                    autoFocus
                    className="flex-1 px-6 py-4 bg-surface-container-high/50 dark:bg-white/5 rounded-2xl border-none focus:outline-none focus:ring-4 focus:ring-primary/10 text-on-surface text-lg font-bold tracking-tight"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className={`serif text-2xl font-black tracking-tight leading-none ${!q.is_active ? "text-on-surface-variant/40" : "text-on-surface group-hover:text-primary"} transition-colors duration-500`}>
                      {q.question}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Protocol ID: {q.id.slice(0,8)}</span>
                       <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
                       <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${q.is_active ? "text-green-600" : "text-red-400"}`}>{q.is_active ? "Active Stream" : "System Offline"}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(q)}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      q.is_active
                        ? "bg-green-500/10 text-green-600 shadow-lg shadow-green-500/10"
                        : "bg-on-surface/5 text-on-surface-variant/20"
                    } hover:scale-110 active:scale-95`}
                  >
                    <span className="material-symbols-outlined text-3xl font-black">
                      {q.is_active ? "toggle_on" : "toggle_off"}
                    </span>
                  </button>

                  {editingId === q.id ? (
                    <div className="flex gap-3">
                      <button
                        onClick={saveEdit}
                        disabled={loading}
                        className="w-14 h-14 rounded-2xl bg-primary text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-500 shadow-2xl shadow-primary/20"
                      >
                        <span className="material-symbols-outlined text-2xl font-black">check</span>
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditText(""); }}
                        className="w-14 h-14 rounded-2xl bg-on-surface/5 dark:bg-white/5 text-on-surface-variant flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-500"
                      >
                        <span className="material-symbols-outlined text-2xl">close</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => { setEditingId(q.id); setEditText(q.question); }}
                        className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-outline-variant/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-500"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-outline-variant/10 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 text-red-400"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
