"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Post = { id: string; content: string; media_url: string | null; created_at: string; profiles: { full_name: string | null; photo_url: string | null } | null };

export default function WallClient({ posts, wallEnabled, userId }: { posts: Post[]; wallEnabled: boolean; userId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true); setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("wall_posts").insert({ author_id: userId, content });
    if (err) { setError(err.message); setLoading(false); return; }
    setContent(""); setSuccess(true); setLoading(false);
    setTimeout(() => setSuccess(false), 4000);
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

  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-32">
      <header className="mb-12">
        <h1 className="serif text-6xl font-black text-on-surface mb-3">The <span className="text-primary italic">Wall</span></h1>
        <p className="text-on-surface-variant text-lg">Leave your mark. Community posts, funny moments, and shared memories.</p>
      </header>

      {/* Post form */}
      {wallEnabled ? (
        <form onSubmit={handlePost} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow mb-12 border border-outline-variant/20">
          <textarea
            className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 resize-none text-on-surface placeholder:text-outline/60"
            rows={4}
            placeholder="Share a funny moment, quote, or anything worth remembering..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Submitted for review!</p>}
          <div className="flex justify-between items-center mt-4">
            <p className="text-on-surface-variant text-xs">Posts require admin approval before appearing.</p>
            <button type="submit" disabled={loading || !content.trim()} className="sunset-gradient px-8 py-3 rounded-full text-white font-bold disabled:opacity-50 hover:scale-105 transition-transform flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">send</span>
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface-container-high rounded-xl p-8 text-center mb-12">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 block">lock</span>
          <p className="text-on-surface-variant font-medium">Wall posts are currently disabled by the admin.</p>
        </div>
      )}

      {/* Posts feed */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline/40">forum</span>
          <p className="text-on-surface-variant mt-4">No posts yet. Be the first to leave your mark!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <article key={post.id} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow border border-outline-variant/10 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-3 mb-4">
                {post.profiles?.photo_url ? (
                  <img src={post.profiles.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                    {(post.profiles?.full_name ?? "?")[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-on-surface">{post.profiles?.full_name ?? "Anonymous"}</p>
                  <p className="text-xs text-on-surface-variant">{timeAgo(post.created_at)}</p>
                </div>
              </div>
              <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}