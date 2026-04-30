"use client";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type Teacher = { id: string; name: string };
type Msg = {
  id: string;
  author_id: string | null;
  teacher_id: string;
  content: string;
  is_anonymous: boolean;
  status: string;
  created_at: string;
  teachers: { name: string } | null;
  profiles: { full_name: string | null, nickname: string | null } | null;
};

export default function TeachersClient({ initialMessages, initialTeachers }: { initialMessages: Msg[], initialTeachers: Teacher[] }) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [activeTeacher, setActiveTeacher] = useState<string>("all");
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Top Appreciated Teachers Analytics
  const teacherStats = useMemo(() => {
    const stats: Record<string, { name: string; count: number }> = {};
    initialTeachers.forEach(t => stats[t.id] = { name: t.name, count: 0 });
    // Count ALL submitted messages (or only approved, let's say all submissions implies appreciation)
    messages.forEach(m => {
      if (stats[m.teacher_id]) stats[m.teacher_id].count++;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [messages, initialTeachers]);

  const displayList = messages
    .filter(m => m.status === filter)
    .filter(m => activeTeacher === "all" || m.teacher_id === activeTeacher);

  async function setStatus(id: string, newStatus: string) {
    setLoadingAction(id);
    const supabase = createClient();
    await supabase.from("teacher_messages").update({ status: newStatus }).eq("id", id);
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, status: newStatus } : m)));
    setLoadingAction(null);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto px-6">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Faculty Relations</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-on-surface via-primary to-primary-container dark:from-white dark:to-primary-fixed pb-2">Faculty <span className="italic">Tributes</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">Reviewing and curating expressions of gratitude for the distinguished educators of Class 2026.</p>
        </div>
        
        <div className="flex bg-white/40 dark:bg-black/40 backdrop-blur-3xl rounded-[2.5rem] p-2 border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] relative z-10">
          {(["pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${filter === f ? "bg-primary dark:bg-primary-fixed text-white dark:text-primary-fixed-dim shadow-2xl shadow-primary/30 scale-105" : "text-on-surface-variant/60 hover:text-on-surface hover:bg-on-surface/5"}`}
            >
              {f === "pending" && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]" />}
              {f} <span className="opacity-40 font-bold">({messages.filter((m) => m.status === f).length})</span>
            </button>
          ))}
        </div>
      </header>

      {/* Distinguished Analytics Panel */}
      <div className="mb-20 group bg-white/60 dark:bg-neutral-950/40 backdrop-blur-3xl border border-white dark:border-white/5 rounded-[4rem] p-12 flex flex-col xl:flex-row gap-16 items-center justify-between shadow-2xl shadow-black/[0.02] relative overflow-hidden transition-all duration-700 hover:border-primary/20">
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
         
         <div className="relative z-10 text-center xl:text-left flex-1">
            <div className="flex items-center gap-4 mb-4 justify-center xl:justify-start">
               <div className="w-14 h-14 rounded-[1.75rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <span className="material-symbols-outlined text-3xl">workspace_premium</span>
               </div>
               <h3 className="serif text-5xl font-black tracking-tight text-on-surface">Faculty Hall</h3>
            </div>
            <p className="text-sm font-medium text-on-surface-variant/60 leading-relaxed max-w-md mx-auto xl:mx-0">Recognizing the educators who have shaped the intellectual landscape of the Class of 2026.</p>
         </div>

         <div className="flex flex-wrap justify-center xl:justify-end gap-8 w-full xl:w-auto relative z-10">
           {teacherStats.map((ts, idx) => (
             <div key={ts.name} className="group/stat relative bg-surface-container-low/40 dark:bg-white/5 px-10 py-8 rounded-[3rem] border border-outline-variant/10 dark:border-white/5 shadow-xl transition-all duration-700 hover:scale-105 hover:-translate-y-3 hover:border-primary/30">
                <div className={`absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center rounded-[1.25rem] font-black text-xs shadow-2xl group-hover/stat:scale-110 transition-transform ${idx === 0 ? "bg-amber-400 text-black rotate-[-12deg]" : idx === 1 ? "bg-zinc-400 text-black rotate-[8deg]" : "bg-orange-600 text-white rotate-[-6deg]"}`}>
                  #{idx + 1}
                </div>
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-[1.75rem] bg-white dark:bg-neutral-900 flex items-center justify-center group-hover/stat:bg-primary group-hover/stat:text-white transition-all duration-500 shadow-lg shadow-black/[0.02]">
                     <span className="material-symbols-outlined text-3xl">school</span>
                   </div>
                   <div>
                      <h4 className="serif text-2xl font-black text-on-surface tracking-tighter group-hover/stat:text-primary transition-colors duration-500">{ts.name}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="w-8 h-1 bg-primary/40 rounded-full" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{ts.count} Tributes</p>
                      </div>
                   </div>
                </div>
             </div>
           ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-16">
        
        {/* Professional Navigation Sidebar */}
        <div className="flex flex-col gap-4">
           <button 
             onClick={() => setActiveTeacher("all")}
             className={`text-left px-10 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 border ${activeTeacher === "all" ? "bg-primary dark:bg-primary-fixed text-white dark:text-primary-fixed-dim border-primary shadow-2xl shadow-primary/20 scale-105" : "text-on-surface-variant/40 bg-white/40 dark:bg-white/5 border-outline-variant/10 hover:border-primary/20 hover:text-on-surface"}`}
           >
             The Global Feed
           </button>
           <div className="h-px bg-outline-variant/10 my-6 mx-6" />
           <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[800px] pr-4">
            {initialTeachers.map(t => {
              const mCount = messages.filter(m => m.teacher_id === t.id && m.status === filter).length;
              if (mCount === 0 && filter === "pending") return null; 
              
              return (
                <button 
                  key={t.id}
                  onClick={() => setActiveTeacher(t.id)}
                  className={`group/teacher text-left px-8 py-5 rounded-[1.75rem] text-sm font-black transition-all duration-500 flex justify-between items-center border ${activeTeacher === t.id ? "bg-white dark:bg-neutral-800 text-on-surface border-primary shadow-xl scale-[1.02]" : "text-on-surface-variant/40 border-transparent hover:bg-white dark:hover:bg-white/5 hover:border-outline-variant/20"}`}
                >
                  <span className="truncate group-hover/teacher:translate-x-2 transition-transform tracking-tight">{t.name}</span>
                  {mCount > 0 && <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl transition-all duration-500 ${activeTeacher === t.id ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-on-surface/5 dark:bg-white/5 opacity-60"}`}>{mCount}</span>}
                </button>
              );
            })}
           </div>
        </div>
        
        {/* Curated Messages Feed */}
        <div className="flex flex-col gap-10 pb-48">
          {displayList.length === 0 && (
            <div className="text-center py-48 bg-white/20 dark:bg-neutral-950/20 backdrop-blur-3xl rounded-[5rem] border-2 border-outline-variant/10 border-dashed group">
              <div className="relative inline-block mb-10">
                <div className="w-32 h-32 bg-on-surface/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <span className="material-symbols-outlined text-7xl text-on-surface-variant/20">playlist_add_check</span>
                </div>
                <span className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center shadow-xl border border-outline-variant/10">
                   <span className="material-symbols-outlined text-xl text-primary animate-pulse">done_all</span>
                </span>
              </div>
              <h4 className="serif text-4xl font-black text-on-surface tracking-tight mb-4 capitalize">Queue Synchronized</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 max-w-sm mx-auto leading-relaxed">System scan complete. The moderation queue for this recipient is currently neutralized.</p>
            </div>
          )}
          
          {displayList.map(msg => (
            <div key={msg.id} className="group relative bg-white/60 dark:bg-neutral-950/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] transition-all duration-700 hover:-translate-y-2 hover:border-primary/30">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10 mb-10 pb-10 border-b border-outline-variant/10">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 rounded-[1.75rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/5 group-hover:rotate-12 transition-transform duration-700">
                        <span className="material-symbols-outlined text-3xl">history_edu</span>
                     </div>
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Digital Tribute To</span>
                          <span className="w-4 h-0.5 bg-primary/20 rounded-full" />
                        </div>
                        <p className="serif text-3xl font-black text-on-surface tracking-tighter group-hover:text-primary transition-colors duration-500">{msg.teachers?.name}</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 mb-2">{new Date(msg.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-white/5 px-5 py-2 rounded-full border border-outline-variant/10 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface">Payload Secure</span>
                    </div>
                  </div>
               </div>
               
               <div className="relative mb-12">
                 <span className="absolute -left-6 -top-12 text-[12rem] serif text-primary/5 italic pointer-events-none select-none font-black">“</span>
                 <div className="bg-surface-container-low/40 dark:bg-white/5 p-10 rounded-[3.5rem] border border-outline-variant/10 group-hover:border-primary/10 transition-all duration-700 relative z-10">
                    <p className="text-on-surface/90 text-2xl leading-relaxed font-medium serif italic pl-2">
                      {msg.content}
                    </p>
                 </div>
               </div>

               <div className="flex flex-wrap items-center justify-between gap-10 pt-10 border-t border-outline-variant/10 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-on-surface/5 dark:bg-white/5 flex items-center justify-center text-on-surface-variant shadow-inner">
                      <span className="material-symbols-outlined text-2xl">fingerprint</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40">Identity Signature</p>
                      <p className="text-lg font-black text-on-surface tracking-tight mt-1 uppercase">
                        {msg.is_anonymous ? <span className="italic text-on-surface-variant/40 tracking-widest">ENCRYPTED PAYLOAD</span> : msg.profiles?.nickname ?? msg.profiles?.full_name ?? "Identity Unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                     {msg.status !== "approved" && (
                       <button 
                        disabled={loadingAction === msg.id} 
                        onClick={() => setStatus(msg.id, "approved")} 
                        className="flex items-center gap-4 px-10 py-5 bg-on-surface dark:bg-green-600 text-surface dark:text-white hover:scale-105 active:scale-95 rounded-[2rem] text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group/btn"
                       >
                          <span className="material-symbols-outlined text-lg font-black group-hover/btn:rotate-12">verified</span> Authorize Entry
                       </button>
                     )}
                     {msg.status !== "rejected" && (
                        <button 
                          disabled={loadingAction === msg.id} 
                          onClick={() => setStatus(msg.id, "rejected")} 
                          className="flex items-center gap-4 px-10 py-5 bg-surface-container-highest dark:bg-red-600 text-on-surface dark:text-white hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 rounded-[2rem] text-[11px] font-black tracking-[0.25em] uppercase transition-all duration-500 shadow-xl group/btn"
                        >
                           <span className="material-symbols-outlined text-lg font-black group-hover/btn:rotate-12">block</span> Purge Record
                        </button>
                     )}
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
