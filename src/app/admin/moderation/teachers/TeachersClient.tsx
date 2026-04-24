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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-bold text-on-surface serif tracking-tight">Teacher Appreciations</h2>
          <p className="text-on-surface-variant font-medium mt-1">Review quotes submitted for faculty members.</p>
        </div>
        <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20">
          {(["pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-xs font-bold capitalize transition-colors flex items-center gap-2 ${filter === f ? "bg-primary text-white shadow-xl" : "text-on-surface-variant hover:bg-surface-variant"}`}
            >
              {f === "pending" && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              {f} ({messages.filter((m) => m.status === f).length})
            </button>
          ))}
        </div>
      </header>

      {/* Top Appreciated Teachers Analytics */}
      <div className="mb-10 bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center justify-between editorial-shadow relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full" />
         <div>
            <h3 className="serif text-2xl font-bold mb-2">Most Appreciated</h3>
            <p className="text-sm font-medium text-on-surface-variant">Top faculty by volume of submissions.</p>
         </div>
         <div className="flex gap-4 w-full md:w-auto overflow-x-auto hidden-scrollbar pb-2 md:pb-0">
           {teacherStats.map((ts, idx) => (
             <div key={ts.name} className="flex-shrink-0 flex items-center gap-4 bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant/20">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-lg ${idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-stone-200 text-stone-600" : "bg-orange-100 text-orange-800"}`}>
                  #{idx + 1}
                </div>
                <div>
                   <h4 className="font-bold text-on-surface">{ts.name}</h4>
                   <p className="text-xs font-black uppercase tracking-widest text-primary mt-1">{ts.count} Messages</p>
                </div>
             </div>
           ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        
        {/* Teachers List Sidebar */}
        <div className="flex flex-col gap-2">
           <button 
             onClick={() => setActiveTeacher("all")}
             className={`text-left px-5 py-4 rounded-xl text-sm font-bold transition-all ${activeTeacher === "all" ? "bg-surface-container text-on-surface border border-outline-variant/30" : "text-on-surface-variant hover:bg-surface-container-low"}`}
           >
             All Teachers
           </button>
           {initialTeachers.map(t => {
             const mCount = messages.filter(m => m.teacher_id === t.id && m.status === filter).length;
             if (mCount === 0 && filter === "pending") return null; // hide empty pending ones
             
             return (
               <button 
                 key={t.id}
                 onClick={() => setActiveTeacher(t.id)}
                 className={`text-left px-5 py-4 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${activeTeacher === t.id ? "bg-surface-container text-on-surface border border-outline-variant/30" : "text-on-surface-variant hover:bg-surface-container-low"}`}
               >
                 <span className="truncate">{t.name}</span>
                 {mCount > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{mCount}</span>}
               </button>
             );
           })}
        </div>
        
        {/* Messages Feed */}
        <div className="flex flex-col gap-4 pb-20">
          {displayList.length === 0 && (
            <div className="text-center py-24 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 border-dashed">
              <span className="material-symbols-outlined text-5xl opacity-20 mb-4 block">fact_check</span>
              <p className="font-bold text-on-surface-variant text-lg">No {filter} messages for this selection.</p>
            </div>
          )}
          
          {displayList.map(msg => (
            <div key={msg.id} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/20 editorial-shadow group transition-all hover:border-primary/30">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-xl">school</span>
                     <div>
                       <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">To: {msg.teachers?.name}</p>
                       <p className="text-sm font-bold mt-1 text-on-surface flex items-center gap-2">
                         From: {msg.is_anonymous ? <span className="italic text-on-surface-variant font-medium">(Anonymous)</span> : msg.profiles?.nickname ?? msg.profiles?.full_name ?? "Student"}
                       </p>
                     </div>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium opacity-60">{new Date(msg.created_at).toLocaleDateString()}</span>
               </div>
               
               <p className="text-lg leading-relaxed text-on-surface/80 bg-surface-container-low p-5 rounded-2xl font-serif">
                 "{msg.content}"
               </p>

               <div className="flex justify-end gap-2 mt-4 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                  {msg.status !== "approved" && (
                    <button disabled={loadingAction === msg.id} onClick={() => setStatus(msg.id, "approved")} className="px-5 py-2.5 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-full text-sm font-bold flex items-center gap-2 transition-all">
                       <span className="material-symbols-outlined text-sm">check</span> Approve
                    </button>
                  )}
                  {msg.status !== "rejected" && (
                     <button disabled={loadingAction === msg.id} onClick={() => setStatus(msg.id, "rejected")} className="px-5 py-2.5 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-full text-sm font-bold flex items-center gap-2 transition-all">
                        <span className="material-symbols-outlined text-sm">close</span> Reject
                     </button>
                  )}
               </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
