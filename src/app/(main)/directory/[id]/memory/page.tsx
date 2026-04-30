"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Profile = { id: string; full_name: string | null; photo_url: string | null };
type Memory = { id: string; content: string; created_at: string; profiles: Profile | null };

export default function SubmitMemoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const subjectId = params?.id;
  
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<Profile[]>([]);
  const [subjectProfile, setSubjectProfile] = useState<Profile | null>(null);
  
  useEffect(() => {
    if (!subjectId) return;
    const fetchMemories = async () => {
      const supabase = createClient();
      
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", subjectId).single();
      if (profile) setSubjectProfile(profile);

      const { data: mems } = await supabase
        .from("senior_memories")
        .select(`
          id, content, created_at,
          profiles:author_id(id, full_name, photo_url)
        `)
        .eq("subject_id", subjectId)
        .order("created_at", { ascending: false });
        
      if (mems) {
         setMemories(mems as any);
      }
      
      const { data: allStudents } = await supabase.from("profiles").select("id, full_name, photo_url").limit(300);
      if (allStudents) setStudents(allStudents);
    };
    fetchMemories();
  }, [subjectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not logged in"); setLoading(false); return; }
    
    const { error: err } = await supabase.from("senior_memories").insert({
      subject_id: subjectId,
      author_id: user.id,
      content,
      is_private: isPrivate,
    });
    
    if (err) { setError(err.message); setLoading(false); return; }
    
    setSuccess(true);
    setLoading(false);
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

  const filteredStudents = students.filter(s => 
    searchQuery && s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) && s.id !== subjectId
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-16 md:px-8">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-xl mx-auto px-6 py-20 text-center bg-surface-container-low/30 backdrop-blur-3xl rounded-[3rem] border border-outline-variant/10 shadow-2xl"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20">
              <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
            </div>
            <h2 className="serif text-4xl font-black mb-4 tracking-tighter text-on-surface">Memory Archived.</h2>
            <p className="text-on-surface-variant font-medium mb-10">Your reflection has been sent for moderation. It will join the collective legacy soon.</p>
            <button 
              onClick={() => { setSuccess(false); setContent(""); }} 
              className="w-full bg-on-surface text-background px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-on-surface/90 transition-all shadow-lg active:scale-95"
            >
              Write Another Reflection
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12"
          >
            {/* Main Column */}
            <div className="lg:col-span-7 space-y-12">
              <header className="relative">
                <button 
                  onClick={() => router.back()} 
                  className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60 hover:text-primary transition-colors mb-8"
                >
                  <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  Return to Registry
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    {subjectProfile?.photo_url ? (
                      <img src={subjectProfile.photo_url} alt="" className="w-24 h-24 rounded-full object-cover ring-4 ring-background shadow-2xl relative z-10" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center font-black text-primary text-4xl shadow-inner relative z-10">
                        {(subjectProfile?.full_name ?? "?")[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="serif text-5xl md:text-6xl font-black text-on-surface tracking-tighter leading-[0.9]">
                      Legacy for <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary italic">{subjectProfile?.full_name?.split(" ")[0] || "Student"}.</span>
                    </h1>
                    <p className="text-on-surface-variant/60 text-[10px] font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                       <span className="w-2 h-[1px] bg-primary/40" /> Contribute to their archive
                    </p>
                  </div>
                </div>
              </header>
              
              <section className="section-shell rounded-[2.5rem] p-1 md:p-2 shadow-2xl overflow-hidden group/form">
                <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-[2.3rem] p-8 md:p-10">
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="w-full p-8 bg-surface-container-high/40 rounded-[2rem] border border-outline-variant/10 focus:border-primary/30 focus:bg-surface-container-high focus:ring-4 focus:ring-primary/5 transition-all resize-none text-on-surface font-medium text-lg placeholder:text-on-surface-variant/30 focus:outline-none min-h-[240px]"
                      placeholder={`Recall a moment with ${subjectProfile?.full_name?.split(" ")[0] || "them"}...`}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      required
                    />
                    
                    <div className="mt-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                      <label className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-surface-container-high/40 hover:bg-surface-container-high transition-all cursor-pointer border border-outline-variant/10 group/check">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={isPrivate} 
                            onChange={(e) => setIsPrivate(e.target.checked)} 
                            className="peer appearance-none w-6 h-6 rounded-lg border-2 border-outline-variant group-hover/check:border-primary transition-all checked:bg-primary checked:border-primary"
                          />
                          <span className="material-symbols-outlined text-white text-[16px] absolute opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-[10px] uppercase tracking-widest text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">lock</span>
                            Confidential Entry
                          </p>
                          <p className="text-[9px] text-on-surface-variant/60 font-medium mt-0.5 truncate">Visible only to the recipient</p>
                        </div>
                      </label>

                      {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest">{error}</p>}
                      
                      <button 
                        type="submit" 
                        disabled={loading || !content.trim()} 
                        className="group/submit relative overflow-hidden bg-on-surface text-background px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] disabled:opacity-30 hover:shadow-xl hover:shadow-primary/10 transition-all flex items-center justify-center gap-3 active:scale-95 w-full md:w-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000" />
                        <span className="material-symbols-outlined text-lg">{loading ? "sync" : "send"}</span>
                        {loading ? "Recording..." : "Record Memory"}
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Existing Memories */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2 px-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <h2 className="serif text-2xl font-black text-on-surface tracking-tighter">
                    Gathered Reflections
                  </h2>
                </div>
                
                {memories.length === 0 ? (
                  <div className="bg-surface-container-low/20 p-16 rounded-[2.5rem] text-center border border-dashed border-outline-variant/20">
                    <span className="material-symbols-outlined text-5xl text-outline/20 block mb-4">history_edu</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">No entries recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {memories.map((m, idx) => {
                      const prof = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                      return (
                        <motion.article 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={m.id} 
                          className="bg-surface-container-lowest shadow-sm p-8 rounded-[2rem] border border-outline-variant/10 hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-center gap-4 mb-6">
                            {prof?.photo_url ? (
                              <img src={prof.photo_url} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-md" />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center font-black text-primary shadow-inner">
                                {(prof?.full_name ?? "?")[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-black text-on-surface tracking-tight">{prof?.full_name ?? "Anonymous"}</p>
                              <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">{timeAgo(m.created_at)}</p>
                            </div>
                          </div>
                          <p className="text-on-surface-variant leading-relaxed text-lg italic group-hover:text-on-surface transition-colors">
                            &ldquo;{m.content}&rdquo;
                          </p>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-5">
              <aside className="sticky top-24 space-y-6">
                <div className="section-shell rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
                  <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-[2.3rem] p-8">
                    <h3 className="serif text-2xl font-black text-on-surface mb-2 tracking-tighter">Alternative Entry</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-8">Redirect to another archive</p>
                    
                    <div className="relative mb-8 group/search">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within/search:text-primary transition-colors">search</span>
                      <input 
                        type="text" 
                        className="w-full pl-12 pr-6 py-4 bg-surface-container-high/40 focus:bg-surface-container-high rounded-full border border-outline-variant/10 focus:border-primary/30 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        placeholder="Identify student..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                      {searchQuery && filteredStudents.length === 0 && (
                        <div className="py-12 text-center">
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">No identity matches found</p>
                        </div>
                      )}
                      {filteredStudents.map(student => (
                        <Link key={student.id} href={`/directory/${student.id}/memory`}>
                          <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-high/60 transition-all cursor-pointer group/item border border-transparent hover:border-outline-variant/10">
                            {student.photo_url ? (
                              <img src={student.photo_url} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm group-hover/item:scale-110 transition-transform" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-black text-primary text-xs shadow-inner">
                                {(student.full_name ?? "?")[0]}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-black text-sm text-on-surface truncate tracking-tight">{student.full_name}</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Open Profile</p>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-outline/20 group-hover/item:text-primary transition-colors text-sm">north_east</span>
                          </div>
                        </Link>
                      ))}
                      {!searchQuery && (
                        <div className="py-20 text-center opacity-30">
                           <span className="material-symbols-outlined text-4xl block mb-2">person_search</span>
                           <p className="text-[10px] font-black uppercase tracking-widest">Input name to start search</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
                   <div className="flex items-center gap-3 mb-4">
                     <span className="material-symbols-outlined text-primary">security</span>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Moderation Policy</p>
                   </div>
                   <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
                     Every reflection is moderated to ensure the archive remains a professional and respectful legacy for all classmates.
                   </p>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}