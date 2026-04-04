"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SubmitMemoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not logged in"); setLoading(false); return; }
    const { error: err } = await supabase.from("senior_memories").insert({
      subject_id: params.id,
      author_id: user.id,
      content,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  }

  if (success) return (
    <div className="max-w-xl mx-auto px-6 pt-16 pb-32 text-center">
      <span className="material-symbols-outlined text-5xl text-primary mb-4 block">check_circle</span>
      <h2 className="serif text-2xl font-black mb-2">Memory Submitted!</h2>
      <p className="text-on-surface-variant mb-6">Pending admin approval.</p>
      <button onClick={() => router.push("/directory")} className="sunset-gradient px-8 py-3 rounded-full text-white font-bold">Back</button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-6 pt-16 pb-32">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8">
        <span className="material-symbols-outlined">arrow_back</span> Back
      </button>
      <h1 className="serif text-4xl font-black text-on-surface mb-2">Submit a Memory</h1>
      <p className="text-on-surface-variant mb-10">Reviewed by admin before it appears.</p>
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow">
        <textarea
          className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/30 resize-none text-on-surface"
          rows={6}
          placeholder="Share a memory about this classmate..."
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button type="submit" disabled={loading} className="mt-6 w-full sunset-gradient py-4 rounded-full text-white font-bold disabled:opacity-50">
          {loading ? "Submitting..." : "Submit Memory"}
        </button>
      </form>
    </div>
  );
}