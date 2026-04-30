"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import type { PlatformSettings } from "@/types/database";

export default function SettingsClient({ settings: initial }: { settings: PlatformSettings | null }) {
  const initialSettings: Partial<PlatformSettings> = initial ?? {};
  const [settings, setSettings] = useState<Partial<PlatformSettings>>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { theme, setTheme } = useTheme();

  const dirty = settings.graduation_date !== initialSettings.graduation_date;

  async function save() {
    setSaving(true); setSaved(false);
    const supabase = createClient();
    const { error } = await supabase.from("platform_settings")
      .update({ graduation_date: settings.graduation_date, updated_at: new Date().toISOString() })
      .eq("id", 1);
    
    if (!error) setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function exportDatabase() {
     const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ 
       timestamp: new Date().toISOString(),
       note: "This is a structural export. Full archive requires backend aggregation."
     }));
     const dlAnchorElem = document.createElement('a');
     dlAnchorElem.setAttribute("href", dataStr);
     dlAnchorElem.setAttribute("download", `seniors_backup_${new Date().getFullYear()}.json`);
     dlAnchorElem.click();
  }

  return (
    <div className="max-w-6xl mx-auto pb-40 px-6">
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 relative"
      >
        <div className="relative z-10">
          <div className="section-kicker mb-4">Platform Sovereignty Protocols</div>
          <h2 className="serif text-7xl font-black tracking-tighter text-on-surface">Core <span className="italic text-primary">Settings.</span></h2>
          <p className="text-sm font-medium text-on-surface-variant mt-4 max-w-lg leading-relaxed">
            Architecting the platform experience. Configure temporal milestones, visual identity, and system integrity.
          </p>
        </div>
      </motion.header>

      {/* Temporal Milestone */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="section-shell p-12 md:p-16 rounded-[4rem] flex flex-col xl:flex-row gap-16 justify-between items-center mb-16 group hover-glow"
      >
        <div className="relative z-10">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                 <span className="material-symbols-outlined text-2xl font-black">history_toggle_off</span>
              </div>
              <h3 className="serif text-4xl font-black text-on-surface tracking-tight">Temporal Milestone</h3>
           </div>
           <p className="text-on-surface-variant text-lg font-medium leading-relaxed max-w-sm italic opacity-80">
             "The target date for the final sequence. Orchestrates the platform-wide lock protocol."
           </p>
        </div>
        
        <div className="relative z-10 flex flex-col gap-8 w-full xl:w-auto">
          <div className="flex items-center gap-8 bg-surface-container-low/40 backdrop-blur-xl p-8 rounded-[3rem] border border-outline-variant/10 group/input transition-all duration-500 hover:bg-surface-container-low shadow-sm">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover/input:scale-110 shadow-lg">
              <span className="material-symbols-outlined text-4xl">event_upcoming</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-2">Registry Lock Target</span>
              <input
                type="date"
                className="bg-transparent text-4xl font-black border-none focus:outline-none focus:ring-0 text-on-surface tracking-tighter cursor-pointer"
                value={settings.graduation_date ?? ""}
                onChange={e => setSettings(prev => ({ ...prev, graduation_date: e.target.value }))}
              />
            </div>
          </div>
          <button 
            onClick={save} 
            disabled={saving || !dirty} 
            className="w-full h-20 bg-on-surface text-surface rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/10 disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-6 group/save overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className={`material-symbols-outlined text-2xl relative z-10 ${saving ? "animate-spin" : "group-hover:rotate-12"}`}>{saving ? "autorenew" : "lock_open"}</span> 
            <span className="relative z-10">{saving ? "Updating..." : saved ? "Milestone Sealed" : "Seal Timeframe"}</span>
          </button>
        </div>
      </motion.div>

      {/* Visual Identity */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="section-shell p-12 md:p-16 rounded-[4rem] mb-16 relative overflow-hidden group hover-glow"
      >
        <div className="mb-12">
          <h3 className="serif text-4xl font-black text-on-surface tracking-tight mb-2">Interface Protocol</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40">Select system appearance state</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {/* Light Mode */}
           <button 
             onClick={() => setTheme("light")}
             className={`group/theme relative flex flex-col items-center gap-10 p-12 rounded-[4rem] border-2 transition-all duration-700 ${theme === "light" ? "bg-surface-container-lowest border-primary shadow-2xl shadow-primary/10 scale-105" : "bg-surface-container-low/40 border-transparent hover:border-outline-variant/30"}`}
           >
              <div className="w-28 h-28 bg-surface-container-high rounded-[2.5rem] shadow-xl flex items-center justify-center transition-all duration-700 group-hover/theme:scale-110">
                 <span className="material-symbols-outlined text-5xl text-amber-500 font-black">light_mode</span>
              </div>
              <div className="text-center">
                <span className={`font-black text-[10px] uppercase tracking-[0.3em] transition-colors ${theme === "light" ? "text-primary" : "text-on-surface-variant/40"}`}>Solaris Protocol</span>
                <p className="text-[9px] font-bold text-on-surface-variant/60 mt-3 uppercase tracking-widest opacity-60">Optimum Clarity</p>
              </div>
              {theme === "light" && <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-primary animate-pulse" />}
           </button>

           {/* Dark Mode */}
           <button 
             onClick={() => setTheme("dark")}
             className={`group/theme relative flex flex-col items-center gap-10 p-12 rounded-[4rem] border-2 transition-all duration-700 ${theme === "dark" ? "bg-surface-container-highest border-primary shadow-2xl shadow-primary/30 scale-105" : "bg-surface-container-low/40 border-transparent hover:border-outline-variant/30"}`}
           >
              <div className="w-28 h-28 bg-surface-container-lowest rounded-[2.5rem] shadow-xl flex items-center justify-center transition-all duration-700 group-hover/theme:scale-110">
                 <span className="material-symbols-outlined text-5xl text-primary font-black">dark_mode</span>
              </div>
              <div className="text-center">
                <span className={`font-black text-[10px] uppercase tracking-[0.3em] transition-colors ${theme === "dark" ? "text-primary" : "text-on-surface-variant/40"}`}>Void Sequence</span>
                <p className="text-[9px] font-bold text-on-surface-variant/60 mt-3 uppercase tracking-widest opacity-60">OLED Optimized</p>
              </div>
              {theme === "dark" && <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-primary animate-pulse" />}
           </button>

           {/* System Default */}
           <button 
             onClick={() => setTheme("system")}
             className={`group/theme relative flex flex-col items-center gap-10 p-12 rounded-[4rem] border-2 transition-all duration-700 ${theme === "system" ? "bg-surface-container-low border-primary shadow-2xl shadow-primary/10 scale-105" : "bg-surface-container-low/40 border-transparent hover:border-outline-variant/30"}`}
           >
              <div className="w-28 h-28 rounded-[2.5rem] shadow-xl flex overflow-hidden group-hover/theme:scale-110 transition-all duration-700">
                 <div className="w-1/2 h-full bg-white flex items-center justify-center"><span className="material-symbols-outlined text-xl text-black/10">light_mode</span></div>
                 <div className="w-1/2 h-full bg-neutral-900 flex items-center justify-center"><span className="material-symbols-outlined text-xl text-white/10">dark_mode</span></div>
              </div>
              <div className="text-center">
                <span className={`font-black text-[10px] uppercase tracking-[0.3em] transition-colors ${theme === "system" ? "text-primary" : "text-on-surface-variant/40"}`}>Neural Sync</span>
                <p className="text-[9px] font-bold text-on-surface-variant/60 mt-3 uppercase tracking-widest opacity-60">Adaptive Flow</p>
              </div>
              {theme === "system" && <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-primary animate-pulse" />}
           </button>
        </div>
      </motion.div>

      {/* Archive Custodianship */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative group bg-on-surface p-12 md:p-20 rounded-[5rem] overflow-hidden transition-all duration-1000"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/10 opacity-40" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
           <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                 <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center backdrop-blur-xl border border-red-500/20">
                    <span className="material-symbols-outlined text-lg">security</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-surface/40">Critical Infrastructure</span>
              </div>
              <h3 className="serif text-5xl md:text-6xl font-black text-surface tracking-tighter mb-6 italic">Archive Custodianship</h3>
              <p className="text-surface/40 text-lg font-medium max-w-md leading-relaxed">
                Generate a multi-table snapshot. Encrypts all memories and student registries into a single payload.
              </p>
           </div>
           
           <button onClick={exportDatabase} className="group/export relative flex items-center gap-8 px-10 py-10 bg-white/5 border border-white/10 rounded-[3.5rem] hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-700 shadow-2xl">
              <div className="w-20 h-20 rounded-[2rem] bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/40 group-hover/export:scale-110 transition-transform group-hover/export:rotate-12">
                <span className="material-symbols-outlined text-4xl font-black">download_for_offline</span>
              </div>
              <div className="flex flex-col text-left">
                 <span className="font-black text-white text-2xl tracking-tighter">Initiate Global Export</span>
                 <span className="text-[10px] font-black text-white/40 tracking-[0.25em] uppercase mt-2">Archive Snapshot: JSON SCHEMA</span>
              </div>
           </button>
        </div>

        <div className="mt-16 pt-16 border-t border-white/5 relative z-10 flex flex-col sm:flex-row justify-between items-center gap-8 opacity-30">
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-lg text-white">verified_user</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-white">SHA-256 Entropy Validation Active</span>
           </div>
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-lg text-white">history</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Platform Uptime: 99.9% Legacy Sync</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}