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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-bold text-on-surface serif tracking-tight">Voting Control</h2>
          <p className="text-on-surface-variant font-medium mt-1">Live ballot monitoring and stage execution.</p>
        </div>
      </header>

      {/* Global Controls & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/20 editorial-shadow">
           <h3 className="serif text-xl font-bold mb-6">Vote Progress</h3>
           <div className="mb-2 flex justify-between items-end">
             <span className="text-4xl font-black">{uniqueVotersCount}<span className="text-xl text-on-surface-variant opacity-50">/{totalStudents}</span></span>
             <span className="text-primary font-black">{progressPercent}% Completion</span>
           </div>
           <div className="h-4 bg-surface-container rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
           </div>
           <div className="mt-4 flex items-center justify-between text-sm font-semibold border-t border-outline-variant/20 pt-4">
              <span className="text-on-surface-variant">Live Vote Count</span>
              <span className="bg-on-surface/5 px-2 py-1 rounded">{votes.length} Total Cast</span>
           </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/20 editorial-shadow flex flex-col justify-between">
           <div>
             <h3 className="serif text-xl font-bold mb-4">Operations Lock</h3>
             <p className="text-sm font-medium text-on-surface-variant mb-6 leading-relaxed">
               Control platform abilities. Lock voting just before graduation begins. Reveal winners when requested on stage.
             </p>
           </div>
           <div className="flex gap-4">
             <button disabled={loadingAction === "voting_enabled"} onClick={() => toggleSetting("voting_enabled")} className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${settings.voting_enabled ? "border-green-500 bg-green-50 text-green-800" : "border-red-500 bg-red-50 text-red-800"}`}>
                <span className="material-symbols-outlined text-3xl">{settings.voting_enabled ? "lock_open" : "lock"}</span>
                <span className="font-bold text-sm tracking-widest uppercase">{settings.voting_enabled ? "Voting Live" : "Voting Locked"}</span>
             </button>
             <button disabled={loadingAction === "awards_revealed"} onClick={() => toggleSetting("awards_revealed")} className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${settings.awards_revealed ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"}`}>
                <span className="material-symbols-outlined text-3xl">{settings.awards_revealed ? "visibility" : "visibility_off"}</span>
                <span className="font-bold text-sm tracking-widest uppercase">{settings.awards_revealed ? "Winners Visible" : "Winners Hidden"}</span>
             </button>
           </div>
        </div>
      </div>

      {/* Fraud Detection alerts */}
      {fraudAlerts.length > 0 && (
         <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-8 flex gap-4 animate-in slide-in-from-top-2">
            <span className="material-symbols-outlined text-3xl text-red-600">gavel</span>
            <div>
               <h4 className="font-bold text-red-900 text-lg">System Integrity Flag</h4>
               <p className="text-red-800 text-sm mt-1">{fraudAlerts.length} users have submitted more votes than active categories. Check database for duplicate submissions.</p>
            </div>
         </div>
      )}

      {/* Categories & Live Feed */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] p-8 editorial-shadow pb-16">
         <div className="flex justify-between items-center mb-6">
            <h3 className="serif text-2xl font-bold">Category Results Preview</h3>
            <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-bold shadow hover:scale-105 transition-transform"><span className="material-symbols-outlined text-sm">add</span> Add Award</button>
         </div>

         {/* Manager Table */}
         <div className="space-y-4">
           {adding && (
              <div className="bg-surface-container-high p-4 rounded-xl flex gap-3">
                 <input autoFocus className="flex-1 px-4 rounded-lg bg-white border border-outline-variant/20 text-sm" placeholder="Title (e.g., Best Dressed)" value={newText} onChange={(e)=>setNewText(e.target.value)}/>
                 <button onClick={addQuestion} className="bg-primary text-white font-bold px-5 py-2 rounded-lg text-sm">Save</button>
                 <button onClick={()=>setAdding(false)} className="bg-surface-variant px-5 py-2 rounded-lg text-sm font-bold">Cancel</button>
              </div>
           )}

           {categoryStats.map(c => (
              <div key={c.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-surface-container-low border border-outline-variant/10 rounded-2xl group hover:border-outline-variant/40 transition-colors">
                 <div className="flex-1">
                    {editingId === c.id ? (
                      <div className="flex gap-2">
                         <input autoFocus className="flex-1 px-3 py-1.5 rounded bg-white border text-sm font-bold max-w-sm" value={editText} onChange={(e)=>setEditText(e.target.value)} />
                         <button onClick={saveEdit} className="bg-primary text-white px-3 py-1 rounded text-xs font-bold shadow">Save</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                         <h4 className={`text-lg font-bold ${!c.is_active ? "line-through opacity-50" : ""}`}>{c.question}</h4>
                         <button onClick={() => { setEditingId(c.id); setEditText(c.question); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">edit</span>
                         </button>
                      </div>
                    )}
                 </div>
                 
                 {/* Live Analytics for this category */}
                 <div className="flex items-center gap-6 mt-4 md:mt-0 ml-0 md:ml-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-outline-variant/10">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Votes</span>
                       <span className="text-sm font-bold text-primary text-center">{c.totalVotes}</span>
                    </div>
                    <div className="w-px h-6 bg-outline-variant/20" />
                    <div className="flex flex-col min-w-[140px]">
                       <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-1">Top Rankings</span>
                       {c.topNominees.length === 0 ? (
                         <span className="text-sm font-bold opacity-50">No votes yet</span>
                       ) : (
                         <div className="flex flex-col gap-1">
                           {c.topNominees.map((n, i) => (
                             <div key={n.name} className="flex justify-between items-center text-xs">
                               <span className="font-bold flex items-center gap-1">
                                 <span className={i === 0 ? "text-amber-500" : i === 1 ? "text-stone-400" : "text-orange-700"}>#{i+1}</span> 
                                 <span className="truncate max-w-[80px]" title={n.name}>{n.name}</span>
                               </span>
                               <span className="text-[10px] font-black bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">{n.count} votes</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Active Toggle */}
                 <button onClick={() => toggleQActive(c.id, c.is_active)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
                    <span className={`material-symbols-outlined text-3xl ${c.is_active ? "text-green-500" : "text-surface-variant"}`}>{c.is_active ? "toggle_on" : "toggle_off"}</span>
                 </button>
              </div>
           ))}
         </div>
      </div>
    </div>
  );
}
