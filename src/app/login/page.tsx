"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-surface text-on-surface">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            opacity: [0.1, 0.3, 0.1] 
          }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px] bg-primary/20" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            opacity: [0.1, 0.2, 0.1] 
          }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] bg-secondary/20" 
        />
      </div>

      <main className="relative z-10 w-full max-w-[500px]">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="section-shell rounded-[3rem] p-1 shadow-2xl overflow-hidden"
        >
          <div className="bg-surface-container-lowest/40 backdrop-blur-3xl rounded-[2.8rem] p-10 md:p-14 relative overflow-hidden">
            <header className="text-center mb-12">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary border border-primary/20 rotate-6 hover:rotate-0 transition-transform duration-500"
              >
                <span className="material-symbols-outlined text-4xl">school</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 border border-primary/10 mb-6"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Identity Verification Required</span>
              </motion.div>

              <h1 className="serif text-5xl md:text-6xl font-black text-on-surface leading-none tracking-tighter mb-4">
                Class of <span className="text-primary italic">2026.</span>
              </h1>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
                Access your exclusive graduation chronicle.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 ml-2">Digital Signature (Email)</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-lg group-focus-within/input:text-primary transition-colors">person</span>
                  <input
                    className="w-full pl-16 pr-6 py-5 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[1.5rem] border border-outline-variant/10 focus:border-primary/30 transition-all text-on-surface font-medium placeholder:text-on-surface-variant/20 focus:outline-none focus:ring-4 focus:ring-primary/5"
                    placeholder="name@institute.edu"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 ml-2">Access Sequence (Password)</label>
                <div className="relative group/input">
                  <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-lg group-focus-within/input:text-primary transition-colors">lock</span>
                  <input
                    className="w-full pl-16 pr-14 py-5 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[1.5rem] border border-outline-variant/10 focus:border-primary/30 transition-all text-on-surface font-medium placeholder:text-on-surface-variant/20 focus:outline-none focus:ring-4 focus:ring-primary/5"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30 hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined">report</span> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-6 rounded-full bg-on-surface text-background font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20 active:scale-95 disabled:opacity-30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Decrypt Archive</span>
                        <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            <footer className="mt-12 pt-10 border-t border-outline-variant/10 text-center">
              <p className="text-[10px] font-black tracking-[0.4em] uppercase text-on-surface-variant/30 mb-8">
                Authorized Access Protocol 20.26
              </p>
              <div className="flex justify-center gap-10 opacity-20">
                <span className="material-symbols-outlined text-3xl">auto_stories</span>
                <span className="material-symbols-outlined text-3xl">history_edu</span>
                <span className="material-symbols-outlined text-3xl">workspace_premium</span>
              </div>
            </footer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-on-surface-variant/40 text-[9px] tracking-[0.4em] uppercase font-black">
            The Digital Curator &copy; MCMXXVI
          </p>
        </motion.div>
      </main>
    </div>
  );
}