"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Question = { id: string; question: string };
type Profile = { id: string; full_name: string | null; nickname?: string | null; photo_url: string | null };
type MyVote = { question_id: string; nominee_id: string };
type Results = Record<string, { nominee_id: string; count: number }[]>;

export default function AwardsClient({
  questions, profiles, myVotes, votingEnabled, awardsRevealed, results, userId,
}: {
  questions: Question[];
  profiles: Profile[];
  myVotes: MyVote[];
  votingEnabled: boolean;
  awardsRevealed: boolean;
  results: Results | null;
  userId: string;
}) {
  const [votes, setVotes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    myVotes.forEach(v => { map[v.question_id] = v.nominee_id; });
    return map;
  });
  const [saving, setSaving] = useState<string | null>(null); // "questionId:nomineeId"
  const [search, setSearch] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function shortDisplayName(name: string | null | undefined) {
    const parts = (name ?? "").split(" ").filter(Boolean);
    if (parts.length >= 2) return parts[1];
    if (parts.length === 1) return parts[0];
    return "Student";
  }

  async function castVote(questionId: string, nomineeId: string) {
    const key = `${questionId}:${nomineeId}`;
    setSaving(key);
    const supabase = createClient();

    const { error } = await supabase
      .from("awards_votes")
      .upsert(
        { voter_id: userId, question_id: questionId, nominee_id: nomineeId },
        { onConflict: "voter_id,question_id" }
      );

    if (!error) {
      setVotes(prev => ({ ...prev, [questionId]: nomineeId }));
      setNotice({ type: "success", text: "Vote saved." });
    } else {
      console.error("Vote failed:", error.message);
      setNotice({ type: "error", text: error.message });
    }
    setTimeout(() => setNotice(null), 2200);
    setSaving(null);
  }

  function getInitials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }

  function filteredProfiles(qId: string) {
    const q = (search[qId] ?? "").toLowerCase();
    return profiles.filter(
      (p) =>
        !q ||
        (p.full_name ?? "").toLowerCase().includes(q) ||
        (p.nickname ?? "").toLowerCase().includes(q)
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-16 pb-32">
      <header className="mb-16 relative">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-2"
        >
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/60 mb-2">Class of 2026</span>
          <h1 className="serif text-7xl md:text-8xl font-black text-on-surface leading-tight tracking-tighter">
            Seniors <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-container to-secondary italic pr-4">Awards</span>
          </h1>
          <p className="text-on-surface-variant/80 text-xl max-w-2xl font-medium leading-relaxed mt-4">
            {votingEnabled
              ? "Cast your vote for the legends who made our high school journey unforgettable."
              : awardsRevealed
              ? "The results are in. Celebrating the standout stars of our graduating class."
              : "The awards portal is currently under maintenance. Stay tuned for the opening."}
          </p>
        </motion.div>
        
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
      </header>

      {!votingEnabled && !awardsRevealed && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-high/40 backdrop-blur-3xl rounded-[2.5rem] p-16 text-center mb-16 flex flex-col items-center gap-6 border border-outline-variant/10 shadow-xl"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-primary animate-bounce">how_to_vote</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Voting Underway</h3>
            <p className="text-on-surface-variant font-medium opacity-70">We are finalizing the nominee lists. Please check back shortly to participate in the class superlatives.</p>
          </div>
        </motion.div>
      )}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed right-6 top-24 z-[80] rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.2em] shadow-xl ${
              notice.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low/40 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-on-surface-variant">Voting Progress</p>
        <p className="text-xs font-black text-primary">
          {Object.keys(votes).length}/{questions.length} categories selected
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:gap-12">
        {questions.map((q, idx) => {
          const currentVote = votes[q.id];
          const qResults = results?.[q.id] ?? [];
          const winner = awardsRevealed ? profiles.find(p => p.id === qResults[0]?.nominee_id) : null;
          const filtered = filteredProfiles(q.id);

          return (
            <motion.div 
              key={q.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.1 }}
              className="section-shell rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-700 hover:-translate-y-1 group/card"
            >
              {/* Question Header */}
              <div className="px-8 py-7 border-b border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-surface-container-lowest/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/15 shadow-inner">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover/card:rotate-12 transition-transform duration-500">emoji_events</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Category {idx + 1}</p>
                    <h2 className="serif text-xl md:text-3xl font-black text-on-surface tracking-tight leading-none">{q.question}</h2>
                  </div>
                </div>
                {currentVote && (
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm animate-in fade-in zoom-in duration-500">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span className="text-primary text-sm font-black tracking-tight">
                      {shortDisplayName(profiles.find(p => p.id === currentVote)?.full_name) ?? "Voted"}
                    </span>
                  </div>
                )}
              </div>

              {/* Winner Banner (when revealed) */}
              {awardsRevealed && winner && (
                <div className="mx-8 mt-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 p-10 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-[2rem] border border-amber-500/20 shadow-2xl group/winner transition-all mb-8">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-400/15 rounded-full blur-[80px] pointer-events-none group-hover/winner:scale-110 transition-transform duration-1000" />
                  
                  <div className="relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-full p-1.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-transform duration-700 group-hover/winner:scale-105">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl font-black text-amber-600 overflow-hidden border-4 border-background ring-2 ring-amber-500/20">
                      {winner.photo_url
                        ? <img src={winner.photo_url} alt={shortDisplayName(winner.full_name)} className="w-full h-full object-cover grayscale-[0.2] group-hover/winner:grayscale-0 transition-all duration-700" />
                        : getInitials(shortDisplayName(winner.full_name))}
                    </div>
                  </div>
                  
                  <div className="relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <span className="material-symbols-outlined text-amber-500 text-2xl drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">Official Superlative</p>
                    </div>
                    <p className="font-black text-on-surface text-4xl md:text-6xl serif-heading mb-2 tracking-tighter leading-tight">{shortDisplayName(winner.full_name)}</p>
                    {winner.nickname && <p className="text-xs font-black uppercase tracking-[0.2em] text-primary/70">@{winner.nickname}</p>}
                    <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                       <div className="bg-amber-500/10 px-5 py-2 rounded-full border border-amber-500/20 shadow-sm">
                          <p className="text-amber-700 dark:text-amber-400 text-xs font-black tracking-widest uppercase">{qResults[0]?.count} Collective Votes</p>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voting Grid */}
              {votingEnabled && (
                <div className="p-8">
                  {/* Search bar */}
                  <div className="relative mb-8 max-w-xl">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-xl">search</span>
                    <input
                      className="w-full pl-12 pr-6 py-4 bg-surface-container/50 backdrop-blur-xl rounded-2xl border border-outline-variant/15 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 text-on-surface shadow-sm transition-all hover:bg-surface-container/70"
                      placeholder={`Search nominees for ${q.question.toLowerCase()}...`}
                      value={search[q.id] ?? ""}
                      onChange={e => setSearch(prev => ({ ...prev, [q.id]: e.target.value }))}
                    />
                  </div>

                  {filtered.length === 0 ? (
                    <div className="text-center py-20 px-10 rounded-[2rem] bg-surface-container/20 border border-dashed border-outline-variant/20">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 block">person_search</span>
                      <p className="text-on-surface-variant/60 font-medium text-lg tracking-tight">We couldn&apos;t find anyone matching &quot;{search[q.id]}&quot;</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4 max-h-[32rem] overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-primary/10">
                      {filtered.map(p => {
                        const isSelected = currentVote === p.id;
                        const isSaving = saving === `${q.id}:${p.id}`;
                        const isSelf = p.id === userId;

                        return (
                          <button
                            key={p.id}
                            onClick={() => !isSelf && castVote(q.id, p.id)}
                            disabled={isSelf || isSaving}
                            title={isSelf ? "You can't vote for yourself" : shortDisplayName(p.full_name)}
                            className={`
                              relative flex flex-col items-center gap-2 p-3 md:gap-3 md:p-5 rounded-2xl md:rounded-[2rem] border transition-all duration-500 select-none group/nominee
                              ${isSelected
                                ? "border-primary bg-primary/5 dark:bg-primary/20 shadow-xl shadow-primary/10 scale-[1.02]"
                                : "border-outline-variant/10 bg-surface-container-low/40 hover:bg-surface-container-high/60 hover:border-primary/20 hover:-translate-y-1 hover:shadow-lg"
                              }
                              ${isSelf ? "opacity-30 cursor-not-allowed grayscale" : "cursor-pointer"}
                            `}
                          >
                            {/* Avatar */}
                            <div className={`relative w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0 overflow-hidden transition-all duration-500 ${isSelected ? "ring-2 md:ring-4 ring-primary ring-offset-2 md:ring-offset-4 ring-offset-background" : "ring-1 ring-outline-variant/20 shadow-inner"}`}>
                              {p.photo_url
                                ? <img src={p.photo_url} alt={shortDisplayName(p.full_name)} className="w-full h-full object-cover transition-transform duration-700 group-hover/nominee:scale-110" />
                                : (
                                  <div className={`w-full h-full flex items-center justify-center transition-colors duration-500 ${isSelected ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant/40"}`}>
                                    {getInitials(shortDisplayName(p.full_name))}
                                  </div>
                                )
                              }
                              {isSelected && <div className="absolute inset-0 bg-primary/10 animate-pulse" />}
                            </div>

                            {/* Name */}
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-sm font-black text-center leading-tight line-clamp-1 px-1 transition-colors duration-500 ${isSelected ? "text-primary" : "text-on-surface group-hover/nominee:text-primary"}`}>
                                {shortDisplayName(p.full_name)}
                              </span>
                              {p.nickname && <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-primary/70">@{p.nickname}</span>}
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 opacity-0 group-hover/nominee:opacity-100 transition-opacity">Nominee</span>
                            </div>

                            {/* Selection indicator */}
                            {isSelected && !isSaving && (
                              <motion.span 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute top-4 right-4 material-symbols-outlined text-primary text-xl bg-background rounded-full shadow-sm"
                              >
                                check_circle
                              </motion.span>
                            )}

                            {/* Saving spinner */}
                            {isSaving && (
                              <div className="absolute top-4 right-4 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-sm bg-background" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Voting closed state */}
              {!votingEnabled && !awardsRevealed && ( idx < questions.length ) && (
                <div className="px-10 py-8 bg-surface-container-high/20 border-t border-outline-variant/10 flex items-center gap-3">
                   <span className="material-symbols-outlined text-on-surface-variant/40">lock</span>
                   <p className="text-on-surface-variant/60 text-sm font-medium italic tracking-tight">Voting has been suspended for this category indefinitely.</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      {votingEnabled && (
        <div className="fixed bottom-20 left-4 right-4 z-[70] rounded-2xl border border-primary/20 bg-background/90 p-3 shadow-2xl backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-on-surface-variant">Votes selected</p>
            <p className="text-sm font-black text-primary">{Object.keys(votes).length}/{questions.length}</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-container-high">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (Object.keys(votes).length / Math.max(1, questions.length)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}