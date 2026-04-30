"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PlatformSettings } from "@/types/database";

export default function ContentReleaseClient({ settings: initial }: { settings: PlatformSettings }) {
  const [settings, setSettings] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(key: keyof PlatformSettings) {
    setLoading(key);
    const supabase = createClient();
    const newValue = !settings[key];
    await supabase.from("platform_settings").update({ [key]: newValue }).eq("id", 1);
    setSettings(prev => ({ ...prev, [key]: newValue }));
    setLoading(null);
  }

  const controls: { key: keyof PlatformSettings; title: string, description: string, icon: string }[] = [
    { key: "uploads_enabled", title: "Open Memories Upload", description: "Allows students to upload photos and videos to the Memory Grid.", icon: "cloud_upload" },
    { key: "wall_enabled", title: "Chaos Board Submissions", description: "Allows live anonymous sticky notes on the Chaos Board.", icon: "sticky_note_2" },
    { key: "voting_enabled", title: "Voting Phase Live", description: "Opens polls for senior categories. Freeze this when validating winners.", icon: "how_to_vote" },
    { key: "awards_revealed", title: "Reveal Awards", description: "Makes the final winners public to all students. Turn on manually at graduation.", icon: "workspace_premium" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto px-6 pb-40">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Global Sync Protocols</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-on-surface pb-2">Platform <span className="italic text-primary">Orchestrator</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">
            Synchronizing global capabilities in real-time. Manage module availability and ecosystem-wide state overrides.
          </p>
        </div>
      </header>

      <div className="mb-20 relative group bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 p-12 rounded-[3rem] flex items-center gap-10 backdrop-blur-3xl border border-amber-500/20 shadow-2xl shadow-amber-500/5 overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
         <div className="w-20 h-20 rounded-[1.5rem] bg-amber-500 flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 animate-pulse relative z-10">
           <span className="material-symbols-outlined text-4xl">security</span>
         </div>
         <div className="flex-1 relative z-10">
            <h4 className="serif text-3xl font-black text-on-surface tracking-tight mb-3 italic">High-Authority Override</h4>
            <p className="text-on-surface-variant/80 text-lg font-medium leading-relaxed max-w-2xl opacity-80">
              "These switches actively modify the global runtime state. Changes are propagated in real-time. 
              Exercise extreme caution when toggling <span className="text-amber-700 dark:text-amber-400 font-black tracking-widest uppercase text-xs bg-amber-500/10 px-3 py-1 rounded-lg ml-1">Reveal Awards</span> before the official ceremony."
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         {controls.map(ctrl => {
            const active = settings[ctrl.key];
            return (
              <div key={ctrl.key} className={`group/module p-12 rounded-[4rem] border transition-all duration-700 relative overflow-hidden backdrop-blur-3xl ${active ? "bg-white dark:bg-neutral-900 border-primary/30 shadow-2xl shadow-primary/20 scale-[1.02]" : "bg-white/40 dark:bg-white/5 border-outline-variant/10 hover:border-primary/20 shadow-xl"}`}>
                 
                 <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 ${active ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-110" : "bg-on-surface/5 text-on-surface-variant/40"}`}>
                       <span className="material-symbols-outlined text-4xl group-hover/module:rotate-12 transition-transform duration-500">{ctrl.icon}</span>
                    </div>
                    
                    <button
                      disabled={loading === ctrl.key} 
                      onClick={() => toggle(ctrl.key)}
                      className={`w-28 h-14 rounded-full transition-all duration-700 p-2 flex relative items-center cursor-pointer shadow-inner ${active ? "bg-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]" : "bg-on-surface/10"}`}
                    >
                      <div className={`w-10 h-10 rounded-full shadow-2xl bg-white absolute transition-all duration-700 transform ${active ? "translate-x-14" : "translate-x-0"}`} />
                      {loading === ctrl.key && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full z-10">
                           <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </button>
                 </div>
                 
                 <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className={`serif text-4xl font-black transition-colors duration-700 ${active ? "text-on-surface" : "text-on-surface/40"}`}>{ctrl.title}</h3>
                      {active && <span className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.5)]" />}
                    </div>
                    <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.4em] text-[10px] mb-6">Module Protocol: {active ? "Active & Syncing" : "Dormant Status"}</p>
                    <p className="text-on-surface-variant text-lg font-medium leading-relaxed max-w-sm italic opacity-70">"{ctrl.description}"</p>
                 </div>

                 {active && (
                   <>
                     <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
                     <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-[12rem] pointer-events-none transition-opacity group-hover/module:opacity-100" />
                   </>
                 )}
              </div>
            );
         })}
      </div>
    </div>
  );
}
