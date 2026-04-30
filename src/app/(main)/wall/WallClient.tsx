"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type Post = {
  id: string;
  content: string;
  media_url: string | null;
  created_at: string;
  profiles: { full_name: string | null; nickname?: string | null; photo_url: string | null } | null;
};

const COLORS = [
  {
    bg: "bg-surface-container-lowest/40",
    accent: "bg-primary/20",
    border: "border-primary/20",
    rotate: -1.5,
  },
  {
    bg: "bg-surface-container-lowest/60",
    accent: "bg-secondary/20",
    border: "border-secondary/20",
    rotate: 1.2,
  },
  {
    bg: "bg-surface-container-lowest/50",
    accent: "bg-tertiary/20",
    border: "border-tertiary/20",
    rotate: -0.8,
  },
  {
    bg: "bg-surface-container-lowest/70",
    accent: "bg-primary/10",
    border: "border-primary/10",
    rotate: 2,
  }
];

function shortDisplayName(name: string | null | undefined) {
  const parts = (name ?? "").split(" ").filter(Boolean);
  if (parts.length >= 2) return parts[1];
  if (parts.length === 1) return parts[0];
  return "Student";
}

export default function WallClient({ posts, wallEnabled, userId }: { posts: Post[]; wallEnabled: boolean; userId: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);
  const [livePosts, setLivePosts] = useState(posts);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [liveNotice, setLiveNotice] = useState<string | null>(null);

  gsap.registerPlugin(useGSAP);
  useGSAP(
    () => {
      gsap.fromTo(
        ".wall-card",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: "power2.out", stagger: 0.04 }
      );
    },
    { scope: rootRef, dependencies: [livePosts.length], revertOnUpdate: true }
  );

  useEffect(() => {
    const channel = supabase
      .channel("wall-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "wall_posts" }, async (payload) => {
        const row = (payload.new || payload.old) as { id?: string; status?: string; author_id?: string } | undefined;
        if (!row?.id) return;

        if (payload.eventType === "DELETE") {
          setLivePosts((prev) => prev.filter((post) => post.id !== row.id));
          return;
        }

        if ((payload.new as { status?: string })?.status !== "approved") {
          setLivePosts((prev) => prev.filter((post) => post.id !== row.id));
          return;
        }

        const { data: fullPost } = await supabase
          .from("wall_posts")
          .select("id, content, media_url, created_at, profiles:author_id(full_name, nickname, photo_url)")
          .eq("id", row.id)
          .single();

        if (!fullPost) return;
        setLivePosts((prev) => {
          if (prev.some((p) => p.id === fullPost.id)) {
            return prev.map((post) => (post.id === fullPost.id ? (fullPost as unknown as Post) : post));
          }
          return [fullPost as unknown as Post, ...prev];
        });
        if (row.author_id !== userId) {
          setLiveNotice("A new memory has joined the archive.");
          setTimeout(() => setLiveNotice(null), 4000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true); setError("");
    const { error: err } = await supabase.from("wall_posts").insert({ author_id: userId, content });
    if (err) { setError(err.message); setLoading(false); return; }
    setContent(""); setSuccess(true); setLoading(false);
    setTimeout(() => setSuccess(false), 4000);
  }

  function formatStamp(date: string) {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div ref={rootRef} className="max-w-7xl mx-auto px-4 pt-16 pb-32 md:px-8">
      <header className="mb-20 text-center max-w-4xl mx-auto scroll-reveal">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8"
        >
          <span className="material-symbols-outlined text-sm">history_edu</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Collective Archive</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="serif text-6xl md:text-8xl font-black text-on-surface mb-8 tracking-tighter leading-[0.85]"
        >
          The Living <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary italic">Wall.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant text-xl font-medium leading-relaxed max-w-2xl mx-auto"
        >
          A living, breathing scrawl of our shared journey. Pin your favorite moments for eternity.
        </motion.p>
      </header>

      {/* Post Form */}
      <AnimatePresence>
        {wallEnabled ? (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-24 scroll-scale"
          >
            <div className="section-shell rounded-[2.5rem] p-1 shadow-2xl overflow-hidden group/form ambient-anim">
              <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-[2.3rem] p-8 md:p-10">
                <form onSubmit={handlePost}>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60">Contribute a fragment</p>
                    <span className="material-symbols-outlined text-primary/40">edit_note</span>
                  </div>
                  <textarea
                    className="w-full p-8 bg-surface-container-high/40 rounded-[2rem] border border-outline-variant/10 focus:border-primary/30 focus:bg-surface-container-high focus:ring-4 focus:ring-primary/5 transition-all resize-none text-on-surface font-serif italic text-2xl placeholder:text-on-surface-variant/20 focus:outline-none min-h-[160px] leading-relaxed"
                    placeholder="Capture a moment..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    maxLength={600}
                    required
                  />
                  <div className="mt-3 text-right text-[10px] font-bold text-on-surface-variant/50">
                    {content.length}/600
                  </div>
                  
                  <div className="mt-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex-1">
                      {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
                      {success && (
                        <p className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">verified</span>
                          Fragment archived. Pending release.
                        </p>
                      )}
                      {!error && !success && (
                        <p className="text-[9px] text-on-surface-variant/40 font-medium uppercase tracking-widest leading-relaxed">
                          Entries are moderated to preserve the archive&apos;s integrity.
                        </p>
                      )}
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading || !content.trim()} 
                      className="group/submit relative overflow-hidden bg-on-surface text-background px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] disabled:opacity-30 hover:shadow-xl hover:shadow-primary/10 transition-all flex items-center justify-center gap-3 active:scale-95 w-full md:w-auto"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000" />
                      <span className="material-symbols-outlined text-lg">{loading ? "sync" : "send"}</span>
                      {loading ? "Recording..." : "Archive Fragment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mb-24 bg-surface-container-low/20 p-12 rounded-[2.5rem] text-center border border-dashed border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-4xl text-outline/30 mb-4">lock_clock</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Archive submission sequence offline</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <AnimatePresence>
        {liveNotice && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-primary text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-sm">notifications</span>
            {liveNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {livePosts.length === 0 ? (
        <div className="text-center py-32 opacity-20">
          <span className="material-symbols-outlined text-7xl block mb-6">history_edu</span>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Archive is currently empty</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
          {livePosts.map((post, idx) => {
            const style = COLORS[idx % COLORS.length];
            const displayName = shortDisplayName(post.profiles?.full_name);
            const nickname = post.profiles?.nickname?.trim();
            return (
              <motion.article 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: (idx % 12) * 0.05 }}
                key={post.id} 
                className={`wall-card break-inside-avoid section-shell rounded-[2.5rem] p-1 shadow-xl hover:shadow-2xl transition-all duration-500 group/post`}
                style={{ transform: `rotate(${style.rotate}deg)` }}
              >
                <div className={`bg-surface-container-lowest/80 backdrop-blur-3xl rounded-[2.3rem] p-8 flex flex-col h-full border border-outline-variant/5 group-hover/post:bg-surface-container-lowest transition-colors`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-3 py-1 rounded-lg ${style.accent} text-[9px] font-black uppercase tracking-widest text-on-surface-variant/80`}>
                      Archive Entry
                    </div>
                    <span className="material-symbols-outlined text-primary/20 text-lg group-hover/post:text-primary transition-colors">push_pin</span>
                  </div>

                  {post.media_url && (
                    <div className="relative mb-6 overflow-hidden rounded-[1.5rem] group/media">
                      <img src={post.media_url} className="w-full h-auto object-cover transition-transform duration-700 group-hover/media:scale-110" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  )}

                  <p className="serif text-2xl font-black text-on-surface leading-tight mb-8 tracking-tighter italic">
                    &ldquo;{post.content}&rdquo;
                  </p>

                  <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center gap-4">
                    {post.profiles?.photo_url ? (
                      <img src={post.profiles.photo_url} alt="" className="w-10 h-10 rounded-2xl object-cover shadow-lg" />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center font-black text-primary shadow-inner">
                        {displayName[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-on-surface truncate tracking-tight">{displayName}</p>
                      {nickname && <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70">@{nickname}</p>}
                      <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">{formatStamp(post.created_at)}</p>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}