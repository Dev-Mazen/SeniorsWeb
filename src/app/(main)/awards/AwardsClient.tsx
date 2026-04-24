"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Question = { id: string; question: string };
type Profile = { id: string; full_name: string | null; photo_url: string | null };
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
    } else {
      console.error("Vote failed:", error.message);
    }
    setSaving(null);
  }

  function getInitials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  }

  function filteredProfiles(qId: string) {
    const q = (search[qId] ?? "").toLowerCase();
    return profiles.filter(p => !q || (p.full_name ?? "").toLowerCase().includes(q));
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-12 pb-32">
      <header className="mb-12">
        <h1 className="serif text-6xl font-black text-on-surface mb-3">
          Seniors <span className="text-primary italic">Awards</span>
        </h1>
        <p className="text-on-surface-variant text-lg">
          {votingEnabled
            ? "Tap a classmate to vote. You can change your vote anytime."
            : awardsRevealed
            ? "Voting has ended. Winners are revealed below."
            : "Voting is not open yet. Stay tuned!"}
        </p>
      </header>

      {!votingEnabled && !awardsRevealed && (
        <div className="bg-surface-container-high rounded-2xl p-10 text-center mb-12 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-5xl text-outline">how_to_vote</span>
          <p className="text-on-surface-variant font-medium text-lg">Voting hasn&apos;t started yet. Check back soon!</p>
        </div>
      )}

      <div className="space-y-12">
        {questions.map(q => {
          const currentVote = votes[q.id];
          const qResults = results?.[q.id] ?? [];
          const winner = awardsRevealed ? profiles.find(p => p.id === qResults[0]?.nominee_id) : null;
          const filtered = filteredProfiles(q.id);

          return (
            <div key={q.id} className="bg-surface-container-lowest rounded-2xl editorial-shadow border border-outline-variant/10 overflow-hidden">
              {/* Question Header */}
              <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">emoji_events</span>
                  <h2 className="serif text-xl font-bold text-on-surface">{q.question}</h2>
                </div>
                {currentVote && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                    <span className="text-primary text-xs font-bold">
                      {profiles.find(p => p.id === currentVote)?.full_name ?? "Voted"}
                    </span>
                  </div>
                )}
              </div>

              {/* Winner Banner (when revealed) */}
              {awardsRevealed && winner && (
                <div className="mx-6 mt-6 flex items-center gap-4 p-5 bg-gradient-to-r from-amber-500/10 to-amber-400/5 border border-amber-400/20 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl font-black text-amber-700 flex-shrink-0 overflow-hidden">
                    {winner.photo_url
                      ? <img src={winner.photo_url} alt={winner.full_name ?? ""} className="w-full h-full object-cover" />
                      : getInitials(winner.full_name)}
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-0.5">🏆 Winner</p>
                    <p className="font-black text-on-surface text-xl serif">{winner.full_name}</p>
                    <p className="text-on-surface-variant text-xs">{qResults[0]?.count} votes</p>
                  </div>
                </div>
              )}

              {/* Voting Grid */}
              {votingEnabled && (
                <div className="p-6">
                  {/* Search bar */}
                  <div className="relative mb-4">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                    <input
                      className="w-full pl-9 pr-4 py-2.5 bg-surface-container rounded-xl border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline/60 text-on-surface"
                      placeholder={`Search among ${profiles.length} classmates...`}
                      value={search[q.id] ?? ""}
                      onChange={e => setSearch(prev => ({ ...prev, [q.id]: e.target.value }))}
                    />
                  </div>

                  {filtered.length === 0 ? (
                    <p className="text-center text-on-surface-variant text-sm py-6">No classmates match your search.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto no-scrollbar pr-1">
                      {filtered.map(p => {
                        const isSelected = currentVote === p.id;
                        const isSaving = saving === `${q.id}:${p.id}`;
                        const isSelf = p.id === userId;

                        return (
                          <button
                            key={p.id}
                            onClick={() => !isSelf && castVote(q.id, p.id)}
                            disabled={isSelf || isSaving}
                            title={isSelf ? "You can't vote for yourself" : p.full_name ?? ""}
                            className={`
                              relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 select-none
                              ${isSelected
                                ? "border-primary bg-primary/10 shadow-md shadow-primary/10 scale-[1.02]"
                                : "border-transparent bg-surface-container hover:bg-surface-container-high hover:border-outline-variant/40"
                              }
                              ${isSelf ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                            `}
                          >
                            {/* Avatar */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 overflow-hidden transition-all ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest" : ""}`}>
                              {p.photo_url
                                ? <img src={p.photo_url} alt={p.full_name ?? ""} className="w-full h-full object-cover" />
                                : (
                                  <div className={`w-full h-full flex items-center justify-center ${isSelected ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                                    {getInitials(p.full_name)}
                                  </div>
                                )
                              }
                            </div>

                            {/* Name */}
                            <span className={`text-xs font-semibold text-center leading-tight line-clamp-2 ${isSelected ? "text-primary" : "text-on-surface"}`}>
                              {p.full_name}
                            </span>

                            {/* Selected check */}
                            {isSelected && !isSaving && (
                              <span className="absolute top-1.5 right-1.5 material-symbols-outlined text-primary text-[16px]">check_circle</span>
                            )}

                            {/* Saving spinner */}
                            {isSaving && (
                              <span className="absolute top-1.5 right-1.5 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Voting closed state */}
              {!votingEnabled && !awardsRevealed && (
                <p className="px-6 py-5 text-on-surface-variant text-sm italic">Voting is currently closed for this category.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}