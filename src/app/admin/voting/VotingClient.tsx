"use client";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type Question = {
  id: string;
  question: string;
  display_order: number;
  is_active: boolean;
};

type Vote = {
  id: string;
  voter_id: string;
  question_id: string;
  nominee_id: string;
  created_at: string;
  profiles: { full_name: string | null, nickname: string | null };
};

type Settings = {
  voting_enabled: boolean;
  awards_revealed: boolean;
};

export default function VotingClient({ 
  initialQuestions, 
  votes, 
  settings: initialSettings,
  totalStudents
}: { 
  initialQuestions: Question[], 
  votes: Vote[], 
  settings: Settings,
  totalStudents: number
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [settings, setSettings] = useState(initialSettings);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // For managing questions
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");

  const uniqueVotersCount = new Set(votes.map(v => v.voter_id)).size;
  const progressPercent = Math.min(100, Math.round((uniqueVotersCount / Math.max(1, totalStudents)) * 100));

  // Analytics per category
  const categoryStats = useMemo(() => {
    return questions.map(q => {
      const qVotes = votes.filter(v => v.question_id === q.id);
      
      const counts: Record<string, { count: number, name: string }> = {};
      qVotes.forEach(v => {
        if (!counts[v.nominee_id]) counts[v.nominee_id] = { count: 0, name: v.profiles?.nickname ?? v.profiles?.full_name ?? "Unknown" };
        counts[v.nominee_id].count++;
      });
      const topNominees = Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3);

      return {
        ...q,
        totalVotes: qVotes.length,
        topNominees
      };
    });
  }, [questions, votes]);

  // Fraud Detection: Anyone who voted more times than active categories
  const fraudAlerts = useMemo(() => {
    const voterCounts: Record<string, number> = {};
    votes.forEach(v => {
      voterCounts[v.voter_id] = (voterCounts[v.voter_id] || 0) + 1;
    });
    const maxAllowed = questions.filter(q => q.is_active).length;
    return Object.entries(voterCounts).filter(([id, count]) => count > maxAllowed);
  }, [votes, questions]);

  async function toggleSetting(field: "voting_enabled" | "awards_revealed") {
    setLoadingAction(field);
    const supabase = createClient();
    const newValue = !settings[field];
    await supabase.from("platform_settings").update({ [field]: newValue }).eq("id", 1);
    setSettings(prev => ({ ...prev, [field]: newValue }));
    setLoadingAction(null);
  }

  // --- Question Management Handlers --- //
  async function addQuestion() {
    if (!newText.trim()) return;
    setLoadingAction("add_q");
    const supabase = createClient();
    const nextOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.display_order)) + 1 : 1;
    const { data, error } = await supabase.from("awards_questions").insert({ question: newText.trim(), display_order: nextOrder, is_active: true }).select().single();
    if (data) {
      setQuestions([...questions, data]);
      setAdding(false);
      setNewText("");
    }
    setLoadingAction(null);
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return;
    setLoadingAction(`edit_${editingId}`);
    const supabase = createClient();
    await supabase.from("awards_questions").update({ question: editText.trim() }).eq("id", editingId);
    setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, question: editText.trim() } : q));
    setEditingId(null);
    setLoadingAction(null);
  }

  async function toggleQActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("awards_questions").update({ is_active: !current }).eq("id", id);
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_active: !current } : q));
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto px-6 pb-40">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Electoral Authority Node</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-on-surface pb-2">Ballot <span className="italic text-primary">Command</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">
            Orchestrating the democratic recognition protocol for the Class of 2026. Manage category deployment and validate real-time engagement telemetry.
          </p>
        </div>
      </header>

      {/* Global Controls & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 mb-16">
        <div className="group relative bg-white/60 dark:bg-neutral-950/40 backdrop-blur-3xl p-14 rounded-[4rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] transition-all duration-700 hover:border-primary/20 overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/5 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                    <span className="material-symbols-outlined text-3xl">analytics</span>
                  </div>
                  <div>
                    <h3 className="serif text-3xl font-black text-on-surface tracking-tight">Engagement Flow</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Real-time Telemetry</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 rounded-full border border-primary/10 shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Sync</span>
                </div>
             </div>

             <div className="mb-12 flex justify-between items-end">
               <div className="flex flex-col">
                 <div className="flex items-baseline gap-3">
                   <span className="text-8xl font-black tracking-tighter text-on-surface group-hover:text-primary transition-colors duration-500">{uniqueVotersCount}</span>
                   <span className="text-3xl text-on-surface-variant/20 font-black tracking-tighter italic">/ {totalStudents}</span>
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/50 mt-4 ml-1">Authenticated Ballots Cast</span>
               </div>
               <div className="text-right mb-4">
                 <span className="text-5xl font-black text-primary tracking-tighter group-hover:scale-110 block transition-transform">{progressPercent}%</span>
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30 mt-2">Total System Reach</p>
               </div>
             </div>

             <div className="relative h-8 bg-surface-container-high dark:bg-white/5 rounded-full p-2 overflow-hidden shadow-inner border border-outline-variant/10">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-primary/[0.08] to-transparent animate-shimmer" />
                <div className="h-full bg-gradient-to-r from-primary via-primary-fixed to-orange-500 rounded-full transition-all duration-[2000ms] ease-out shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.5)] relative" style={{ width: `${progressPercent}%` }}>
                   <div className="absolute inset-0 bg-white/20 animate-pulse" />
                   <div className="absolute top-0 right-0 h-full w-4 bg-white/40 blur-sm" />
                </div>
             </div>
           </div>
        </div>

        <div className="group bg-white/80 dark:bg-neutral-950/40 backdrop-blur-3xl p-14 rounded-[4rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.03] flex flex-col justify-between transition-all duration-700 hover:border-primary/20 overflow-hidden">
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
           <div className="relative z-10">
             <div className="flex items-center gap-5 mb-10">
               <div className="w-16 h-16 rounded-[1.75rem] bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/10 shadow-xl shadow-amber-500/5">
                 <span className="material-symbols-outlined text-3xl">security</span>
               </div>
               <div>
                  <h3 className="serif text-3xl font-black text-on-surface tracking-tight">System Authority</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Manual Overrides</p>
               </div>
             </div>
             <p className="text-on-surface-variant/60 text-lg font-medium leading-relaxed mb-12 max-w-sm italic opacity-80">
               "Authorize electoral access or trigger the cosmic reveal protocol."
             </p>
           </div>

           <div className="grid grid-cols-2 gap-8 relative z-10">
             <button 
               disabled={loadingAction === "voting_enabled"} 
               onClick={() => toggleSetting("voting_enabled")} 
               className={`group/btn relative flex flex-col items-center gap-5 py-10 rounded-[3rem] border transition-all duration-700 overflow-hidden ${settings.voting_enabled ? "border-green-500/40 bg-green-500/5 text-green-600 shadow-2xl shadow-green-500/10" : "border-red-500/40 bg-red-500/5 text-red-600 shadow-2xl shadow-red-500/10"}`}
             >
                <div className={`absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${settings.voting_enabled ? "from-green-500/10 to-transparent" : "from-red-500/10 to-transparent"}`} />
                <span className={`material-symbols-outlined text-[3.5rem] transition-all duration-700 group-hover/btn:scale-110 group-hover/btn:-rotate-12 ${settings.voting_enabled ? "animate-pulse" : ""}`}>
                  {settings.voting_enabled ? "lock_open" : "lock"}
                </span>
                <span className="font-black text-[11px] tracking-[0.4em] uppercase">{settings.voting_enabled ? "Ballot Live" : "Vault Closed"}</span>
                {loadingAction === "voting_enabled" && <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-8 h-8 border-3 border-current border-t-transparent rounded-full animate-spin" /></div>}
             </button>

             <button 
               disabled={loadingAction === "awards_revealed"} 
               onClick={() => toggleSetting("awards_revealed")} 
               className={`group/btn relative flex flex-col items-center gap-5 py-10 rounded-[3rem] border transition-all duration-700 overflow-hidden ${settings.awards_revealed ? "border-primary/40 bg-primary/10 text-primary shadow-2xl shadow-primary/30 scale-105" : "border-outline-variant/10 bg-white dark:bg-white/5 text-on-surface-variant/40 hover:border-primary/20"}`}
             >
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-primary/10 to-transparent" />
                <span className={`material-symbols-outlined text-[3.5rem] transition-all duration-700 group-hover/btn:scale-110 group-hover/btn:rotate-12`}>
                  {settings.awards_revealed ? "visibility" : "visibility_off"}
                </span>
                <span className="font-black text-[11px] tracking-[0.4em] uppercase">{settings.awards_revealed ? "Showcase Active" : "Reveal Sequence"}</span>
                {loadingAction === "awards_revealed" && <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-8 h-8 border-3 border-current border-t-transparent rounded-full animate-spin" /></div>}
             </button>
           </div>
        </div>
      </div>

      {/* Fraud Detection alerts */}
      {fraudAlerts.length > 0 && (
         <div className="bg-red-500/5 dark:bg-red-500/10 border-l-8 border-red-500 p-12 rounded-[3.5rem] mb-16 flex gap-10 items-center animate-in slide-in-from-top-4 backdrop-blur-3xl border border-red-500/20 shadow-2xl shadow-red-500/5 group">
            <div className="w-20 h-20 rounded-[1.75rem] bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/40 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-4xl animate-bounce">warning</span>
            </div>
            <div className="flex-1">
               <h4 className="serif text-4xl font-black text-on-surface tracking-tight italic">Integrity Violation Detected</h4>
               <p className="text-[12px] font-black uppercase tracking-[0.3em] text-red-600/70 mt-3">{fraudAlerts.length} Identities flagged for multi-ballot submission. Immediate review recommended.</p>
            </div>
            <button className="px-8 py-4 bg-red-500/10 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all duration-500">Isolate Anomaly</button>
         </div>
      )}

      {/* Categories & Live Feed */}
      <div className="bg-white/60 dark:bg-neutral-950/60 backdrop-blur-3xl border border-white dark:border-white/5 rounded-[5rem] p-16 shadow-2xl shadow-black/[0.02] pb-32 relative overflow-hidden">
         <div className="absolute bottom-0 right-0 w-[50rem] h-[50rem] bg-primary/5 blur-[180px] rounded-full pointer-events-none" />
         
         <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-20 relative z-10">
            <div>
              <h3 className="serif text-6xl font-black text-on-surface tracking-tighter italic">Recognition <span className="text-primary not-italic">Registry</span></h3>
              <div className="flex items-center gap-4 mt-6">
                 <div className="w-10 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)]" />
                 <p className="text-[11px] font-black uppercase tracking-[0.5em] text-on-surface-variant/40">Manage Category Architecture</p>
              </div>
            </div>
            <button onClick={() => setAdding(true)} className="group/add flex items-center gap-6 px-12 py-7 bg-on-surface dark:bg-primary-fixed text-surface dark:text-primary-fixed-dim rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-black/20 transition-all hover:scale-105 active:scale-95 relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/add:opacity-100 transition-opacity" />
              <span className="material-symbols-outlined text-2xl group-hover/add:rotate-90 transition-transform duration-500">add</span> 
              <span className="relative z-10">Initialize Entry</span>
            </button>
         </div>

         {/* Manager Table */}
         <div className="space-y-8 relative z-10">
           {adding && (
              <div className="bg-primary/5 p-16 rounded-[4rem] border border-primary/20 animate-in zoom-in-95 duration-700 flex flex-col sm:flex-row gap-10 backdrop-blur-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem]" />
                 <div className="flex-1">
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-5">Deploy Recognition Category</p>
                   <input 
                     autoFocus 
                     className="w-full px-10 py-6 rounded-3xl bg-white dark:bg-neutral-950 border border-primary/20 text-3xl font-black text-on-surface focus:ring-8 ring-primary/5 transition-all outline-none placeholder:text-on-surface/10" 
                     placeholder="Title (e.g., Academic Vanguard)" 
                     value={newText} 
                     onChange={(e)=>setNewText(e.target.value)}
                   />
                 </div>
                 <div className="flex items-end gap-5">
                   <button onClick={addQuestion} className="h-20 px-12 bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:brightness-110 active:scale-95">Verify & Save</button>
                   <button onClick={()=>setAdding(false)} className="h-20 px-10 bg-white/60 dark:bg-white/5 text-on-surface-variant/60 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-white dark:hover:bg-white/10 transition-all">Abort</button>
                 </div>
              </div>
           )}

           {categoryStats.map(c => (
              <div key={c.id} className="group relative flex flex-col lg:flex-row lg:items-center justify-between p-14 bg-white/40 dark:bg-white/5 border border-white dark:border-white/5 rounded-[4rem] transition-all duration-1000 hover:border-primary/30 hover:bg-white dark:hover:bg-neutral-900 shadow-xl shadow-black/[0.01] hover:shadow-2xl hover:shadow-primary/[0.02]">
                 <div className="flex-1 mb-12 lg:mb-0">
                    {editingId === c.id ? (
                      <div className="flex gap-6 items-center">
                         <input 
                           autoFocus 
                           className="flex-1 px-10 py-5 rounded-[2rem] bg-white dark:bg-neutral-800 border border-primary/30 text-3xl font-black text-on-surface outline-none focus:ring-8 ring-primary/10 transition-all" 
                           value={editText} 
                           onChange={(e)=>setEditText(e.target.value)} 
                         />
                         <button onClick={saveEdit} className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 hover:scale-110 transition-all"><span className="material-symbols-outlined text-3xl">done</span></button>
                         <button onClick={() => setEditingId(null)} className="w-16 h-16 bg-on-surface/5 rounded-2xl flex items-center justify-center hover:bg-on-surface/10 transition-all"><span className="material-symbols-outlined text-3xl">close</span></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-10">
                         <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center transition-all duration-1000 ${c.is_active ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-110 rotate-3" : "bg-on-surface/5 text-on-surface-variant/40"}`}>
                           <span className="material-symbols-outlined text-[2.5rem]">{c.is_active ? "military_tech" : "do_not_disturb_on"}</span>
                         </div>
                         <div>
                            <div className="flex items-center gap-5">
                               <h4 className={`text-4xl font-black text-on-surface tracking-tighter ${!c.is_active ? "opacity-30 italic" : ""}`}>{c.question}</h4>
                               <button onClick={() => { setEditingId(c.id); setEditText(c.question); }} className="opacity-0 group-hover:opacity-100 transition-all hover:scale-125 text-primary">
                                  <span className="material-symbols-outlined text-2xl">edit_note</span>
                                </button>
                            </div>
                            <p className={`text-[11px] font-black uppercase tracking-[0.5em] mt-3 ml-0.5 ${c.is_active ? "text-primary/60" : "text-on-surface-variant/20"}`}>
                              {c.is_active ? "Operational Recognition Vector" : "Sequence Terminated"}
                            </p>
                         </div>
                      </div>
                    )}
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-12 bg-white/60 dark:bg-black/20 p-10 rounded-[3rem] border border-white dark:border-white/5 backdrop-blur-3xl shadow-inner group-hover:bg-white transition-colors duration-700">
                    <div className="flex flex-col items-center justify-center px-6">
                       <span className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-[0.4em] mb-4">Data Points</span>
                       <span className="text-5xl font-black text-on-surface tracking-tighter group-hover:text-primary transition-colors">{c.totalVotes}</span>
                    </div>
                    
                    <div className="hidden sm:block w-px h-16 bg-on-surface/5" />
                    
                    <div className="flex flex-col min-w-[280px]">
                       <span className="text-[10px] font-black uppercase text-on-surface-variant/40 tracking-[0.4em] mb-5">Vanguard Standings</span>
                       {c.topNominees.length === 0 ? (
                         <div className="flex items-center gap-4 text-on-surface-variant/20 font-black text-[11px] uppercase tracking-[0.3em]">
                            <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
                            Awaiting Telemetry
                         </div>
                       ) : (
                         <div className="flex flex-col gap-4">
                           {c.topNominees.map((n, i) => (
                             <div key={n.name} className="flex justify-between items-center gap-6 group/item">
                               <div className="flex items-center gap-5">
                                 <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-transform group-hover/item:scale-110 ${i === 0 ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]" : i === 1 ? "bg-zinc-400 text-black" : "bg-orange-800 text-white"}`}>
                                   {i+1}
                                 </div> 
                                 <span className="text-[13px] font-black text-on-surface uppercase tracking-tight truncate max-w-[140px] opacity-80 group-hover/item:opacity-100 transition-opacity">{n.name}</span>
                               </div>
                               <span className="text-[10px] font-black text-primary px-3 py-1 rounded-xl bg-primary/5 border border-primary/5">{n.count} pts</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>

                    <div className="hidden sm:block w-px h-16 bg-on-surface/5" />

                    <button 
                      onClick={() => toggleQActive(c.id, c.is_active)} 
                      className={`relative w-24 h-12 rounded-full transition-all duration-700 p-1.5 flex items-center ${c.is_active ? "bg-primary shadow-[0_0_25px_rgba(var(--color-primary-rgb),0.4)]" : "bg-on-surface/10"}`}
                    >
                       <div className={`w-9 h-9 rounded-full bg-white shadow-2xl transition-transform duration-700 transform ${c.is_active ? "translate-x-12" : "translate-x-0"}`} />
                    </button>
                 </div>
              </div>
           ))}
         </div>
      </div>
    </div>
  );
}
