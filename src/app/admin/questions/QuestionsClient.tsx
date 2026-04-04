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
    <div>
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface" style={{ fontFamily: "'Noto Serif', serif" }}>
            Award Questions
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {questions.length} questions · {questions.filter((q) => q.is_active).length} active
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Question
        </button>
      </header>

      {/* Add form */}
      {adding && (
        <div className="bg-surface-container-lowest rounded-xl p-5 mb-6 border-2 border-primary/20">
          <p className="text-sm font-bold text-on-surface mb-3">New Award Question</p>
          <div className="flex gap-3">
            <input
              autoFocus
              className="flex-1 px-4 py-3 bg-surface-container-high rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-on-surface text-sm"
              placeholder="e.g. Most Likely to Succeed..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addQuestion()}
            />
            <button
              onClick={addQuestion}
              disabled={loading || !newText.trim()}
              className="px-5 py-3 bg-primary text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-all"
            >
              Save
            </button>
            <button
              onClick={() => { setAdding(false); setNewText(""); }}
              className="px-4 py-3 bg-surface-container-high rounded-lg text-sm hover:bg-surface-container transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30 block mb-4">emoji_events</span>
            No questions yet. Add your first award question above.
          </div>
        ) : (
          <div className="divide-y divide-surface-container-low">
            {sorted.map((q, i) => (
              <div
                key={q.id}
                className="flex items-center gap-4 p-5 hover:bg-surface-container-low transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-black text-on-surface-variant flex-shrink-0">
                  {i + 1}
                </span>

                {editingId === q.id ? (
                  <input
                    autoFocus
                    className="flex-1 px-4 py-2.5 bg-surface-container-high rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-on-surface text-sm"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${!q.is_active ? "opacity-40 line-through" : "text-on-surface"}`}>
                      {q.question}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* active toggle */}
                  <button
                    onClick={() => toggleActive(q)}
                    title={q.is_active ? "Deactivate" : "Activate"}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      q.is_active
                        ? "text-green-600 hover:bg-green-100"
                        : "text-on-surface-variant/40 hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {q.is_active ? "toggle_on" : "toggle_off"}
                    </span>
                  </button>

                  {editingId === q.id ? (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={loading}
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditText(""); }}
                        className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container flex items-center justify-center transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingId(q.id); setEditText(q.question); }}
                        className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-all text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="w-8 h-8 rounded-full hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </>
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
