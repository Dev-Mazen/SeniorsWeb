"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Capsule = { id: string; content: string; is_private: boolean; created_at: string; updated_at: string };

export default function TimeCapsuleClient({ existing, userId }: { existing: Capsule | null; userId: string }) {
  const [content, setContent] = useState(existing?.content ?? "");
  const [isPrivate, setIsPrivate] = useState(existing?.is_private ?? false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true); setError(""); setSaved(false);
    const supabase = createClient();
    if (existing) {
      const { error: err } = await supabase.from("time_capsules").update({ content, is_private: isPrivate, updated_at: new Date().toISOString() }).eq("author_id", userId);
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { error: err } = await supabase.from("time_capsules").insert({ author_id: userId, content, is_private: isPrivate });
      if (err) { setError(err.message); setLoading(false); return; }
    }
    setSaved(true); setLoading(false);
    setTimeout(() => setSaved(false), 4000);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 pt-12 pb-32">
      {/* Hero */}
      <header className="mb-12 text-center">
        <div className="w-20 h-20 rounded-full sunset-gradient flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="material-symbols-outlined text-4xl text-white">hourglass_top</span>
        </div>
        <h1 className="serif text-5xl font-black text-on-surface mb-4">Time <span className="text-primary italic">Capsule</span></h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Write a message to your future self. Your hopes, your dreams, and everything you want to remember from this year.
        </p>
      </header>

      <form onSubmit={handleSave} className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
        <label className="block text-sm font-black uppercase tracking-widest text-on-surface-variant mb-3">Your Message to the Future</label>
        <textarea
          className="w-full p-5 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 resize-none text-on-surface placeholder:text-outline/60 leading-relaxed"
          rows={10}
          placeholder="Dear future me... What are your biggest dreams right now? What do you want to remember? What goals are you chasing?"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />

        <div className="mt-6 flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
          <div>
            <p className="font-bold text-sm">Keep private from admin</p>
            <p className="text-on-surface-variant text-xs">When off, your capsule is visible to admins</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isPrivate ? "bg-primary" : "bg-surface-container-highest"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${isPrivate ? "left-7" : "left-1"}`} />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {saved && (
          <p className="text-green-600 text-sm mt-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {existing ? "Capsule updated!" : "Capsule saved!"}
          </p>
        )}

        <button type="submit" disabled={loading || !content.trim()} className="mt-6 w-full sunset-gradient py-4 rounded-full text-white font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">save</span>
          {loading ? "Saving..." : existing ? "Update Capsule" : "Seal My Capsule"}
        </button>
      </form>

      {existing && (
        <div className="mt-8 p-5 bg-surface-container-low rounded-xl text-center text-on-surface-variant text-sm">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {" "}Last updated {new Date(existing.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      )}
    </div>
  );
}