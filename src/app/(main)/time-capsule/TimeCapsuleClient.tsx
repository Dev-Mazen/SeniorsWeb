"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">
      <header className="mb-16 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-container to-secondary flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-700">
              <span className="material-symbols-outlined text-5xl md:text-6xl text-white drop-shadow-md">hourglass_top</span>
            </div>
          </div>
          
          <span className="text-[10px] font-black tracking-[0.5em] uppercase text-primary/60 mb-3">Chronicle of Memories</span>
          <h1 className="serif text-6xl md:text-8xl font-black text-on-surface leading-tight tracking-tighter mb-6">
            Time <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-container to-secondary italic pr-4">Capsule</span>
          </h1>
          <p className="text-on-surface-variant/80 text-xl max-w-2xl font-medium leading-relaxed">
            A digital sanctuary for your thoughts. Encapsulate your aspirations and let them mature as the years unfold.
          </p>
        </motion.div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="section-shell rounded-[3rem] p-1 md:p-2 editorial-shadow-lg ambient-anim scroll-scale"
      >
        <form onSubmit={handleSave} className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-[2.8rem] p-8 md:p-14 relative overflow-hidden group/form">
          {/* Decorative background gradients */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover/form:scale-110 transition-transform duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] pointer-events-none group-hover/form:scale-110 transition-transform duration-1000" />
          
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-outline-variant/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-xl">lock</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 leading-none mb-1">Encrypted Archive</p>
                <h3 className="text-sm font-black text-on-surface tracking-tight">Your Personal Archive</h3>
              </div>
            </div>
            {existing && (
               <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-high/40 rounded-full border border-outline-variant/10">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Active Vessel</p>
               </div>
            )}
          </div>

          <div className="relative group/textarea">
            <textarea
              className="w-full p-10 bg-surface-container/30 backdrop-blur-md rounded-[2.5rem] border-2 border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 resize-none text-on-surface placeholder:text-on-surface-variant/30 text-xl md:text-2xl font-medium leading-[1.8] editorial-shadow transition-all duration-500 min-h-[400px]"
              placeholder="Begin your transmission to the future..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            <div className="absolute top-6 left-6 pointer-events-none opacity-20 group-hover/textarea:opacity-40 transition-opacity">
               <span className="serif italic text-4xl text-primary">&quot;</span>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 text-red-500 p-6 rounded-2xl text-sm mt-8 flex items-center gap-4 border border-red-500/20 shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined">error</span>
              <p className="font-bold">{error}</p>
            </motion.div>
          )}

          {saved && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500/10 text-green-700 dark:text-green-400 p-6 rounded-2xl text-sm mt-8 flex items-center gap-4 border border-green-500/20 shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-2xl">verified</span>
              <p className="font-black text-base uppercase tracking-tight">{existing ? "Archive Synchronized" : "Transmission Encapsulated"}</p>
            </motion.div>
          )}

          <div className="mt-12">
            <button 
              type="submit" 
              disabled={loading || !content.trim()} 
              className="group/btn relative w-full overflow-hidden rounded-full p-[2px] transition-all hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] disabled:opacity-50 disabled:hover:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary animate-[gradient_4s_linear_infinite]" style={{ backgroundSize: '200% 100%' }} />
              <div className="relative bg-on-surface py-6 rounded-full flex items-center justify-center gap-3 transition-colors group-hover/btn:bg-on-surface/90">
                <span className="material-symbols-outlined text-white text-2xl group-hover/btn:rotate-12 transition-transform">{existing ? "history_edu" : "lock"}</span>
                <span className="text-white font-black text-lg tracking-widest uppercase">
                  {loading ? "Engaging Locks..." : existing ? "Synchronize Capsule" : "Initiate Encapsulation"}
                </span>
              </div>
            </button>
          </div>
        </form>
      </motion.div>

      {existing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-3 px-6 py-3 bg-surface-container-high/40 rounded-full border border-outline-variant/10 backdrop-blur-sm">
            <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
            <p className="text-on-surface-variant/70 text-[10px] font-black uppercase tracking-[0.2em]">
              Vessel Last Updated: {new Date(existing.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}