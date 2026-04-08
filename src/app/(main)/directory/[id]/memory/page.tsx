"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

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
  const [sendToAll, setSendToAll] = useState(false);
  
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
    
    if (sendToAll) {
      const { error: err } = await supabase.from("wall_posts").insert({
        author_id: user.id,
        content,
      });
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { error: err } = await supabase.from("senior_memories").insert({
        subject_id: subjectId,
        author_id: user.id,
        content,
      });
      if (err) { setError(err.message); setLoading(false); return; }
    }
    
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

  if (success) return (
    <div className="max-w-xl mx-auto px-6 pt-16 pb-32 text-center">
      <span className="material-symbols-outlined text-5xl text-primary mb-4 block">check_circle</span>
      <h2 className="serif text-2xl font-black mb-2">Memory Submitted!</h2>
      <p className="text-on-surface-variant mb-6">Pending admin approval. It will appear once approved.</p>
      <button onClick={() => { setSuccess(false); setContent(""); }} className="sunset-gradient px-8 py-3 rounded-full text-white font-bold">Write Another</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 pt-16 pb-32 grid grid-cols-1 md:grid-cols-12 gap-12">
      <div className="md:col-span-7 space-y-12">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
          <div className="flex items-center gap-4 mb-2">
            {subjectProfile?.photo_url ? (
              <img src={subjectProfile.photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-surface-container" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-2xl">
                {(subjectProfile?.full_name ?? "?")[0]}
              </div>
            )}
            <h1 className="serif text-4xl font-black text-on-surface">Memory for {subjectProfile?.full_name?.split(" ")[0] || "Student"}</h1>
          </div>
          <p className="text-on-surface-variant mb-10 md:ml-20">Leave a legacy. Share a favorite moment.</p>
          
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow border border-outline-variant/20">
            <textarea
              className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/30 resize-none text-on-surface mb-4 placeholder:text-outline/60"
              rows={5}
              placeholder={`Share a memory with ${subjectProfile?.full_name?.split(" ")[0] || "them"}...`}
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            
            <label className="flex items-start gap-3 p-3 mt-4 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer mb-2 border border-outline-variant/20 bg-surface">
              <input 
                type="checkbox" 
                checked={sendToAll} 
                onChange={(e) => setSendToAll(e.target.checked)} 
                className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary/30 mt-0.5"
              />
              <div>
                <p className="font-bold text-sm text-on-surface">Post to the Global Wall instead</p>
                <p className="text-xs text-on-surface-variant">Check this box to share to all students on the Global Wall. If unchecked, this memory is privately sent to the student for their personal page.</p>
              </div>
            </label>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button type="submit" disabled={loading || !content.trim()} className="mt-6 w-full sunset-gradient py-4 rounded-full text-white font-bold disabled:opacity-50 hover:scale-[1.02] transition-transform shadow-md">
              {loading ? "Submitting..." : (sendToAll ? "Post to Global Wall" : "Submit Memory")}
            </button>
          </form>
        </div>

        {/* Existing Memories */}
        <div className="space-y-6">
          <h2 className="serif text-2xl font-black text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span> 
            Memories Received
          </h2>
          {memories.length === 0 ? (
            <div className="bg-surface-container-high/50 p-8 rounded-xl text-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-4xl text-outline/40 block mb-2">history_edu</span>
              <p className="text-on-surface-variant text-sm">No memories gathered yet.</p>
            </div>
          ) : (
            memories.map(m => {
              const prof = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
              return (
              <article key={m.id} className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-4">
                  {prof?.photo_url ? (
                    <img src={prof.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                      {(prof?.full_name ?? "?")[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-on-surface">{prof?.full_name ?? "Anonymous"}</p>
                    <p className="text-xs text-on-surface-variant">{timeAgo(m.created_at)}</p>
                  </div>
                </div>
                <p className="text-on-surface leading-relaxed text-sm whitespace-pre-wrap">{m.content}</p>
              </article>
              );
            })
          )}
        </div>
      </div>

      <div className="md:col-span-5">
        <div className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow sticky top-24 border border-outline-variant/20">
          <h3 className="serif text-xl font-black text-on-surface mb-2">Find Someone Else</h3>
          <p className="text-on-surface-variant text-sm mb-6">Want to write a memory for another classmate?</p>
          
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-3.5 text-outline text-lg">search</span>
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-3 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/30 text-sm placeholder:text-outline/70 focus:outline-none"
              placeholder="Search students by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {searchQuery && filteredStudents.length === 0 && (
              <p className="text-center text-sm text-on-surface-variant py-4">No students found.</p>
            )}
            {filteredStudents.map(student => (
              <Link key={student.id} href={`/directory/${student.id}/memory`}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/20">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary">
                      {(student.full_name ?? "?")[0]}
                    </div>
                  )}
                  <p className="font-bold text-sm text-on-surface truncate">{student.full_name}</p>
                  <span className="material-symbols-outlined ml-auto text-outline text-sm">chevron_right</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}