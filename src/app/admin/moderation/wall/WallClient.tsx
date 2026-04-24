"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WallPost = {
  id: string;
  author_id: string;
  content: string;
  media_url: string | null;
  status: string;
  created_at: string;
  profiles: { full_name: string | null, nickname: string | null };
};

const STICKY_COLORS = [
  "bg-yellow-200 text-yellow-900 border-yellow-300",
  "bg-blue-200 text-blue-900 border-blue-300",
  "bg-pink-200 text-pink-900 border-pink-300",
  "bg-green-200 text-green-900 border-green-300",
] as const;

export default function WallClient({ initialPosts }: { initialPosts: WallPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [pinned, setPinned] = useState<Set<string>>(new Set());

  const filtered = posts.filter(p => p.status === filter);

  async function setStatus(id: string, newStatus: string) {
    setLoadingAction(id);
    const supabase = createClient();
    await supabase.from("wall_posts").update({ status: newStatus }).eq("id", id);
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, status: newStatus } : p)));
    setLoadingAction(null);
  }

  function togglePin(id: string) {
    const next = new Set(pinned);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setPinned(next);
  }

  // Very simple algorithm to simulate "Trending Funny Moments" based on text length and exclamation marks
  const trending = [...posts]
    .filter(p => p.status === "pending" || p.status === "approved")
    .filter(p => p.content.includes("!") || p.content.includes("😂") || p.content.length > 50)
    .slice(0, 3);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-outline-variant/20 pb-8">
        <div>
          <h2 className="text-4xl font-bold text-on-surface serif tracking-tight">Chaos Board Moderation</h2>
          <p className="text-on-surface-variant font-medium mt-1">Review sticky notes, confessions, and shoutouts.</p>
        </div>
        <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20">
          {(["pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full text-xs font-bold capitalize transition-colors flex items-center gap-2 ${filter === f ? "bg-stone-900 text-white shadow-xl" : "text-on-surface-variant hover:bg-surface-variant"}`}
            >
              {f === "pending" && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Auto Trending Section (Conceptual PRD Feature) */}
      {filter === "pending" && trending.length > 0 && (
        <div className="mb-10 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 p-6 rounded-3xl">
          <h3 className="serif text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-600">trending_up</span> 
            Trending Submissions (Algorithmic)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trending.map((post, idx) => (
              <div key={"trend-" + post.id} className="bg-white/60 p-4 rounded-xl border border-orange-200 shadow-sm flex flex-col justify-between">
                <p className="text-sm font-medium text-amber-950 mb-3 line-clamp-3">"{post.content}"</p>
                <div className="flex justify-between items-center mt-auto">
                   <span className="text-xs font-bold text-orange-600">— {post.profiles?.nickname ?? post.profiles?.full_name}</span>
                   <button onClick={() => setStatus(post.id, "approved")} className="px-3 py-1 bg-orange-600 text-white text-[10px] font-black rounded uppercase hover:bg-orange-700 transition">Approve Fast</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Note Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center">
             <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 opacity-40">filter_none</span>
             <h3 className="text-xl font-bold text-on-surface-variant">No notes found</h3>
          </div>
        )}
        {filtered.map((post, idx) => {
          const colorClass = STICKY_COLORS[idx % STICKY_COLORS.length];
          const isPinned = pinned.has(post.id);
          
          return (
            <div key={post.id} className={`group relative aspect-square p-6 shadow-sm border editorial-shadow rounded-bl-3xl flex flex-col transition-all hover:-translate-y-1 ${colorClass}`}>
              
               {/* Pin/Unpin */}
               {filter === "approved" && (
                 <button onClick={() => togglePin(post.id)} className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all ${isPinned ? "bg-red-500 text-white shadow-red-500/40" : "bg-white text-on-surface-variant hover:bg-red-50"}`} title="Pin Note">
                   <span className="material-symbols-outlined text-[1rem]">push_pin</span>
                 </button>
               )}

               <div className="flex-1 overflow-y-auto hidden-scrollbar mb-4 filter drop-shadow-sm">
                 <p className="text-base font-medium leading-relaxed" style={{ fontFamily: "'Noto Serif', serif" }}>
                   "{post.content}"
                 </p>
                 {post.media_url && (
                   <div className="mt-3 aspect-video bg-black/10 rounded-lg overflow-hidden">
                     <img src={post.media_url} className="w-full h-full object-cover opacity-80" alt="Sticky Media" />
                   </div>
                 )}
               </div>

               <div className="mt-auto pt-4 border-t border-black/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">— {post.profiles?.nickname ?? post.profiles?.full_name?.split(' ')[0] ?? "Anon"}</span>
                    <span className="text-[10px] font-black tracking-widest uppercase opacity-60 mt-0.5">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.status !== "approved" && (
                      <button disabled={loadingAction === post.id} onClick={() => setStatus(post.id, "approved")} className="w-8 h-8 bg-black/10 hover:bg-green-600 hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[1rem]">check</span>
                      </button>
                    )}
                    {post.status !== "rejected" && (
                       <button disabled={loadingAction === post.id} onClick={() => setStatus(post.id, "rejected")} className="w-8 h-8 bg-black/10 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
                         <span className="material-symbols-outlined text-[1rem]">close</span>
                       </button>
                    )}
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
