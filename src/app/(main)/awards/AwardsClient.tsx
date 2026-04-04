"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Question = { id: string; question: string };
type Profile = { id: string; full_name: string | null; photo_url: string | null };
type MyVote = { question_id: string; nominee_id: string };
type Results = Record<string, { nominee_id: string; count: number }[]>;

export default function AwardsClient({ questions, profiles, myVotes, votingEnabled, awardsRevealed, results, userId }: {
  questions: Question[]; profiles: Profile[]; myVotes: MyVote[]; votingEnabled: boolean; awardsRevealed: boolean; results: Results | null; userId: string;
}) {
  const [votes, setVotes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    myVotes.forEach(v => { map[v.question_id] = v.nominee_id; });
    return map;
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState<Record<string, string>>({});

  async function castVote(questionId: string, nomineeId: string) {
    setSaving(questionId);
    const supabase = createClient();
    const existing = myVotes.find(v => v.question_id === questionId);
    if (existing) {
      await supabase.from("awards_votes").update({ nominee_id: nomineeId }).eq("question_id", questionId).eq("voter_id", userId);
    } else {
      await supabase.from("awards_votes").insert({ question_id: questionId, voter_id: userId, nominee_id: nomineeId });
    }
    setVotes(prev => ({ ...prev, [questionId]: nomineeId }));
    setSaving(null);
  }

  function filtered(qId: string) {
    const q = (search[qId] ?? "").toLowerCase();
    return profiles.filter(p => !q || (p.full_name ?? "").toLowerCase().includes(q));
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-32">
      <header className="mb-12">
        <h1 className="serif text-6xl font-black text-on-surface mb-3">Seniors <span className="text-primary italic">Awards</span></h1>
        <p className="text-on-surface-variant text-lg">One vote per category. Results revealed by admin.</p>
      </header>

      {!votingEnabled && !awardsRevealed && (
        <div className="bg-surface-container-high rounded-xl p-8 text-center mb-12">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 block">how_to_vote</span>
          <p className="text-on-surface-variant font-medium">Voting is not open yet. Stay tuned!</p>
        </div>
      )}

      <div className="space-y-8">
        {questions.map(q => {
          const myVote = votes[q.id];
          const qResults = results?.[q.id] ?? [];
          const winner = awardsRevealed ? profiles.find(p => p.id === qResults[0]?.nominee_id) : null;

          return (
            <div key={q.id} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">emoji_events</span>
                <h2 className="serif text-xl font-bold text-on-surface">{q.question}</h2>
                {myVote && <span className="ml-auto px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Voted</span>}
              </div>

              {awardsRevealed && winner ? (
                <div className="flex items-center gap-4 p-4 bg-tertiary-fixed/30 rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-tertiary">emoji_events</span>
                  <div>
                    <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">Winner</p>
                    <p className="font-black text-on-surface text-xl serif">{winner.full_name}</p>
                    <p className="text-on-surface-variant text-xs">{qResults[0]?.count} votes</p>
                  </div>
                </div>
              ) : votingEnabled ? (
                <>
                  <input
                    className="w-full p-3 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm mb-4"
                    placeholder="Search classmates..."
                    value={search[q.id] ?? ""}
                    onChange={e => setSearch(prev => ({ ...prev, [q.id]: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto no-scrollbar">
                    {filtered(q.id).map(p => (
                      <button key={p.id} onClick={() => castVote(q.id, p.id)} disabled={saving === q.id || p.id === userId}
                        className={`flex items-center gap-2 p-3 rounded-xl text-left transition-all text-sm font-medium ${myVote === p.id ? "bg-primary text-white" : "bg-surface-container-high hover:bg-surface-container text-on-surface"} disabled:opacity-40`}>
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center text-xs font-black">
                          {(p.full_name ?? "?")[0]}
                        </div>
                        <span className="truncate">{p.full_name}</span>
                        {myVote === p.id && <span className="material-symbols-outlined text-sm ml-auto">check</span>}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-on-surface-variant text-sm italic">Voting closed.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}