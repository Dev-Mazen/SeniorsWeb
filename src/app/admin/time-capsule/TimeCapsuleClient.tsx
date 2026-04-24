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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
           <h2 className="text-4xl font-bold text-on-surface serif tracking-tight">Time Capsule Manager</h2>
           <p className="text-on-surface-variant font-medium mt-1">Review locked future messages submitted by seniors.</p>
        </div>
      </header>

      {/* Control Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] p-8 mb-8 editorial-shadow flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex flex-col">
            <h3 className="serif text-xl font-bold mb-2">Capsule Schedule</h3>
            <p className="text-sm font-medium text-on-surface-variant">Configure when these messages will automatically become readable to students.</p>
         </div>
         
         <div className="flex gap-4 items-center bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest pl-2">Scheduled Unlock Year</span>
               <input 
                 type="number" 
                 className="bg-transparent font-bold text-2xl text-primary border-none focus:outline-none w-28 px-2" 
                 value={unlockYear} 
                 onChange={(e) => setUnlockYear(e.target.value)}
                 min="2027" max="2050"
               />
            </div>
            <button className="px-6 py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-xl">hourglass_bottom</span>
              Update Schedule
            </button>
         </div>
      </div>

      <div className="mb-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center gap-4 text-amber-900">
         <span className="material-symbols-outlined text-2xl">privacy_tip</span>
         <p className="text-sm font-bold">Privacy Enforcement: Entries marked 'Private' can only be read by the designated future recipients, but Admins can audit them for safety.</p>
      </div>

      <div className="flex gap-2 mb-6">
         {(["all", "public", "private"] as const).map(f => (
           <button 
             key={f} 
             onClick={() => setFilter(f)} 
             className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-colors ${filter === f ? "bg-stone-900 text-white shadow" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"}`}
           >
             {f} ({f === "all" ? capsules.length : capsules.filter(c => f === "public" ? !c.is_private : c.is_private).length})
           </button>
         ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
         {filtered.length === 0 && (
           <div className="col-span-full text-center py-24 bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/20">
              <span className="material-symbols-outlined text-6xl opacity-30 block mb-4">inventory_2</span>
              <p className="font-bold text-xl">No {filter} capsule entries yet.</p>
           </div>
         )}
         {filtered.map(c => (
           <div key={c.id} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 relative group editorial-shadow hover:-translate-y-1 transition-all flex flex-col items-start hidden-scrollbar overflow-y-auto max-h-[300px]">
              
              <div className="flex justify-between items-start w-full mb-4">
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-sm">{c.is_private ? "lock" : "public"}</span>
                    <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{c.is_private ? "Private Letter" : "Public Submission"}</span>
                 </div>
                 <button onClick={() => deleteCapsule(c.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-red-100 text-on-surface-variant hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[1rem]">delete</span>
                 </button>
              </div>
              
              <p className="text-base font-serif leading-relaxed text-on-surface mb-6 opacity-90 break-words flex-1">
                 "{c.content}"
              </p>
              
              <div className="w-full flex justify-between items-end border-t border-surface-variant/30 pt-4 mt-auto">
                 <div>
                   <p className="text-xs font-bold text-on-surface">— {c.profiles?.full_name ?? "Unknown"}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                 </div>
                 <span className="material-symbols-outlined text-3xl opacity-5 text-on-surface pointer-events-none">hourglass_empty</span>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
