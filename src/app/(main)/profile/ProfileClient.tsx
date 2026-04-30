"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type ProfileData = {
  full_name?: string | null;
  email?: string | null;
  nickname?: string | null;
  quote?: string | null;
  fun_fact?: string | null;
  photo_url?: string | null;
};

export default function ProfileClient({ profile, userId }: { profile: ProfileData | null; userId: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [quote, setQuote] = useState(profile?.quote || "");
  const [funFact, setFunFact] = useState(profile?.fun_fact || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  gsap.registerPlugin(useGSAP);
  useGSAP(
    () => {
      gsap.fromTo(
        ".profile-section",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06 }
      );
    },
    { scope: rootRef, revertOnUpdate: true }
  );
  const passwordStrength =
    newPassword.length >= 12 ? "strong" : newPassword.length >= 8 ? "medium" : newPassword.length > 0 ? "weak" : "";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const supabase = createClient();
    const ext = f.name.split(".").pop();
    const path = `${userId}/avatar_${Date.now()}.${ext}`;
    
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, f, { contentType: f.type, upsert: true });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setPhotoUrl(publicUrl);
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSaved(false);
    const supabase = createClient();
    
    if (newPassword) {
      if (newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        setLoading(false);
        return;
      }
      const { error: pwdErr } = await supabase.auth.updateUser({ password: newPassword });
      if (pwdErr) {
        setError(pwdErr.message);
        setLoading(false);
        return;
      }
    }

    const { error: err } = await supabase
      .from("profiles")
      .update({
        nickname,
        quote,
        fun_fact: funFact,
        photo_url: photoUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);
      
    if (err) { setError(err.message); setLoading(false); return; }
    
    setNewPassword("");
    setConfirmPassword("");
    setSaved(true);
    setLoading(false);
    setTimeout(() => { setSaved(false); router.refresh(); }, 2000);
  }

  return (
    <div ref={rootRef} className="max-w-4xl mx-auto px-4 pt-16 pb-32 md:px-8">
      <header className="profile-section mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Identity Management</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="serif text-6xl md:text-8xl font-black text-on-surface mb-6 tracking-tighter leading-none"
        >
          Your <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary italic">Registry.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant text-xl font-medium"
        >
          Curate how your legacy is remembered by the Class of 2026.
        </motion.p>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="profile-section section-shell rounded-[3rem] p-1 shadow-2xl overflow-hidden group/form"
      >
        <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-[2.8rem] p-8 md:p-16 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] -z-10" />

          <div className="mb-12 max-w-sm">
            <Link href="/time-capsule" className="group flex items-center justify-between p-6 rounded-[2rem] bg-surface-container-high/40 hover:bg-surface-container-high transition-all border border-outline-variant/10 shadow-sm active:scale-95">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">hourglass_top</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface">Time Capsule</p>
                  <p className="text-[9px] text-on-surface-variant font-medium">Access your digital vault</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline/30 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
            </Link>
          </div>

          <form onSubmit={handleSave} className="space-y-12">
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-10 pb-12 border-b border-outline-variant/10">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <div className="absolute -inset-2 bg-gradient-to-br from-primary to-secondary rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar" className="w-36 h-36 rounded-full object-cover ring-8 ring-background relative z-10 transition-transform duration-500 group-hover:scale-105 shadow-2xl" />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-surface-container-highest flex items-center justify-center font-black text-primary text-5xl ring-8 ring-background relative z-10 shadow-inner">
                    {(profile?.full_name ?? "S")[0]}
                  </div>
                )}
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]">
                  <span className="material-symbols-outlined text-white text-4xl translate-y-2 group-hover:translate-y-0 transition-transform">photo_camera</span>
                </div>
                <AnimatePresence>
                  {uploading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 bg-background/80 rounded-full flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="text-center md:text-left space-y-3">
                <h2 className="serif text-4xl font-black text-on-surface tracking-tighter leading-none">{profile?.full_name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high/60 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">mail</span>
                    {profile?.email}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => fileRef.current?.click()} 
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all active:scale-95 border border-primary/20"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Update Identity Image
                  </button>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>

            {/* Content Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 ml-2">Legacy Pseudonym</label>
                <div className="relative group/input">
                  <input 
                    className="w-full p-6 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[1.5rem] border border-outline-variant/10 focus:border-primary/30 transition-all text-on-surface font-medium text-lg placeholder:text-on-surface-variant/20 focus:outline-none focus:ring-4 focus:ring-primary/5"
                    placeholder="Class Alias..."
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 ml-2">Personal Fact</label>
                <input 
                  className="w-full p-6 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[1.5rem] border border-outline-variant/10 focus:border-primary/30 transition-all text-on-surface font-medium text-lg placeholder:text-on-surface-variant/20 focus:outline-none focus:ring-4 focus:ring-primary/5"
                  placeholder="Unique identifier..."
                  value={funFact}
                  onChange={e => setFunFact(e.target.value)}
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 ml-2">Registry Reflection (Quote)</label>
                <textarea 
                  className="w-full p-8 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[2rem] border border-outline-variant/10 focus:border-primary/30 transition-all text-on-surface font-serif italic text-2xl placeholder:text-on-surface-variant/20 focus:outline-none focus:ring-4 focus:ring-primary/5 resize-none min-h-[180px]"
                  placeholder="Your final words for the archive..."
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                />
              </div>
            </div>

            {/* Security Section */}
            <div className="pt-12 border-t border-outline-variant/10">
              <div className="flex items-center gap-3 mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h3 className="serif text-3xl font-black text-on-surface tracking-tighter">Security Protocol</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 ml-2">Reset Passcode</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-lg">lock</span>
                    <input 
                      type="password"
                      className="w-full pl-16 pr-6 py-6 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[1.5rem] border border-outline-variant/10 focus:border-primary/30 transition-all text-on-surface placeholder:text-on-surface-variant/20 focus:outline-none focus:ring-4 focus:ring-primary/5"
                      placeholder="Input new sequence..."
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <AnimatePresence>
                  {newPassword && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 ml-2">Verify Passcode</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30 text-lg">lock_reset</span>
                        <input 
                          type="password"
                          className="w-full pl-16 pr-6 py-6 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[1.5rem] border border-outline-variant/10 focus:border-primary/30 transition-all text-on-surface placeholder:text-on-surface-variant/20 focus:outline-none focus:ring-4 focus:ring-primary/5"
                          placeholder="Repeat sequence..."
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required={!!newPassword}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {newPassword && (
                <div className="mt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-2">Strength</p>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength === "strong"
                          ? "w-full bg-green-500"
                          : passwordStrength === "medium"
                          ? "w-2/3 bg-amber-500"
                          : "w-1/3 bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">report</span> {error}
                </motion.div>
              )}
              {saved && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">verified</span> Archive Synced Successfully
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="pt-12 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-6 items-center justify-between">
              <button 
                type="button" 
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push("/login");
                  router.refresh();
                }} 
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-surface-container-high/60 hover:bg-red-500/10 hover:text-red-500 transition-all text-on-surface-variant font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-lg">logout</span> Terminate Session
              </button>
              
              <button 
                type="submit" 
                disabled={loading || uploading} 
                className="w-full sm:w-auto px-16 py-6 bg-on-surface text-background rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:shadow-2xl transition-all shadow-xl disabled:opacity-30 flex items-center justify-center gap-3 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">{loading ? "sync" : "save_as"}</span>
                {loading ? "Synchronizing..." : "Finalize Changes"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
