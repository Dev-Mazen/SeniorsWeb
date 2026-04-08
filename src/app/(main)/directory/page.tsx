"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Profile = {
  id: string;
  full_name: string | null;
  nickname: string | null;
  quote: string | null;
  fun_fact: string | null;
  photo_url: string | null;
  role: string | null;
};

type Memory = {
  id: string;
  content: string;
  created_at: string;
  status: string;
  subject_id: string;
  profiles: { full_name: string | null; photo_url: string | null } | null;
  subject?: { full_name: string | null; photo_url: string | null } | null;
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
        <span className="material-symbols-outlined text-xs">verified</span> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
        <span className="material-symbols-outlined text-xs">block</span> Rejected
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
      <span className="material-symbols-outlined text-xs">schedule</span> Pending
    </span>
  );
}

export default function DirectoryPage() {
  const [tab, setTab] = useState<"public" | "sent" | "messages">("public");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sentMemories, setSentMemories] = useState<Memory[]>([]);
  const [publicSeniorMems, setPublicSeniorMems] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      // All student profiles
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, nickname, quote, fun_fact, photo_url, role")
        .eq("is_active", true)
        .eq("role", "student")
        .order("full_name");
      if (profs) setProfiles(profs);

      // Public approved senior memories only
      const { data: pubMems } = await supabase
        .from("senior_memories")
        .select(`
          id, content, created_at, status, subject_id,
          profiles:author_id(full_name, photo_url),
          subject:subject_id(full_name, photo_url)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50);
      if (pubMems) setPublicSeniorMems(pubMems as any);

      // Memories sent to me
      if (user) {
        const { data: mems } = await supabase
          .from("senior_memories")
          .select(`
            id, content, created_at, status, subject_id,
            profiles:author_id(full_name, photo_url)
          `)
          .eq("subject_id", user.id)
          .order("created_at", { ascending: false });
        if (mems) setSentMemories(mems as any);
      }

      setLoading(false);
    };
    load();
  }, []);

  const filteredProfiles = profiles.filter(p =>
    !searchQuery || p.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublicMems = publicSeniorMems.filter(m =>
    !searchQuery ||
    m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(m.profiles) ? (m.profiles as any)[0] : m.profiles)?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(m.subject) ? (m.subject as any)[0] : m.subject)?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-8 pb-32 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-12 mt-8">
        <h1 className="serif text-6xl md:text-7xl font-bold tracking-tighter text-on-surface mb-4 leading-none">
          The Class <span className="text-primary italic">Directory</span>
        </h1>
        <p className="text-on-surface-variant text-lg font-medium max-w-md">
          Every face has a story. Browse the legacy of the Class of 2026.
        </p>
      </header>

      {/* Tabs + Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-10">
        <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1">
          <button
            onClick={() => { setTab("public"); setSearchQuery(""); }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              tab === "public"
                ? "bg-primary text-white shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">group</span>
            All Students
          </button>
          <button
            onClick={() => { setTab("messages"); setSearchQuery(""); }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              tab === "messages"
                ? "bg-primary text-white shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">public</span>
            Public Messages
            {publicSeniorMems.length > 0 && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${tab === "messages" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                {publicSeniorMems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setTab("sent"); setSearchQuery(""); }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              tab === "sent"
                ? "bg-primary text-white shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">favorite</span>
            Sent to Me
            {sentMemories.length > 0 && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${tab === "sent" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                {sentMemories.length}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        {(tab === "public" || tab === "messages") && (
          <div className="relative flex-1 max-w-sm ml-auto">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-lg">search</span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary/30 text-sm placeholder:text-outline/70 focus:outline-none"
              placeholder={tab === "public" ? "Search by name..." : "Search messages or author..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* === ALL STUDENTS TAB === */}
          {tab === "public" && (
            <>
              {filteredProfiles.length === 0 ? (
                <div className="text-center py-32">
                  <span className="material-symbols-outlined text-6xl text-outline/40">group_off</span>
                  <p className="text-on-surface-variant mt-4">
                    {searchQuery ? `No students match "${searchQuery}".` : "No students yet."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProfiles.map((p) => (
                    <div
                      key={p.id}
                      className="group bg-surface-container-lowest rounded-xl p-8 transition-all duration-500 hover:-translate-y-2 editorial-shadow flex flex-col border border-transparent hover:border-primary/10"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className="relative">
                          {p.photo_url ? (
                            <img
                              src={p.photo_url}
                              alt={p.full_name ?? ""}
                              className="w-24 h-24 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-2xl font-black text-primary">
                              {(p.full_name ?? "?")[0]}
                            </div>
                          )}
                        </div>
                        {p.nickname && (
                          <span className="px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-bold tracking-widest uppercase">
                            {p.nickname}
                          </span>
                        )}
                      </div>
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                          {p.full_name ?? "Unknown"}
                        </h3>
                        {p.quote && (
                          <p className="text-on-surface-variant text-sm italic font-medium">&ldquo;{p.quote}&rdquo;</p>
                        )}
                      </div>
                      <div className="mt-auto flex flex-col gap-4">
                        {p.fun_fact && (
                          <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{p.fun_fact}</span>
                          </div>
                        )}
                        <Link
                          href={`/directory/${p.id}/memory`}
                          className="w-full py-4 bg-surface-container-high text-on-surface font-bold rounded-full hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <span className="material-symbols-outlined text-xl">favorite</span>
                          Submit a Memory
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* === PUBLIC MESSAGES TAB (Senior Memories only) === */}
          {tab === "messages" && (
            <div className="max-w-4xl mx-auto">
              {filteredPublicMems.length === 0 ? (
                <div className="text-center py-32">
                  <span className="material-symbols-outlined text-6xl text-outline/40">history_edu</span>
                  <p className="text-on-surface-variant mt-4 font-medium">
                    {searchQuery ? `No messages match "${searchQuery}".` : "No public messages yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredPublicMems.map(m => {
                    const prof = Array.isArray(m.profiles) ? (m.profiles as any)[0] : m.profiles;
                    const subj = Array.isArray(m.subject) ? (m.subject as any)[0] : m.subject;
                    return (
                      <article key={m.id} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-3 mb-4">
                          {prof?.photo_url ? (
                            <img src={prof.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                              {(prof?.full_name ?? "?")[0]}
                            </div>
                          )}
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-sm text-on-surface">{prof?.full_name ?? "Anonymous"}</p>
                            <p className="text-xs text-on-surface-variant truncate">
                              {subj?.full_name ? `→ About ${subj.full_name}` : ""} · {timeAgo(m.created_at)}
                            </p>
                          </div>
                          <StatusBadge status={m.status} />
                        </div>
                        <p className="text-on-surface leading-relaxed whitespace-pre-wrap font-serif italic text-lg">&ldquo;{m.content}&rdquo;</p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* === SENT TO ME TAB === */}
          {tab === "sent" && (
            <div className="max-w-3xl mx-auto">
              {sentMemories.length === 0 ? (
                <div className="text-center py-32">
                  <span className="material-symbols-outlined text-6xl text-outline/40">history_edu</span>
                  <p className="text-on-surface-variant mt-4 font-medium">No memories have been sent to you yet.</p>
                  <p className="text-on-surface-variant/60 text-sm mt-1">They&apos;ll appear here once a classmate submits one for you.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sentMemories.map(m => {
                    const prof = Array.isArray(m.profiles) ? (m.profiles as any)[0] : m.profiles;
                    return (
                      <article key={m.id} className="bg-surface-container-lowest rounded-xl p-7 editorial-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform duration-300">
                        <div className="flex items-center gap-3 mb-5">
                          {prof?.photo_url ? (
                            <img src={prof.photo_url} alt="" className="w-11 h-11 rounded-full object-cover" />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                              {(prof?.full_name ?? "?")[0]}
                            </div>
                          )}
                          <div className="flex-grow">
                            <p className="font-bold text-sm text-on-surface">{prof?.full_name ?? "Anonymous"}</p>
                            <p className="text-xs text-on-surface-variant">{timeAgo(m.created_at)}</p>
                          </div>
                          <StatusBadge status={m.status} />
                        </div>
                        <p className="text-on-surface leading-relaxed whitespace-pre-wrap font-serif italic text-lg">&ldquo;{m.content}&rdquo;</p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
