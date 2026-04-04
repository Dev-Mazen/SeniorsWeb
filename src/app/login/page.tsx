"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{backgroundColor:"#fcf9f4"}}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{background:"linear-gradient(135deg,rgba(159,64,45,0.15) 0%,rgba(93,84,164,0.1) 100%)"}} />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full blur-[100px] z-0" style={{background:"rgba(176,166,253,0.2)"}} />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full blur-[80px] z-0" style={{background:"rgba(226,114,91,0.1)"}} />

      <main className="relative z-10 w-full max-w-[480px]">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel editorial-shadow rounded-xl p-8 md:p-12 border border-white/30"
        >
          <header className="text-center mb-10">
            <h1 className="serif text-5xl md:text-6xl font-black italic tracking-tighter text-on-surface mb-4">
              Seniors 2026
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-[280px] mx-auto">
              Enter the Archive. Your graduation story begins here.
            </p>
          </header>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold tracking-widest uppercase text-on-surface-variant/70 ml-2">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline select-none">person</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 text-on-surface"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold tracking-widest uppercase text-on-surface-variant/70 ml-2">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline select-none">lock</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 text-on-surface"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center bg-red-50 py-3 px-4 rounded-lg">{error}</p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="sunset-gradient w-full py-5 rounded-full text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform select-none">arrow_forward</span>}
              </button>
            </div>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-on-surface-variant/60 text-xs tracking-widest uppercase">
              Contact your admin for access
            </p>
            <div className="mt-10 flex justify-center items-center gap-8 opacity-25">
              <span className="material-symbols-outlined text-4xl select-none">auto_stories</span>
              <span className="material-symbols-outlined text-4xl select-none">history_edu</span>
              <span className="material-symbols-outlined text-4xl select-none">school</span>
            </div>
          </footer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-8 text-center px-4"
        >
          <p className="text-on-surface-variant/60 text-xs tracking-widest uppercase">
            The Digital Curator © Class of 2026
          </p>
        </motion.div>
      </main>
    </div>
  );
}