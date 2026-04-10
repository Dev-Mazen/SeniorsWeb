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

      <form onSubmit={handleSave} className="bg-surface-container-highest rounded-[2rem] p-8 md:p-10 editorial-shadow border border-outline-variant/10 relative overflow-hidden">
        {/* Decorative dark elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/10 pb-4">
          <span className="material-symbols-outlined text-outline">lock</span>
          <label className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">Your Private Memory</label>
        </div>

        <textarea
          className="w-full p-6 bg-surface-container-lowest rounded-2xl border-none focus:ring-2 focus:ring-primary/40 resize-none text-on-surface placeholder:text-outline/50 leading-relaxed font-medium editorial-shadow"
          rows={10}
          placeholder="Dear future me... What are your biggest dreams right now? What do you want to remember? What goals are you chasing?"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />

        <div className="mt-8 flex items-center justify-between p-5 bg-surface-container-lowest/50 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPrivate ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`}>
              <span className="material-symbols-outlined text-lg">{isPrivate ? "lock" : "public"}</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface flex items-center gap-2">
                Keep completely private 
                {isPrivate && <span className="text-[10px] uppercase font-black tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Secure</span>}
              </p>
              <p className="text-on-surface-variant text-xs mt-0.5">When off, admins can view your capsule</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${isPrivate ? "bg-red-500" : "bg-surface-container-low"}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-sm ${isPrivate ? "left-8" : "left-1"}`} />
          </button>
        </div>

        {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm mt-6 flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span> {error}</div>}
        {saved && (
          <div className="bg-green-500/10 text-green-600 p-4 rounded-xl text-sm mt-6 flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {existing ? "Capsule securely updated!" : "Capsule sealed!"}
          </div>
        )}

        <button type="submit" disabled={loading || !content.trim()} className="mt-8 w-full sunset-gradient py-4 rounded-full text-white font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
          <span className="material-symbols-outlined">{existing ? "update" : "lock"}</span>
          {loading ? "Sealing..." : existing ? "Update Capsule" : "Seal My Capsule"}
        </button>
      </form>

      {existing && (
        <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-high rounded-full w-full justify-center text-on-surface-variant text-xs font-bold uppercase tracking-wider mx-auto">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          Last updated {new Date(existing.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </div>
      )}
    </div>
  );
}