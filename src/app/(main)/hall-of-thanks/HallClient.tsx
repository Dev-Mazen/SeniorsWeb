"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
    
    // Insert a message for each selected teacher
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
    }, 4000);
  }

  function toggleTeacher(t: Teacher) {
    setSelectedTeachers(prev => 
      prev.find(p => p.id === t.id) 
        ? prev.filter(p => p.id !== t.id) 
        : [...prev, t]
    );
  }

  function selectAllFiltered() {
    // Add all currently filtered teachers that aren't already selected
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

  // Reset page on search change
  useEffect(() => { setTeacherPage(1); }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-32">
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="serif text-5xl md:text-7xl font-black text-on-surface mb-6 leading-tight">
          Hall of <span className="text-primary italic">Thanks</span>
        </h1>
        <p className="text-on-surface-variant text-lg font-medium leading-relaxed">
          Behind every great graduating class are the educators who inspired, challenged, and guided them. Leave an anonymous note of gratitude to celebrate their impact.
        </p>
      </header>

      {/* Search and Filter Bar */}
      <div className="max-w-4xl mx-auto mb-16 space-y-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search teachers by name or subject (e.g. Math)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-outline transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 px-2">
          <button 
            onClick={selectAllFiltered}
            className="text-sm font-semibold px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-full transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">checklist_rtl</span>
            Select All Filtered
          </button>
          {selectedTeachers.length > 0 && (
            <button 
              onClick={() => setSelectedTeachers([])}
              className="text-sm font-semibold px-4 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
            >
              Clear ({selectedTeachers.length})
            </button>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      {selectedTeachers.length > 0 && (
        <div className="fixed bottom-20 md:bottom-0 left-0 right-0 z-50 p-4 md:pb-6 pointer-events-none flex justify-center">
          <div className="pointer-events-auto bg-stone-900/95 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl shadow-black/30 border border-white/10 flex items-center gap-5 max-w-lg w-full animate-in slide-in-from-bottom-4 duration-300">
            {/* Teacher avatars */}
            <div className="flex -space-x-3 flex-shrink-0">
              {selectedTeachers.slice(0, 4).map((t, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-stone-900 bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {t.photo_url ? (
                    <img src={t.photo_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-white font-bold text-sm">{t.name[0]}</span>
                  )}
                </div>
              ))}
              {selectedTeachers.length > 4 && (
                <div className="w-10 h-10 rounded-full border-2 border-stone-900 bg-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  +{selectedTeachers.length - 4}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? 's' : ''} selected</p>
              <p className="text-white/50 text-xs truncate">{selectedTeachers.map(t => t.name).join(', ')}</p>
            </div>
            <button 
              onClick={() => { setMessage(""); setSuccess(false); setError(""); setIsModalOpen(true); }}
              className="flex-shrink-0 sunset-gradient px-6 py-3 rounded-full text-white font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Write
            </button>
          </div>
        </div>
      )}

      {teachers.length === 0 ? (
        <div className="text-center py-32 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-6xl text-outline/30 block mb-4">volunteer_activism</span>
          <p className="text-on-surface-variant text-lg">No teachers have been added to the hall yet.</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          No teachers match your search.
        </div>
      ) : (
        <>
          {/* Page info */}
          <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
            <p className="text-sm text-on-surface-variant font-medium">
              Showing {(teacherPage - 1) * TEACHERS_PER_PAGE + 1}–{Math.min(teacherPage * TEACHERS_PER_PAGE, filteredTeachers.length)} of {filteredTeachers.length} teachers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {paginatedTeachers.map(teacher => {
              const approved = teacher.teacher_messages?.filter(m => m.status === "approved") ?? [];
              const isSelected = selectedTeachers.some(p => p.id === teacher.id);
              return (
                <div key={teacher.id} className={`group relative bg-surface-container-lowest rounded-3xl p-8 editorial-shadow border transition-all duration-500 hover:-translate-y-2 flex flex-col overflow-hidden cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/20 hover:border-primary/30'}`} onClick={() => toggleTeacher(teacher)}>
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Selection Checkbox indicator */}
                  <div className={`absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-outline/30'}`}>
                    {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </div>

                  <div className="flex items-start gap-5 mb-6 pr-8">
                    <div className="relative">
                      {teacher.photo_url ? (
                        <img src={teacher.photo_url} alt={teacher.name} className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-surface" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-lg border-2 border-surface">{teacher.name[0]}</div>
                      )}
                      <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-primary text-sm">local_library</span>
                      </span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="serif text-3xl font-black text-on-surface mb-1 group-hover:text-primary transition-colors">{teacher.name}</h3>
                      {teacher.subject && <span className="inline-block px-3 py-1 bg-surface-container-high rounded-full text-xs font-bold text-on-surface-variant uppercase tracking-wider">{teacher.subject}</span>}
                    </div>
                  </div>
                  
                  {teacher.bio && <p className="text-on-surface-variant text-sm leading-relaxed mb-6 italic border-l-2 border-primary/20 pl-4 py-1">"{teacher.bio}"</p>}
                  
                  {approved.length > 0 ? (
                    <div className="flex-1 relative mb-6 pointer-events-none">
                      <span className="material-symbols-outlined absolute -top-3 -left-2 text-4xl text-primary/10 -z-10 select-none">format_quote</span>
                      <div className="bg-surface-container-high/50 rounded-2xl p-5 space-y-4 max-h-48 overflow-y-auto custom-scrollbar border border-outline-variant/5">
                        {approved.map(m => (
                          <div key={m.id} className="text-on-surface text-sm leading-relaxed font-medium">"{m.content}"</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex" />
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTeacher(teacher); }}
                    className={`mt-auto w-full py-4 font-bold rounded-2xl transition-all text-sm flex items-center justify-center gap-2 group/btn ${isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'}`}
                  >
                    <span className="material-symbols-outlined text-lg group-hover/btn:scale-110 transition-transform">{isSelected ? 'check_circle' : 'add_circle'}</span>
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalTeacherPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => { setTeacherPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={teacherPage === 1}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalTeacherPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => { setTeacherPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${page === teacherPage ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setTeacherPage(p => Math.min(totalTeacherPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={teacherPage === totalTeacherPages}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
              >
                Next
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Message Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}>
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-xl editorial-shadow overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-surface-container-low px-8 py-6 flex items-center justify-between border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {selectedTeachers.slice(0, 3).map((teacher, idx) => (
                    <div key={idx} className="w-12 h-12 rounded-full border-2 border-surface bg-primary/10 flex flex-shrink-0 items-center justify-center overflow-hidden relative z-[1]">
                       {teacher.photo_url ? (
                         <img src={teacher.photo_url} className="w-full h-full object-cover" alt="" />
                       ) : (
                         <span className="text-lg font-bold text-primary">{teacher.name[0]}</span>
                       )}
                    </div>
                  ))}
                  {selectedTeachers.length > 3 && (
                    <div className="w-12 h-12 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-sm font-bold z-0 pl-3 pr-1">
                      +{selectedTeachers.length - 3}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="serif text-2xl font-black text-on-surface">Thank {selectedTeachers.length} Teacher{selectedTeachers.length !== 1 ? 's' : ''}</h2>
                  <p className="text-xs text-on-surface-variant font-medium">Batch Anonymous Message</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-on-surface">close</span>
              </button>
            </div>

            <div className="p-8">
              {success ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-green-600">done_all</span>
                  </div>
                  <h3 className="serif text-2xl font-black text-on-surface mb-2">Messages Sent</h3>
                  <p className="text-on-surface-variant">Your heartfelt notes have been safely submitted and are pending review. Thank you!</p>
                  <button onClick={() => setIsModalOpen(false)} className="mt-8 px-8 py-3 bg-surface-container-high font-bold rounded-full hover:bg-surface-container-highest transition-colors">Close</button>
                </div>
              ) : (
                <form onSubmit={sendMessage}>
                  <div className="relative mb-6">
                    <span className="material-symbols-outlined absolute top-4 left-4 text-outline text-xl">favorite</span>
                    <textarea
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/40 resize-none text-on-surface placeholder:text-outline/70 focus:outline-none min-h-[160px] text-lg font-serif italic custom-scrollbar"
                      placeholder="Write your heartfelt message here. This identical message will be sent to all selected teachers..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex items-start gap-3 bg-surface-container p-4 rounded-xl mb-8">
                    <span className="material-symbols-outlined text-on-surface-variant text-xl">info</span>
                    <p className="text-on-surface-variant text-xs leading-relaxed">
                      This message will be duplicated and sent <strong className="text-on-surface">completely anonymously</strong> to all <strong>{selectedTeachers.length}</strong> teachers you selected.
                    </p>
                  </div>

                  {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2"><span className="material-symbols-outlined">error</span> {error}</div>}
                  
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">Cancel</button>
                    <button type="submit" disabled={loading || !message.trim()} className="sunset-gradient px-8 py-3 rounded-full text-white font-bold disabled:opacity-50 hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                      <span className="material-symbols-outlined text-sm">send</span>
                      {loading ? "Sending..." : "Send Batch"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}