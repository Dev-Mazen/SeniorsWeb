"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Post = { id: string; content: string; media_url: string | null; created_at: string; profiles: { full_name: string | null; photo_url: string | null } | null };

const COLORS = [
  {
    bg: "bg-[#f2f8f2]",
    border: "border-t-4 border-[#c5d8c5]",
    textIcon: "text-[#5d735d]",
    textP: "text-on-surface",
    rotate: "-1.5deg"
  },
  {
    bg: "bg-surface-container-lowest",
    border: "",
    textIcon: "text-outline",
    textP: "text-on-surface",
    rotate: "1.2deg"
  },
  {
    bg: "bg-[#f6f2fc]",
    border: "border-b-8 border-[#e4daef]",
    textIcon: "text-[#5d54a4]",
    textP: "text-[#5d54a4]",
    rotate: "-0.8deg"
  },
  {
    bg: "bg-[#fff5f0]",
    border: "",
    textIcon: "text-[#802918]",
    textP: "text-[#802918]",
    rotate: "2deg"
  },
  {
    bg: "bg-[#f2f8f2]",
    border: "border-dotted border-t border-[#c5d8c5]",
    textIcon: "text-[#5d735d]",
    textP: "text-[#3e4d3e]",
    rotate: "0.5deg"
  }
];

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
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .wall-note {
            transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
            break-inside: avoid;
        }
        .wall-note:hover {
            transform: scale(1.02) rotate(0deg) !important;
            z-index: 10;
        }
        .paper-texture {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.03;
            pointer-events: none;
        }
      `}} />
      <div className="fixed inset-0 paper-texture z-0 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-32">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-background mb-4 italic">
            The Living Wall
          </h1>
          <p className="text-xl font-body text-on-surface-variant leading-relaxed">
            A collective archive of the moments that defined our four years. Scrawled, remembered, and curated for the Class of 2026.
          </p>
        </header>

        {/* Post form */}
        {wallEnabled ? (
          <form onSubmit={handlePost} className="max-w-2xl mx-auto bg-surface-container-lowest rounded-xl p-8 shadow-xl shadow-stone-900/5 mb-16 border border-outline-variant/20 relative z-20" style={{ transform: "rotate(-0.4deg)" }}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#802918]">Leave a Memory</span>
              <span className="material-symbols-outlined text-[#802918] text-lg">edit_note</span>
            </div>
            <textarea
              className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 resize-none text-on-surface placeholder:text-outline/60 focus:outline-none font-headline text-lg italic"
              rows={3}
              placeholder="Share a funny moment, quote, or anything worth remembering..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Submitted for review!</p>}
            <div className="flex justify-between items-center mt-4">
              <p className="text-on-surface-variant text-xs font-medium">Posts require admin approval before appearing.</p>
              <button type="submit" disabled={loading || !content.trim()} className="bg-gradient-to-br from-primary to-primary-container px-6 py-2 rounded-full text-white font-bold disabled:opacity-50 hover:scale-[1.03] transition-transform flex items-center gap-2 shadow-md">
                <span className="material-symbols-outlined text-sm">send</span>
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-2xl mx-auto bg-surface-container-high rounded-xl p-8 text-center mb-16 shadow-xl shadow-stone-900/5">
            <span className="material-symbols-outlined text-4xl text-outline mb-3 block">lock</span>
            <p className="text-on-surface-variant font-medium">Wall posts are currently disabled by the admin.</p>
          </div>
        )}

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 relative z-10">
            <span className="material-symbols-outlined text-6xl text-outline/40">forum</span>
            <p className="text-on-surface-variant mt-4 font-medium">No posts yet. Be the first to leave your mark!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {posts.map((post, idx) => {
              const styleIdx = idx % COLORS.length;
              const { bg, border, textIcon, textP, rotate } = COLORS[styleIdx];
              
              const isMedia = post.media_url ? true : false;
              
              return (
                <div 
                  key={post.id} 
                  className={`wall-note ${bg} ${border} p-8 rounded-lg shadow-xl shadow-stone-900/5 relative`}
                  style={{ transform: `rotate(${rotate})` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${textIcon}`}>Memory</span>
                    <span className={`material-symbols-outlined ${textIcon} text-lg`}>push_pin</span>
                  </div>
                  
                  {isMedia && (
                    <div className="relative mb-4 overflow-hidden rounded-md group">
                      <img className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110" src={post.media_url!} alt="attached media" />
                      <div className="absolute inset-0 bg-primary/10 mix-blend-multiply pointer-events-none"></div>
                    </div>
                  )}

                  <p className={`font-headline text-2xl leading-snug ${textP} italic mb-6`}>
                    "{post.content}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    {post.profiles?.photo_url ? (
                      <img src={post.profiles.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                        {(post.profiles?.full_name ?? "?")[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-on-surface">{post.profiles?.full_name ?? "Anonymous"}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{timeAgo(post.created_at)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}