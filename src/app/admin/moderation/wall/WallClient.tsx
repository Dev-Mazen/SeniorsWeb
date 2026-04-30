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
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto px-6">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-secondary rounded-full shadow-[0_0_15px_rgba(var(--color-secondary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Digital Pulse Monitor</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-on-surface via-secondary to-secondary-container dark:from-white dark:to-secondary-fixed pb-2">Chaos <span className="italic">Registry</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">
            Curating the unfiltered expressions of Class 2026. Reviewing {posts.length} transmissions for the Digital Wall.
          </p>
        </div>
        
        <div className="flex bg-white/40 dark:bg-black/40 backdrop-blur-3xl rounded-[2.5rem] p-2 border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] relative z-10">
          {(["pending", "approved", "rejected"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${filter === f ? "bg-secondary dark:bg-secondary-fixed text-white dark:text-secondary-fixed-dim shadow-2xl shadow-secondary/30 scale-105" : "text-on-surface-variant/60 hover:text-on-surface hover:bg-on-surface/5"}`}
            >
              {f === "pending" && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.5)]" />}
              {f} <span className="opacity-40 font-bold">({posts.filter((p) => p.status === f).length})</span>
            </button>
          ))}
        </div>
      </header>

      {/* High-Impact Analytics Section */}
      {filter === "pending" && trending.length > 0 && (
        <div className="mb-24 relative group overflow-hidden bg-white/60 dark:bg-neutral-950/40 border border-secondary/20 dark:border-secondary/10 p-16 rounded-[4rem] backdrop-blur-3xl shadow-2xl shadow-black/[0.02] transition-all duration-700 hover:border-secondary/40">
          <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-secondary/5 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
          
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div>
               <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-0.5 bg-secondary/30 rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary">Advanced Engagement Detection</p>
               </div>
               <h3 className="serif text-5xl font-black text-on-surface tracking-tight">High-Impact Feed</h3>
            </div>
            <div className="w-20 h-20 rounded-[2rem] bg-secondary/10 flex items-center justify-center text-secondary shadow-inner group-hover:rotate-12 transition-transform duration-700">
              <span className="material-symbols-outlined text-4xl">electric_bolt</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
            {trending.map((post, idx) => (
              <div key={"trend-" + post.id} className="bg-white/40 dark:bg-white/5 p-10 rounded-[3rem] border border-outline-variant/10 dark:border-white/5 shadow-xl flex flex-col justify-between group/card hover:-translate-y-3 transition-all duration-700 hover:border-secondary/30">
                <p className="text-2xl font-medium leading-relaxed text-on-surface mb-8 font-serif italic opacity-90">"{post.content}"</p>
                <div className="flex justify-between items-center mt-auto pt-8 border-t border-outline-variant/10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                         <span className="material-symbols-outlined text-lg">fingerprint</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-secondary/60 uppercase tracking-widest mb-1">Signal Source</p>
                        <span className="text-sm font-black text-on-surface tracking-tight uppercase tracking-tighter">@{post.profiles?.nickname ?? "Anonymous"}</span>
                      </div>
                   </div>
                   <button 
                    onClick={() => setStatus(post.id, "approved")} 
                    className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-secondary/30 hover:scale-110 active:scale-95 transition-all duration-500 group/btn"
                   >
                     <span className="material-symbols-outlined text-2xl font-black group-hover/btn:rotate-12">verified</span>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Note Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pb-64">
        {filtered.length === 0 && (
          <div className="col-span-full py-48 text-center bg-white/20 dark:bg-neutral-950/20 rounded-[5rem] border-2 border-outline-variant/10 border-dashed backdrop-blur-3xl group">
             <div className="relative inline-block mb-10">
                <div className="w-32 h-32 bg-on-surface/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                   <span className="material-symbols-outlined text-8xl text-secondary/10">dashboard_customize</span>
                </div>
                <span className="absolute -top-2 -right-2 w-12 h-12 bg-white dark:bg-neutral-900 rounded-2xl flex items-center justify-center shadow-2xl border border-outline-variant/10">
                   <span className="material-symbols-outlined text-2xl text-secondary animate-bounce">inventory_2</span>
                </span>
              </div>
             <h3 className="serif text-4xl font-black text-on-surface tracking-tight mb-4 capitalize">Board Synchronized</h3>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 max-w-sm mx-auto leading-relaxed">System scan complete. No {filter} transmissions found in the current pulse registry.</p>
          </div>
        )}
        {filtered.map((post, idx) => {
          const colorClass = STICKY_COLORS[idx % STICKY_COLORS.length];
          const isPinned = pinned.has(post.id);
          
          return (
            <div 
              key={post.id} 
              className={`group relative aspect-square p-12 shadow-2xl border transition-all duration-700 hover:-translate-y-6 hover:scale-[1.03] flex flex-col ${colorClass} ${isPinned ? 'ring-[12px] ring-secondary/20 dark:ring-secondary/10 shadow-secondary/10' : 'shadow-black/[0.05]'}`}
              style={{ 
                borderRadius: '4px 4px 80px 4px',
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)'
              }}
            >
               {/* Fold effect with shadow */}
               <div className="absolute bottom-0 right-0 w-16 h-16 bg-black/10 dark:bg-white/10 rounded-tl-[2.5rem] pointer-events-none transition-all duration-700 group-hover:w-20 group-hover:h-20 shadow-inner" />
              
               {/* Pin Interaction HUD */}
               {filter === "approved" && (
                 <button 
                  onClick={() => togglePin(post.id)} 
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-700 z-10 ${isPinned ? "bg-secondary text-white scale-110 shadow-secondary/40 rotate-12" : "bg-white/90 backdrop-blur-sm text-on-surface-variant hover:bg-secondary/10 hover:text-secondary hover:scale-110 hover:-rotate-12"}`} 
                 >
                   <span className="material-symbols-outlined text-3xl font-black">push_pin</span>
                 </button>
               )}

               <div className="flex-1 overflow-y-auto no-scrollbar mb-10">
                 <p className="text-2xl font-black leading-tight text-on-surface tracking-tighter serif italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                   "{post.content}"
                 </p>
                 {post.media_url && (
                   <div className="mt-8 aspect-square bg-black/5 rounded-[2.5rem] overflow-hidden border border-black/5 group-hover:rotate-3 transition-transform duration-1000 shadow-xl">
                     <img src={post.media_url} className="w-full h-full object-cover mix-blend-multiply opacity-95 group-hover:scale-110 transition-transform duration-1000" alt="Chaos Media" />
                   </div>
                 )}
               </div>

               <div className="mt-auto pt-8 border-t border-black/10 flex items-center justify-between relative z-10">
                  <div className="flex flex-col min-w-0">
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] opacity-40 mb-1">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                    <span className="font-black text-lg truncate uppercase tracking-tighter text-on-surface">— @{post.profiles?.nickname ?? "Alumni"}</span>
                  </div>
                  
                  <div className="flex gap-4">
                    {post.status !== "approved" && (
                      <button 
                        disabled={loadingAction === post.id} 
                        onClick={() => setStatus(post.id, "approved")} 
                        className="w-14 h-14 bg-black/5 hover:bg-secondary hover:text-white rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm active:scale-90 group/btn"
                      >
                        <span className="material-symbols-outlined text-2xl font-black group-hover/btn:rotate-12">verified</span>
                      </button>
                    )}
                    {post.status !== "rejected" && (
                       <button 
                        disabled={loadingAction === post.id} 
                        onClick={() => setStatus(post.id, "rejected")} 
                        className="w-14 h-14 bg-black/5 hover:bg-red-600 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm active:scale-90 group/btn"
                       >
                         <span className="material-symbols-outlined text-2xl font-black group-hover/btn:rotate-12">block</span>
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
