"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Teacher = { id: string; name: string; subject: string | null; photo_url: string | null; bio: string | null; teacher_messages: { id: string; content: string; status: string }[] };

export default function HallClient({ teachers, userId }: { teachers: Teacher[]; userId: string }) {
  const [selected, setSelected] = useState<Teacher | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !message.trim()) return;
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("teacher_messages").insert({ teacher_id: selected.id, content: message, author_id: userId, is_anonymous: true });
    if (err) { setError(err.message); setLoading(false); return; }
    setMessage(""); setSuccess(true); setLoading(false);
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-32">
      <header className="mb-12">
        <h1 className="serif text-6xl font-black text-on-surface mb-3">Hall of <span className="text-primary italic">Thanks</span></h1>
        <p className="text-on-surface-variant text-lg">Celebrate the teachers who shaped our journey. Messages are anonymous and moderated.</p>
      </header>

      {teachers.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline/40">volunteer_activism</span>
          <p className="text-on-surface-variant mt-4">No teachers added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map(teacher => {
            const approved = teacher.teacher_messages?.filter(m => m.status === "approved") ?? [];
            return (
              <div key={teacher.id} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow hover:-translate-y-2 transition-all duration-500 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  {teacher.photo_url ? (
                    <img src={teacher.photo_url} alt={teacher.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary">{teacher.name[0]}</div>
                  )}
                  <div>
                    <h3 className="font-black text-on-surface">{teacher.name}</h3>
                    {teacher.subject && <p className="text-on-surface-variant text-sm">{teacher.subject}</p>}
                  </div>
                </div>
                {teacher.bio && <p className="text-on-surface-variant text-sm leading-relaxed mb-4 italic">{teacher.bio}</p>}
                {approved.length > 0 && (
                  <div className="bg-surface-container-low rounded-xl p-4 mb-4 space-y-3 max-h-40 overflow-y-auto no-scrollbar">
                    {approved.map(m => (
                      <p key={m.id} className="text-on-surface text-sm leading-relaxed border-l-2 border-primary/30 pl-3">{m.content}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setSelected(teacher); setMessage(""); setSuccess(false); }}
                  className="mt-auto w-full py-3 sunset-gradient text-white font-bold rounded-full hover:scale-105 transition-transform text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                  Send Appreciation
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-surface rounded-2xl p-8 w-full max-w-lg editorial-shadow" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">volunteer_activism</span>
              <h2 className="serif text-xl font-black">Message to {selected.name}</h2>
              <button onClick={() => setSelected(null)} className="ml-auto p-2 hover:bg-surface-container rounded-full"><span className="material-symbols-outlined">close</span></button>
            </div>
            {success ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-5xl text-primary block mb-3">check_circle</span>
                <p className="font-bold">Message sent! Pending admin approval.</p>
              </div>
            ) : (
              <form onSubmit={sendMessage}>
                <textarea
                  className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 resize-none mb-4"
                  rows={5}
                  placeholder="Write your heartfelt message... (sent anonymously)"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
                <p className="text-on-surface-variant text-xs mb-4">Your message is sent anonymously and requires admin approval.</p>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <button type="submit" disabled={loading} className="w-full sunset-gradient py-4 rounded-full text-white font-bold disabled:opacity-50 hover:scale-105 transition-transform">
                  {loading ? "Sending..." : "Send Anonymously"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}