"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Profile = {
  id: string;
  full_name: string | null;
  nickname: string | null;
  quote: string | null;
  fun_fact: string | null;
  photo_url: string | null;
  role: string | null;
};

type AuthorMini = { full_name: string | null; photo_url: string | null };
type Relation<T> = T | T[] | null;

type Memory = {
  id: string;
  content: string;
  created_at: string;
  status: string;
  subject_id: string;
  profiles: Relation<AuthorMini>;
  subject?: Relation<AuthorMini>;
};

function shortDisplayName(name: string | null | undefined) {
  const parts = (name ?? "").split(" ").filter(Boolean);
  if (parts.length >= 2) return parts[1];
  if (parts.length === 1) return parts[0];
  return "Student";
}

function one<T>(value: Relation<T> | undefined): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

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
      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-red-600 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
        <span className="material-symbols-outlined text-[10px]">block</span> Rejected
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
      <span className="material-symbols-outlined text-[10px]">schedule</span> Pending
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

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, nickname, quote, fun_fact, photo_url, role")
        .eq("is_active", true)
        .eq("role", "student")
        .order("full_name");
      if (profs) setProfiles(profs);

      const { data: pubMems } = await supabase
        .from("senior_memories")
        .select(`
          id, content, created_at, status, subject_id,
          profiles:author_id(full_name, photo_url),
          subject:subject_id(full_name, photo_url)
        `)
        .eq("status", "approved")
        .eq("is_private", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (pubMems) setPublicSeniorMems(pubMems as unknown as Memory[]);

      if (user) {
        const { data: mems } = await supabase
          .from("senior_memories")
          .select(`
            id, content, created_at, status, subject_id,
            profiles:author_id(full_name, photo_url)
          `)
          .eq("subject_id", user.id)
          .order("created_at", { ascending: false });
        if (mems) setSentMemories(mems as unknown as Memory[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const [studentPage, setStudentPage] = useState(1);
  const STUDENTS_PER_PAGE = 12;

  const filteredProfiles = profiles.filter(p =>
    !searchQuery ||
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPublicMems = publicSeniorMems.filter(m =>
    !searchQuery ||
    m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    one(m.profiles)?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    one(m.subject)?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudentPages = Math.ceil(filteredProfiles.length / STUDENTS_PER_PAGE);
  const paginatedProfiles = filteredProfiles.slice((studentPage - 1) * STUDENTS_PER_PAGE, studentPage * STUDENTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-16 md:px-8">
      {/* Header */}
      <header className="mb-16 relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-[1px] bg-primary/40" />
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/80">Academic Registry</span>
        </div>
        <h1 className="serif text-7xl md:text-9xl font-black leading-[0.85] tracking-tighter text-on-surface mb-8">
          The <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary-container to-secondary italic pr-4">Directory.</span>
        </h1>
        <p className="max-w-2xl text-xl font-medium leading-relaxed text-on-surface-variant/80">
          Every face holds a legacy. Explore the archive of the Class of 2026, browse reflections, and share memories.
        </p>
      </header>

      {/* Tabs + Search Row */}
      <section className="section-shell rounded-[2.5rem] p-4 md:p-6 mb-12 shadow-xl border border-outline-variant/10 relative overflow-hidden group/controls">
        <div className="absolute inset-0 bg-surface-container-low/30 backdrop-blur-3xl -z-10" />
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-1.5 p-1.5 bg-surface-container-high/40 rounded-full border border-outline-variant/5">
            {[
              { id: "public", label: "All Students", icon: "group" },
              { id: "messages", label: "Public Reflections", icon: "public", count: publicSeniorMems.length },
              { id: "sent", label: "Received", icon: "favorite", count: sentMemories.length }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id as "public" | "sent" | "messages"); setSearchQuery(""); setStudentPage(1); }}
                className={`relative px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5 overflow-hidden group/tab ${
                  tab === t.id ? "text-white" : "text-on-surface-variant/60 hover:text-on-surface"
                }`}
              >
                {tab === t.id && (
                   <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary shadow-lg shadow-primary/20" />
                )}
                <span className={`material-symbols-outlined text-base relative z-10 transition-transform duration-500 ${tab === t.id ? "scale-110" : "group-hover/tab:rotate-12"}`}>{t.icon}</span>
                <span className="relative z-10">{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span className={`relative z-10 text-[9px] px-2 py-0.5 rounded-full ${tab === t.id ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary/40">search</span>
            <input
              type="text"
              className="w-full pl-14 pr-6 py-4 bg-surface-container-highest/50 focus:bg-surface-container-highest transition-all rounded-full border border-outline-variant/10 focus:border-primary/30 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-4 focus:ring-primary/5"
              placeholder={tab === "public" ? "Identify by name..." : "Search reflections or authors..."}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setStudentPage(1); }}
            />
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 gap-4"
          >
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Accessing Archive</p>
          </motion.div>
        ) : (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* === ALL STUDENTS TAB === */}
            {tab === "public" && (
              <>
                {filteredProfiles.length === 0 ? (
                  <div className="text-center py-40 bg-surface-container-low/20 rounded-[3rem] border border-dashed border-outline-variant/20">
                    <span className="material-symbols-outlined text-6xl text-outline/20 mb-4 block">group_off</span>
                    <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs">
                      {searchQuery ? `No match found for "${searchQuery}"` : "Archive is currently empty"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
                          Registry Active · {filteredProfiles.length} Members
                        </p>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                         Page {studentPage} of {totalStudentPages}
                      </p>
                    </div>

                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                      {paginatedProfiles.map((p, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={p.id}
                          className="break-inside-avoid gallery-card group relative bg-surface-container-lowest flex flex-col scroll-reveal cursor-pointer"
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-container-high group-hover:shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] transition-shadow duration-700">
                            {p.photo_url ? (
                              <img
                                src={p.photo_url}
                                alt={p.full_name ?? ""}
                                className="w-full h-full object-cover grayscale-[0.5] contrast-125 brightness-90 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-8xl font-black text-primary/20">
                                {(p.full_name ?? "?")[0]}
                              </div>
                            )}
                            
                            {/* Gradient Overlay for Text Visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none transition-opacity duration-500 opacity-80 group-hover:opacity-100" />
                            
                            {/* Text Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end text-white">
                              <div className="flex items-center gap-2 mb-1">
                                {p.nickname && (
                                  <span className="text-[9px] font-black tracking-[0.2em] uppercase text-primary/90 bg-primary/20 px-2 py-0.5 rounded border border-primary/30 backdrop-blur-md">
                                    @{p.nickname}
                                  </span>
                                )}
                              </div>
                              <h3 className="serif text-3xl font-black tracking-tighter leading-none mb-1 group-hover:text-primary transition-colors">
                                {shortDisplayName(p.full_name)}
                              </h3>
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
                                {p.role === "student" ? "Class of '26" : "Faculty"}
                              </p>
                              
                              {p.quote && (
                                <p className="text-white/80 font-medium text-xs italic leading-relaxed line-clamp-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                  &ldquo;{p.quote}&rdquo;
                                </p>
                              )}
                              
                              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                <Link
                                  href={`/directory/${p.id}/memory`}
                                  className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2"
                                >
                                  <span className="material-symbols-outlined text-sm">edit_note</span>
                                  Archive Memory
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalStudentPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-20">
                        <button
                          onClick={() => { setStudentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          disabled={studentPage === 1}
                          className="w-14 h-14 rounded-full bg-surface-container-low text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm border border-outline-variant/10"
                        >
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        
                        <div className="flex items-center gap-2">
                          {Array.from({ length: totalStudentPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => { setStudentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${
                                page === studentPage 
                                ? 'bg-on-surface text-background shadow-lg' 
                                : 'text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/10'
                              }`}
                            >
                              {String(page).padStart(2, '0')}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => { setStudentPage(p => Math.min(totalStudentPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          disabled={studentPage === totalStudentPages}
                          className="w-14 h-14 rounded-full bg-surface-container-low text-on-surface hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm border border-outline-variant/10"
                        >
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* === PUBLIC MESSAGES TAB === */}
            {tab === "messages" && (
              <div className="max-w-4xl mx-auto px-4">
                {filteredPublicMems.length === 0 ? (
                  <div className="text-center py-40 bg-surface-container-low/20 rounded-[3rem] border border-dashed border-outline-variant/20">
                    <span className="material-symbols-outlined text-6xl text-outline/20 mb-4 block">history_edu</span>
                    <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs">No reflections published yet</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {filteredPublicMems.map((m, idx) => {
                      const prof = one(m.profiles);
                      const subj = one(m.subject);
                      return (
                        <motion.article 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={m.id} 
                          className="bg-surface-container-lowest/80 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-outline-variant/10 hover:shadow-xl transition-all group"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {prof?.photo_url ? (
                                  <img src={prof.photo_url} alt="" className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                                ) : (
                                  <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center font-black text-primary shadow-inner">
                                    {(prof?.full_name ?? "?")[0]}
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-background">
                                   <span className="material-symbols-outlined text-[10px]">edit</span>
                                </div>
                              </div>
                              <div className="min-w-0">
                              <p className="font-black text-on-surface text-lg tracking-tight">{shortDisplayName(prof?.full_name)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                                    {subj?.full_name ? `→ Legacy for ${shortDisplayName(subj.full_name)}` : "Global Post"}
                                  </p>
                                  <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
                                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{timeAgo(m.created_at)}</p>
                                </div>
                              </div>
                            </div>
                            <StatusBadge status={m.status} />
                          </div>
                          
                          <div className="relative">
                            <span className="absolute -left-6 -top-4 text-7xl text-primary/10 serif leading-none font-black opacity-0 group-hover:opacity-100 transition-opacity">“</span>
                            <p className="text-on-surface leading-relaxed whitespace-pre-wrap font-medium text-xl italic relative z-10">
                              &ldquo;{m.content}&rdquo;
                            </p>
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* === RECEIVED TAB === */}
            {tab === "sent" && (
              <div className="max-w-4xl mx-auto px-4">
                {sentMemories.length === 0 ? (
                  <div className="text-center py-40 bg-surface-container-low/20 rounded-[3rem] border border-dashed border-outline-variant/20">
                    <span className="material-symbols-outlined text-6xl text-outline/20 mb-4 block">history_edu</span>
                    <p className="text-on-surface-variant font-black uppercase tracking-widest text-xs mb-2">No personal reflections yet</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">classmates will reach out soon</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sentMemories.map((m, idx) => {
                      const prof = one(m.profiles);
                      return (
                        <motion.article 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={m.id} 
                          className="bg-surface-container-lowest rounded-[2.5rem] p-10 border border-outline-variant/10 hover:shadow-2xl transition-all relative overflow-hidden group"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] pointer-events-none" />
                          
                          <div className="flex items-center gap-5 mb-8">
                            <div className="relative">
                              {prof?.photo_url ? (
                                <img src={prof.photo_url} alt="" className="w-16 h-16 rounded-full object-cover ring-4 ring-background shadow-lg" />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center font-black text-primary shadow-inner">
                                  {(prof?.full_name ?? "?")[0]}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center border-2 border-background shadow-md">
                                 <span className="material-symbols-outlined text-xs">favorite</span>
                              </div>
                            </div>
                            <div className="flex-grow">
                              <p className="font-black text-xl text-on-surface tracking-tighter">{shortDisplayName(prof?.full_name)}</p>
                              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">Reflected {timeAgo(m.created_at)}</p>
                            </div>
                            <StatusBadge status={m.status} />
                          </div>
                          
                          <p className="text-on-surface leading-relaxed whitespace-pre-wrap font-medium text-xl italic pr-12 group-hover:text-primary transition-colors duration-500">
                            &ldquo;{m.content}&rdquo;
                          </p>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
