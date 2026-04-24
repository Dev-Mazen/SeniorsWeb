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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-surface-container-lowest">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3] 
          }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] bg-primary/20 z-0" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2] 
          }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[100px] bg-secondary/20 z-0" 
        />
      </div>

      <main className="relative z-10 w-full max-w-[440px]">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="bg-surface/80 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl shadow-primary/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary transform origin-left transition-transform duration-500 hover:scale-x-110"></div>
          
          <header className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center transform rotate-3"
            >
              <span className="material-symbols-outlined text-4xl text-primary transform -rotate-3">school</span>
            </motion.div>
            <h1 className="serif text-4xl sm:text-5xl font-black italic tracking-tighter text-on-surface mb-3">
              Seniors 2026
            </h1>
            <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed max-w-[280px] mx-auto">
              Enter the Archive. Your exclusive graduation story awaits.
            </p>
          </header>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2 group/input">
              <label className="block text-[11px] font-black tracking-[0.2em] uppercase text-on-surface-variant/70 ml-2 transition-colors group-focus-within/input:text-primary">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/60 select-none transition-colors group-focus-within/input:text-primary">person</span>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-high/50 hover:bg-surface-container-high focus:bg-surface-container border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-300 text-on-surface shadow-inner"
                  placeholder="your@email.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group/input">
              <label className="block text-[11px] font-black tracking-[0.2em] uppercase text-on-surface-variant/70 ml-2 transition-colors group-focus-within/input:text-primary">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/60 select-none transition-colors group-focus-within/input:text-primary">lock</span>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-high/50 hover:bg-surface-container-high focus:bg-surface-container border border-outline-variant/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-300 text-on-surface shadow-inner"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline/60 hover:text-on-surface focus:outline-none p-1 rounded-full hover:bg-on-surface/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] select-none block">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-sm py-3 px-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 shrink-0 text-sm mt-0.5">error</span>
                    <p className="leading-snug">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4 rounded-xl text-white font-bold text-lg overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-secondary group-hover:scale-105 transition-transform duration-500 ease-out" />
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Archive</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          <footer className="mt-10 pt-8 border-t border-outline-variant/20 text-center">
            <p className="text-on-surface-variant/50 text-[10px] font-black tracking-widest uppercase mb-4">
              Authorized access only
            </p>
            <div className="flex justify-center items-center gap-6 opacity-20 grayscale hover:grayscale-0 hover:opacity-40 transition-all duration-500">
              <span className="material-symbols-outlined text-2xl select-none hover:scale-110 transition-transform">auto_stories</span>
              <span className="material-symbols-outlined text-2xl select-none hover:scale-110 transition-transform">history_edu</span>
              <span className="material-symbols-outlined text-2xl select-none hover:scale-110 transition-transform">workspace_premium</span>
            </div>
          </footer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-8 text-center px-4"
        >
          <p className="text-on-surface-variant/40 text-[10px] tracking-[0.2em] uppercase font-bold">
            The Digital Curator &copy; Class of 2026
          </p>
        </motion.div>
      </main>
    </div>
  );
}