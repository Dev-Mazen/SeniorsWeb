"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Capsule = {
  id: string;
  author_id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

export default function TimeCapsuleClient({ initialCapsules }: { initialCapsules: Capsule[] }) {
  const [capsules, setCapsules] = useState(initialCapsules);
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [capsuleOpen, setCapsuleOpen] = useState(false); // In a real scenario, this is derived from a global settings timestamp.
  const [unlockYear, setUnlockYear] = useState("2036");
  
  const filtered = capsules.filter(c => {
    if (filter === "public") return !c.is_private;
    if (filter === "private") return c.is_private;
    return true;
  });

  async function deleteCapsule(id: string) {
    if (!confirm("Permanently delete this capsule entry?")) return;
    const supabase = createClient();
    await supabase.from("time_capsules").delete().eq("id", id);
    setCapsules(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto px-6 pb-40">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Temporal Authority Protocols</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-on-surface pb-2">Temporal <span className="italic text-primary">Vault</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">
            Managing the immutable archives of the Class of 2026. Absolute privacy protocol is enforced for all encrypted transmissions.
          </p>
        </div>
      </header>

      {/* Release Orchestration Deck */}
      <div className="group relative bg-white/60 dark:bg-neutral-950/40 backdrop-blur-3xl p-16 rounded-[4rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] flex flex-col xl:flex-row justify-between items-center gap-16 mb-20 transition-all duration-700 hover:border-primary/30 overflow-hidden">
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
         
         <div className="relative z-10 text-center xl:text-left">
            <div className="flex items-center justify-center xl:justify-start gap-4 mb-6">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">hourglass_empty</span>
               </div>
               <h3 className="serif text-4xl font-black text-on-surface tracking-tight">Release Sequence</h3>
            </div>
            <p className="text-on-surface-variant/70 text-lg font-medium leading-relaxed max-w-sm mx-auto xl:mx-0 italic opacity-80">
              "Configuring the temporal barrier. Transmissions remain unreadable until the designated cosmic release phase."
            </p>
         </div>
         
         <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-stretch sm:items-center bg-white/40 dark:bg-white/5 p-8 rounded-[3rem] border border-outline-variant/10 dark:border-white/5 shadow-inner group/input transition-all duration-500 hover:bg-white">
            <div className="flex flex-col px-8 border-r border-outline-variant/10 dark:border-white/5">
               <span className="text-[10px] font-black uppercase text-primary tracking-[0.4em] mb-3">Vault Unlock Target</span>
               <div className="flex items-center gap-4">
                 <span className="material-symbols-outlined text-4xl text-primary/30 group-hover/input:text-primary transition-colors duration-500">calendar_today</span>
                 <input 
                   type="number" 
                   className="bg-transparent font-black text-5xl text-on-surface border-none focus:outline-none w-36 tracking-tighter cursor-pointer" 
                   value={unlockYear} 
                   onChange={(e) => setUnlockYear(e.target.value)}
                   min="2027" max="2050"
                 />
               </div>
            </div>
            <button className="h-24 px-12 bg-on-surface dark:bg-primary-fixed text-surface dark:text-primary-fixed-dim font-black rounded-[2rem] text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all duration-500 flex items-center gap-6 group/btn relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="material-symbols-outlined text-2xl relative z-10 group-hover/btn:rotate-180 transition-transform duration-700">shutter_speed</span>
              <span className="relative z-10">Commit Timeline</span>
            </button>
         </div>
      </div>

      {/* Archive Status Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="col-span-full py-48 text-center bg-white/40 dark:bg-neutral-950/20 rounded-[5rem] border-2 border-outline-variant/10 border-dashed backdrop-blur-3xl group relative overflow-hidden transition-all duration-700 hover:border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10">
              <div className="relative inline-block mb-16">
                <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
                <div className="w-48 h-48 bg-white dark:bg-neutral-900 rounded-[3.5rem] shadow-2xl flex items-center justify-center relative z-10 border border-outline-variant/10 group-hover:scale-110 transition-transform duration-1000">
                  <span className="material-symbols-outlined text-[6rem] text-primary/20">inventory_2</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-primary animate-pulse">lock</span>
                  </div>
                </div>
              </div>
              
              <h3 className="serif text-7xl font-black text-on-surface tracking-tighter mb-6 italic">Archive <span className="text-primary not-italic">Sealed</span></h3>
              <p className="text-[12px] font-black uppercase tracking-[0.6em] text-on-surface-variant/40 mb-16 ml-[0.6em]">System Architecture: End-to-End Opaque</p>
              
              <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
                 <div className="bg-white/60 dark:bg-white/5 px-12 py-10 rounded-[3rem] border border-white dark:border-white/5 backdrop-blur-md shadow-xl transition-all duration-700 hover:scale-105 group/stat">
                    <p className="text-5xl font-black text-primary tracking-tighter mb-2 group-hover/stat:scale-110 transition-transform">{capsules.length}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50">Sealed Transmissions</p>
                 </div>
                 <div className="bg-white/60 dark:bg-white/5 px-12 py-10 rounded-[3rem] border border-white dark:border-white/5 backdrop-blur-md shadow-xl transition-all duration-700 hover:scale-105 group/stat">
                    <p className="text-5xl font-black text-on-surface tracking-tighter mb-2 group-hover/stat:scale-110 transition-transform">AES-256</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50">Cryptographic Standard</p>
                 </div>
                 <div className="bg-white/60 dark:bg-white/5 px-12 py-10 rounded-[3rem] border border-white dark:border-white/5 backdrop-blur-md shadow-xl transition-all duration-700 hover:scale-105 group/stat">
                    <p className="text-5xl font-black text-on-surface tracking-tighter mb-2 group-hover/stat:scale-110 transition-transform">2026</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50">Class Origin Epoch</p>
                 </div>
              </div>
            </div>

            <div className="absolute bottom-16 left-16 right-16 flex justify-between items-center opacity-40 pointer-events-none">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em]">Network Integrity: Optimal</span>
               </div>
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-sm">verified</span>
                 <span className="text-[11px] font-black uppercase tracking-[0.5em]">Immutable Ledger Active</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
