"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Teacher = { id: string; name: string; subject: string | null; photo_url: string | null; bio: string | null; teacher_messages: { id: string; content: string; status: string }[] };

export default function HallClient({ teachers, userId }: { teachers: Teacher[]; userId: string }) {
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (selectedTeachers.length === 0 || !message.trim()) return;
    setLoading(true); setError("");
    const supabase = createClient();
    
    const payloads = selectedTeachers.map(t => ({
      teacher_id: t.id,
      content: message,
      author_id: userId,
      is_anonymous: true
    }));

    const { error: err } = await supabase.from("teacher_messages").insert(payloads);
    if (err) { setError(err.message); setLoading(false); return; }
    
    setMessage(""); setSuccess(true); setLoading(false);
    setTimeout(() => {
      setSuccess(false);
      setIsModalOpen(false);
      setSelectedTeachers([]);
    }, 3000);
  }

  function toggleTeacher(t: Teacher) {
    setSelectedTeachers(prev => 
      prev.find(p => p.id === t.id) 
        ? prev.filter(p => p.id !== t.id) 
        : [...prev, t]
    );
  }

  function selectAllFiltered() {
    setSelectedTeachers(prev => {
      const newSelected = [...prev];
      filteredTeachers.forEach(t => {
        if (!newSelected.find(p => p.id === t.id)) {
          newSelected.push(t);
        }
      });
      return newSelected;
    });
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const TEACHERS_PER_PAGE = 12;

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalTeacherPages = Math.ceil(filteredTeachers.length / TEACHERS_PER_PAGE);
  const paginatedTeachers = filteredTeachers.slice((teacherPage - 1) * TEACHERS_PER_PAGE, teacherPage * TEACHERS_PER_PAGE);

  useEffect(() => { setTeacherPage(1); }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-16 pb-32 md:px-8">
      <header className="mb-20 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8"
        >
          <span className="material-symbols-outlined text-sm">school</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Faculty Archive</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="serif text-6xl md:text-8xl font-black text-on-surface mb-8 tracking-tighter leading-[0.85]"
        >
          Hall of <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary italic">Gratitude.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant text-xl font-medium leading-relaxed max-w-2xl mx-auto"
        >
          To the architects of our future. Leave an anonymous note of thanks to the educators who shaped our legacy.
        </motion.p>
      </header>

      {/* Search and Selection Tools */}
      <div className="max-w-4xl mx-auto mb-20 space-y-6">
        <div className="section-shell rounded-full p-1 shadow-2xl group/search overflow-hidden">
          <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-full relative">
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within/search:text-primary transition-colors">person_search</span>
            <input 
              type="text" 
              placeholder="Locate teacher or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-transparent border-none focus:ring-0 text-on-surface font-medium text-lg placeholder:text-on-surface-variant/30 transition-all focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button 
            onClick={selectAllFiltered}
            className="group flex items-center gap-3 px-8 py-3 rounded-full bg-surface-container-high/40 hover:bg-surface-container-high text-on-surface transition-all border border-outline-variant/10 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] text-primary/60 group-hover:text-primary transition-colors">checklist_rtl</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Select All</span>
          </button>
          
          <AnimatePresence>
            {selectedTeachers.length > 0 && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSelectedTeachers([])}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clear Selection ({selectedTeachers.length})</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedTeachers.map((teacher, idx) => {
          const approved = teacher.teacher_messages?.filter(m => m.status === "approved") ?? [];
          const isSelected = selectedTeachers.some(p => p.id === teacher.id);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={teacher.id} 
              className="group/card relative cursor-pointer"
              onClick={() => toggleTeacher(teacher)}
            >
              <div className={`absolute -inset-[1px] rounded-[2.5rem] bg-gradient-to-br from-primary/30 to-secondary/30 opacity-0 group-hover/card:opacity-100 transition-all blur-[2px] ${isSelected ? 'opacity-100' : ''}`} />
              
              <div className="section-shell relative h-full rounded-[2.5rem] p-1 overflow-hidden">
                <div className="bg-surface-container-lowest/80 backdrop-blur-3xl rounded-[2.3rem] p-8 h-full flex flex-col">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="relative flex-shrink-0">
                      {teacher.photo_url ? (
                        <img src={teacher.photo_url} alt={teacher.name} className="w-20 h-20 rounded-3xl object-cover shadow-2xl ring-4 ring-background/50 group-hover/card:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-20 h-20 rounded-3xl bg-surface-container-highest flex items-center justify-center text-4xl font-black text-primary shadow-inner">
                          {teacher.name[0]}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50">
                          <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="serif text-3xl font-black text-on-surface leading-none mb-2 tracking-tighter truncate group-hover/card:text-primary transition-colors">
                        {teacher.name}
                      </h3>
                      <div className="inline-flex px-3 py-1 rounded-lg bg-surface-container-high/60 border border-outline-variant/10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                          {teacher.subject || "Faculty"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {teacher.bio && (
                    <p className="text-on-surface-variant/80 text-sm italic font-medium leading-relaxed mb-8 line-clamp-3">
                      "{teacher.bio}"
                    </p>
                  )}

                  {approved.length > 0 && (
                    <div className="mt-auto pt-6 border-t border-outline-variant/5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-sm text-primary">chat_bubble</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">Legacy Messages</span>
                      </div>
                      <div className="space-y-4 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                        {approved.map(m => (
                          <p key={m.id} className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-high/30 p-3 rounded-2xl border border-outline-variant/5 italic">
                            "{m.content}"
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <button className={`mt-8 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${isSelected ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-surface-container-high/60 text-on-surface hover:bg-surface-container-high'}`}>
                    <span className="material-symbols-outlined text-base">
                      {isSelected ? 'task_alt' : 'add_circle'}
                    </span>
                    {isSelected ? 'Teacher Selected' : 'Mark for Gratitude'}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        </div>

      {/* Pagination */}
      {totalTeacherPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-20">
          <button
            onClick={() => { setTeacherPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={teacherPage === 1}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container-high/40 hover:bg-surface-container-high text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-outline-variant/10 shadow-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container-low/50 backdrop-blur-md border border-outline-variant/10">
            {Array.from({ length: totalTeacherPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => { setTeacherPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-full text-xs font-black transition-all ${page === teacherPage ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setTeacherPage(p => Math.min(totalTeacherPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={teacherPage === totalTeacherPages}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-surface-container-high/40 hover:bg-surface-container-high text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-outline-variant/10 shadow-sm"
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <AnimatePresence>
        {selectedTeachers.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-4 right-4 z-50 flex justify-center pointer-events-none"
          >
            <div className="pointer-events-auto max-w-2xl w-full section-shell rounded-[2.5rem] p-1 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
              <div className="bg-on-surface/90 backdrop-blur-3xl rounded-[2.3rem] px-8 py-5 flex items-center gap-6">
                <div className="flex -space-x-3 overflow-hidden">
                  {selectedTeachers.slice(0, 4).map((t, i) => (
                    <div key={i} className="w-12 h-12 rounded-full ring-4 ring-on-surface bg-surface-container-highest flex items-center justify-center overflow-hidden flex-shrink-0">
                      {t.photo_url ? (
                        <img src={t.photo_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-on-surface font-black text-xs">{t.name[0]}</span>
                      )}
                    </div>
                  ))}
                  {selectedTeachers.length > 4 && (
                    <div className="w-12 h-12 rounded-full ring-4 ring-on-surface bg-surface-container-high flex items-center justify-center text-on-surface text-[10px] font-black flex-shrink-0">
                      +{selectedTeachers.length - 4}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-background font-black text-xs uppercase tracking-widest">{selectedTeachers.length} Recipient{selectedTeachers.length !== 1 ? 's' : ''}</p>
                  <p className="text-background/50 text-[10px] font-medium truncate mt-0.5">{selectedTeachers.map(t => t.name).join(', ')}</p>
                </div>

                <button 
                  onClick={() => { setMessage(""); setSuccess(false); setError(""); setIsModalOpen(true); }}
                  className="group flex-shrink-0 bg-background text-on-surface px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                  Craft Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl section-shell rounded-[3rem] p-1 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-surface-container-lowest/90 backdrop-blur-3xl rounded-[2.8rem] p-10 md:p-14">
                {success ? (
                  <div className="text-center py-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-primary/20">
                      <span className="material-symbols-outlined text-5xl text-primary">celebration</span>
                    </div>
                    <h3 className="serif text-4xl font-black text-on-surface mb-4 tracking-tighter">Gratitude Recorded.</h3>
                    <p className="text-on-surface-variant font-medium text-lg leading-relaxed">Your messages have been securely archived and are awaiting the release sequence.</p>
                    <button 
                      onClick={() => setIsModalOpen(false)} 
                      className="mt-12 px-12 py-5 bg-on-surface text-background font-black text-[10px] uppercase tracking-[0.3em] rounded-full hover:shadow-2xl transition-all"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className="space-y-10">
                    <header className="flex items-center justify-between">
                      <div>
                        <h2 className="serif text-4xl font-black text-on-surface tracking-tighter leading-none mb-3">Compose Note.</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60">Sending to {selectedTeachers.length} educators</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 rounded-full bg-surface-container-high/40 hover:bg-surface-container-high transition-colors flex items-center justify-center border border-outline-variant/10 group">
                        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">close</span>
                      </button>
                    </header>

                    <div className="relative group/text">
                      <textarea
                        className="w-full p-10 bg-surface-container-high/40 focus:bg-surface-container-high rounded-[2.5rem] border border-outline-variant/10 focus:border-primary/30 transition-all resize-none text-on-surface font-serif italic text-2xl placeholder:text-on-surface-variant/20 focus:outline-none min-h-[280px] leading-relaxed custom-scrollbar"
                        placeholder="Express your gratitude..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary">security</span>
                      <p className="text-xs font-medium text-primary leading-relaxed">
                        Class of 2026 Privacy: This message will be delivered <strong className="font-black">anonymously</strong>.
                      </p>
                    </div>

                    {error && <p className="text-red-500 text-xs font-black uppercase tracking-widest text-center">{error}</p>}
                    
                    <div className="flex gap-4">
                      <button 
                        type="submit" 
                        disabled={loading || !message.trim()} 
                        className="flex-1 bg-on-surface text-background px-12 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.3em] disabled:opacity-30 hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <span className="material-symbols-outlined">{loading ? "sync" : "send"}</span>
                        {loading ? "Recording..." : "Archive Appreciation"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );}

