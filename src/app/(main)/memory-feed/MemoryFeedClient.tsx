"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { full_name: string | null; photo_url: string | null };
type Comment = { id: string; content: string; created_at: string; user_id: string; profiles: Profile | null };
type Item = {
  id: string;
  caption: string | null;
  media_url: string;
  media_type: string;
  created_at: string;
  profiles: Profile | null;
};
type LiveNotice = { id: string; text: string };

async function compressImageFile(input: File, opts?: { maxDim?: number; quality?: number }) {
  const maxDim = opts?.maxDim ?? 1920;
  const quality = opts?.quality ?? 0.82;

  const bitmap = await createImageBitmap(input);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("Failed to compress image"));
        else resolve(b);
      },
      "image/jpeg",
      quality
    );
  });

  const outName = input.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], outName, { type: "image/jpeg" });
}

async function compressVideoFile(
  input: File,
  opts?: {
    maxWidth?: number;
    maxHeight?: number;
    videoBitsPerSecond?: number;
    mimeType?: string;
  }
) {
  const maxWidth = opts?.maxWidth ?? 1280;
  const maxHeight = opts?.maxHeight ?? 720;
  const videoBitsPerSecond = opts?.videoBitsPerSecond ?? 1_500_000;

  const requested = opts?.mimeType;
  const mimeType =
    (requested && MediaRecorder.isTypeSupported(requested) && requested) ||
    (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") && "video/webm;codecs=vp9,opus") ||
    (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus") && "video/webm;codecs=vp8,opus") ||
    (MediaRecorder.isTypeSupported("video/webm") && "video/webm") ||
    "";

  if (!mimeType) return input;

  const url = URL.createObjectURL(input);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    await new Promise<void>((resolve, reject) => {
      const onLoaded = () => resolve();
      const onErr = () => reject(new Error("Failed to load video"));
      video.addEventListener("loadedmetadata", onLoaded, { once: true });
      video.addEventListener("error", onErr, { once: true });
    });

    const srcW = video.videoWidth || 0;
    const srcH = video.videoHeight || 0;
    if (!srcW || !srcH) return input;

    const scale = Math.min(1, maxWidth / srcW, maxHeight / srcH);
    const outW = Math.max(2, Math.round(srcW * scale));
    const outH = Math.max(2, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return input;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond,
    });

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const done = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      recorder.onerror = () => reject(new Error("Video compression failed"));
    });

    await video.play();
    recorder.start(250);

    const drawFrame = () => {
      if (video.ended || video.paused) return;
      ctx.drawImage(video, 0, 0, outW, outH);
      requestAnimationFrame(drawFrame);
    };
    requestAnimationFrame(drawFrame);

    await new Promise<void>((resolve) => {
      video.addEventListener("ended", () => resolve(), { once: true });
    });

    recorder.stop();
    const outBlob = await done;
    if (!outBlob.size) return input;

    const outName = input.name.replace(/\.[^.]+$/, "") + ".webm";
    const out = new File([outBlob], outName, { type: outBlob.type || "video/webm" });
    return out.size < input.size ? out : input;
  } catch {
    return input;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Share Modal ─── */
function ShareModal({ url, caption, onClose }: { url: string; caption: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/memory-feed" : url;
  const text = caption || "Check out this memory from the Class of 2026!";

  const socials = [
    { name: "WhatsApp", icon: "chat", color: "bg-green-500", href: `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}` },
    { name: "Twitter / X", icon: "tag", color: "bg-black", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}` },
    { name: "Facebook", icon: "thumb_up", color: "bg-blue-600", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: "Telegram", icon: "send", color: "bg-sky-500", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}` },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-on-surface">Share Memory</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-6">
          {socials.map(s => (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-full ${s.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md`}>
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium">{s.name}</span>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-surface-container-high rounded-xl p-2">
          <input readOnly value={shareUrl} className="flex-1 bg-transparent text-xs text-on-surface truncate px-2 outline-none" />
          <button
            onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${copied ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90"}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Lightbox ─── */
function Lightbox({
  items,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  likeCounts,
  userLikes,
  onToggleLike,
  comments,
  onAddComment,
  userId,
}: {
  items: Item[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  likeCounts: Record<string, number>;
  userLikes: Set<string>;
  onToggleLike: (id: string) => void;
  comments: Record<string, Comment[]>;
  onAddComment: (memoryId: string, content: string) => void;
  userId: string;
}) {
  const item = items[currentIndex];
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const memComments = comments[item.id] || [];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    setShowComments(false);
    setCommentText("");
  }, [currentIndex]);

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(item.id, commentText.trim());
    setCommentText("");
  }

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 flex" onClick={onClose}>
      {/* Close */}
      <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors" onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-white/60 text-sm font-bold">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Prev */}
      {currentIndex > 0 && (
        <button
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      )}

      {/* Next */}
      {currentIndex < items.length - 1 && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      )}

      {/* Main content area */}
      <div className="flex flex-1 items-center justify-center" onClick={e => e.stopPropagation()}>
        <div className={`flex ${showComments ? "flex-row" : ""} max-h-[90vh] max-w-[95vw] items-center gap-0`}>
          {/* Media */}
          <div className="flex items-center justify-center flex-shrink-0" style={{ maxWidth: showComments ? "60vw" : "85vw", maxHeight: "85vh" }}>
            {item.media_type === "video" ? (
              <video src={item.media_url} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl" />
            ) : (
              <img src={item.media_url} alt={item.caption ?? ""} className="max-w-full max-h-[85vh] object-contain rounded-xl" />
            )}
          </div>

          {/* Side Panel (comments) */}
          {showComments && (
            <div className="w-[340px] flex-shrink-0 bg-surface-container-lowest/95 dark:bg-black/90 backdrop-blur-2xl rounded-r-xl h-[85vh] flex flex-col overflow-hidden ml-0 border-l border-white/5 dark:border-white/10">
              {/* Author */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                {item.profiles?.photo_url ? (
                  <img src={item.profiles.photo_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                    {(item.profiles?.full_name ?? "?")[0]}
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-bold">{item.profiles?.full_name ?? "Student"}</p>
                  <p className="text-white/50 text-xs">{formatDate(item.created_at)}</p>
                </div>
              </div>

              {/* Caption */}
              {item.caption && (
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-white/80 text-sm">{item.caption}</p>
                </div>
              )}

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {memComments.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-8">No comments yet</p>
                ) : (
                  memComments.map(c => {
                    const cp = Array.isArray(c.profiles) ? (c.profiles as any)[0] : c.profiles;
                    return (
                      <div key={c.id} className="flex gap-3">
                        {cp?.photo_url ? (
                          <img src={cp.photo_url} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 mt-0.5">
                            {(cp?.full_name ?? "?")[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-white text-xs"><span className="font-bold mr-1.5">{cp?.full_name ?? "Anonymous"}</span>{c.content}</p>
                          <p className="text-white/30 text-[10px] mt-0.5">{timeAgo(c.created_at)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Actions row */}
              <div className="px-4 py-3 border-t border-white/10 flex items-center gap-4">
                <button onClick={() => onToggleLike(item.id)} className="flex items-center gap-1.5 group">
                  <span className={`material-symbols-outlined text-lg transition-colors ${userLikes.has(item.id) ? "text-red-500" : "text-white/60 group-hover:text-red-400"}`} style={userLikes.has(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                  <span className="text-white/60 text-xs font-bold">{likeCounts[item.id] || 0}</span>
                </button>
                <span className="text-white/60 text-xs">{memComments.length} comment{memComments.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Comment input */}
              <form onSubmit={handleSubmitComment} className="p-3 border-t border-white/10 flex items-center gap-2">
                <input
                  className="flex-1 bg-white/5 rounded-full px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/20"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button type="submit" disabled={!commentText.trim()} className="text-primary font-bold text-sm disabled:opacity-30 hover:text-primary/80">
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar (when comments are hidden) */}
      {!showComments && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
          <button onClick={(e) => { e.stopPropagation(); onToggleLike(item.id); }} className="flex items-center gap-1.5 group">
            <span className={`material-symbols-outlined text-lg ${userLikes.has(item.id) ? "text-red-500" : "text-white/80 group-hover:text-red-400"}`} style={userLikes.has(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
            <span className="text-white/80 text-xs font-bold">{likeCounts[item.id] || 0}</span>
          </button>
          <div className="w-px h-5 bg-white/20" />
          <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-lg">chat_bubble_outline</span>
            <span className="text-xs font-bold">{memComments.length}</span>
          </button>
          <div className="w-px h-5 bg-white/20" />
          <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                const a = document.createElement('a');
                a.href = item.media_url;
                a.download = `memory-${item.id}.${item.media_type === 'video' ? 'mp4' : 'jpg'}`;
                a.target = "_blank";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }} 
            className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
            title="Download"
          >
            <span className="material-symbols-outlined text-lg">download</span>
          </button>
          <div className="w-px h-5 bg-white/20" />
          <p className="text-white/60 text-xs max-w-[150px] truncate">{item.caption || item.profiles?.full_name}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function MemoryFeedClient({ items, uploadsEnabled, userId }: { items: Item[]; uploadsEnabled: boolean; userId: string }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<"all" | "photo" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Likes
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const userLikesRef = useRef<Set<string>>(new Set());

  // Comments
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Share
  const [shareItem, setShareItem] = useState<Item | null>(null);
  const [liveNotices, setLiveNotices] = useState<LiveNotice[]>([]);

  // Load likes & comments on mount
  useEffect(() => {
    const supabase = createClient();
    
    const loadSocial = async () => {
      // Likes count
      const { data: likes } = await supabase.from("memory_likes").select("memory_id");
      if (likes) {
        const counts: Record<string, number> = {};
        likes.forEach((l: any) => { counts[l.memory_id] = (counts[l.memory_id] || 0) + 1; });
        setLikeCounts(counts);
      }

      // User's likes
      if (userId) {
        const { data: myLikes } = await supabase.from("memory_likes").select("memory_id").eq("user_id", userId);
        if (myLikes) setUserLikes(new Set(myLikes.map((l: any) => l.memory_id)));
      }

      // Comments
      const { data: allComments } = await supabase
        .from("memory_comments")
        .select("id, memory_id, content, created_at, user_id, profiles:user_id(full_name, photo_url)")
        .order("created_at", { ascending: true });
      if (allComments) {
        const grouped: Record<string, Comment[]> = {};
        (allComments as any[]).forEach(c => {
          if (!grouped[c.memory_id]) grouped[c.memory_id] = [];
          grouped[c.memory_id].push(c);
        });
        setComments(grouped);
      }
    };

    loadSocial();

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel('memory-social-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memory_likes' }, (payload) => {
        const eventUserId = payload.eventType === 'DELETE' ? payload.old?.user_id : payload.new?.user_id;

        if (payload.eventType === 'INSERT') {
          const memoryId = payload.new.memory_id;
          setLikeCounts(prev => ({ ...prev, [memoryId]: (prev[memoryId] || 0) + 1 }));

          if (eventUserId === userId) {
            const alreadyLiked = userLikesRef.current.has(memoryId);
            if (!alreadyLiked) {
              setUserLikes(prev => {
                const n = new Set(prev);
                n.add(memoryId);
                return n;
              });
            }
          }
        } else if (payload.eventType === 'DELETE') {
          const memoryId = payload.old.memory_id;
          setLikeCounts(prev => ({ ...prev, [memoryId]: Math.max(0, (prev[memoryId] || 1) - 1) }));

          if (eventUserId === userId) {
            const alreadyUnliked = !userLikesRef.current.has(memoryId);
            if (!alreadyUnliked) {
              setUserLikes(prev => {
                const n = new Set(prev);
                n.delete(memoryId);
                return n;
              });
            }
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'memory_comments' }, async (payload) => {
        // SKIP if it's our own comment (already handled locally)
        if (payload.new.user_id === userId) return;

        // When a new comment comes in from SOMEONE ELSE, we need to fetch info
        const { data: newComment } = await supabase
          .from('memory_comments')
          .select('id, memory_id, content, created_at, user_id, profiles:user_id(full_name, photo_url)')
          .eq('id', payload.new.id)
          .single();
        
        if (newComment) {
          setLiveNotices((prev) => {
            const next = [{ id: `${Date.now()}-${Math.random()}`, text: "New comment added on a memory." }, ...prev].slice(0, 3);
            return next;
          });
          setComments(prev => {
            const memoryId = newComment.memory_id;
            const existing = prev[memoryId] || [];
            if (existing.some(c => c.id === newComment.id)) return prev;
            return {
              ...prev,
              [memoryId]: [...existing, newComment as any]
            };
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (liveNotices.length === 0) return;
    const t = setTimeout(() => {
      setLiveNotices((prev) => prev.slice(0, -1));
    }, 2800);
    return () => clearTimeout(t);
  }, [liveNotices]);

  useEffect(() => {
    userLikesRef.current = userLikes;
  }, [userLikes]);

  async function toggleLike(memoryId: string) {
    const supabase = createClient();
    if (userLikes.has(memoryId)) {
      await supabase.from("memory_likes").delete().eq("memory_id", memoryId).eq("user_id", userId);
      setUserLikes(prev => { const n = new Set(prev); n.delete(memoryId); return n; });
      setLikeCounts(prev => ({ ...prev, [memoryId]: Math.max(0, (prev[memoryId] || 1) - 1) }));
    } else {
      await supabase.from("memory_likes").insert({ memory_id: memoryId, user_id: userId });
      setUserLikes(prev => new Set(prev).add(memoryId));
      setLikeCounts(prev => ({ ...prev, [memoryId]: (prev[memoryId] || 0) + 1 }));
    }
  }

  async function addComment(memoryId: string, content: string) {
    const supabase = createClient();
    // First insert
    const { data: insData, error: insErr } = await supabase
      .from("memory_comments")
      .insert({ memory_id: memoryId, user_id: userId, content })
      .select("id, memory_id, content, created_at, user_id")
      .single();
    
    if (insErr) {
      console.error("Comment insertion error:", insErr);
      return;
    }

    // Then fetch with profile to ensure join works correctly (Supabase sometimes has issues with immediate join on insert RLS)
    const { data: fetchData, error: fetchErr } = await supabase
      .from("memory_comments")
      .select("id, memory_id, content, created_at, user_id, profiles:user_id(full_name, photo_url)")
      .eq("id", insData.id)
      .single();

    if (fetchData) {
      setComments(prev => ({
        ...prev,
        [memoryId]: [...(prev[memoryId] || []), fetchData as any],
      }));
    } else {
      console.error("Comment fetch error:", fetchErr);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
    setLoading(true); setError("");
    const supabase = createClient();

    let uploadFile = file;
    try {
      if (file.type.startsWith("image/")) {
        uploadFile = await compressImageFile(file);
      } else if (file.type.startsWith("video/")) {
        uploadFile = await compressVideoFile(file);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to compress media");
      setLoading(false);
      return;
    }

    const ext = uploadFile.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("memories-media").upload(path, uploadFile, {
      contentType: uploadFile.type,
    });
    if (upErr) { setError(upErr.message); setLoading(false); return; }
    const { data: urlData } = supabase.storage.from("memories-media").getPublicUrl(path);
    const mediaType = file.type.startsWith("video") ? "video" : "photo";
    const { error: insErr } = await supabase.from("memories").insert({ author_id: userId, caption, media_url: urlData.publicUrl, media_type: mediaType });
    if (insErr) { setError(insErr.message); setLoading(false); return; }
    setCaption(""); setFile(null); setPreview(null); setSuccess(true); setLoading(false);
    setTimeout(() => setSuccess(false), 5000);
  }

  const filteredItems = items.filter(item => {
    const matchType = filterType === "all" || item.media_type === filterType;
    const matchSearch = !searchQuery ||
      item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const photoCount = items.filter(i => i.media_type === "photo").length;
  const videoCount = items.filter(i => i.media_type === "video").length;

  const handlePrev = useCallback(() => setLightboxIndex(p => p !== null && p > 0 ? p - 1 : p), []);
  const handleNext = useCallback(() => setLightboxIndex(p => p !== null && p < filteredItems.length - 1 ? p + 1 : p), [filteredItems.length]);
  const handleCloseLightbox = useCallback(() => setLightboxIndex(null), []);

  return (
    <>
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          onClose={handleCloseLightbox}
          onPrev={handlePrev}
          onNext={handleNext}
          likeCounts={likeCounts}
          userLikes={userLikes}
          onToggleLike={toggleLike}
          comments={comments}
          onAddComment={addComment}
          userId={userId}
        />
      )}

      {/* Share Modal */}
      {shareItem && (
        <ShareModal
          url={shareItem.media_url}
          caption={shareItem.caption ?? ""}
          onClose={() => setShareItem(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-32">
        {liveNotices.length > 0 && (
          <div className="fixed right-5 top-20 z-[120] space-y-2">
            {liveNotices.map((notice) => (
              <div key={notice.id} className="rounded-xl border border-primary/20 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface shadow-xl">
                {notice.text}
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="serif text-6xl md:text-7xl font-black mb-3 leading-none text-transparent bg-clip-text bg-gradient-to-br from-on-background to-primary dark:from-white dark:to-primary-fixed drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,138,101,0.3)]">
                Memory <span className="text-primary italic dark:text-primary-fixed">Feed</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-lg">Photos and videos from our final year together.</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-surface-container-high/60 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-primary text-sm">photo_library</span>
                <span className="text-xs font-bold text-on-surface">{items.length} <span className="text-on-surface-variant font-normal">memories</span></span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-high/60 px-4 py-2 rounded-full">
                <span className="material-symbols-outlined text-secondary text-sm">image</span>
                <span className="text-xs font-bold text-on-surface">{photoCount} <span className="text-on-surface-variant font-normal">photos</span></span>
              </div>
              {videoCount > 0 && (
                <div className="flex items-center gap-2 bg-surface-container-high/60 px-4 py-2 rounded-full">
                  <span className="material-symbols-outlined text-tertiary text-sm">videocam</span>
                  <span className="text-xs font-bold text-on-surface">{videoCount} <span className="text-on-surface-variant font-normal">videos</span></span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Upload */}
        {uploadsEnabled ? (
          <form onSubmit={handleUpload} className="bg-surface-container-lowest/80 dark:bg-surface-container-lowest/40 backdrop-blur-3xl rounded-[2rem] p-8 md:p-10 editorial-shadow mb-16 border border-outline-variant/30 dark:border-outline-variant/10 relative overflow-hidden hover:border-primary/30 transition-colors">
            {/* Decorative BG element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container dark:from-primary-fixed dark:to-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(255,138,101,0.4)]">
                <span className="material-symbols-outlined text-white">add_a_photo</span>
              </div>
              <div>
                <h2 className="serif text-2xl font-black text-on-surface">Share a Memory</h2>
                <p className="text-sm font-medium text-on-surface-variant">Upload a photo or video from our year</p>
              </div>
            </div>
            
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-outline-variant/60 dark:border-outline-variant/30 rounded-[1.5rem] p-10 md:p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-surface-container-low/50 transition-all mb-6 group relative overflow-hidden bg-white/50 dark:bg-black/20">
              {preview ? (
                <div className="relative inline-block">
                  {file?.type.startsWith("video") ? (
                    <video src={preview} className="max-h-64 mx-auto rounded-xl shadow-lg ring-1 ring-outline-variant/20" controls />
                  ) : (
                    <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-xl object-cover shadow-lg ring-1 ring-outline-variant/20" />
                  )}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface hover:bg-white hover:text-red-500 shadow-sm transition-all z-10">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 mb-5 rounded-[1.5rem] bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors">cloud_upload</span>
                  </div>
                  <p className="text-on-surface font-semibold text-lg mb-2">Drag and drop or click to browse</p>
                  <p className="text-on-surface-variant text-sm font-medium">JPEG, PNG, GIF, MP4 — Max 50MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
            
            <div className="mt-6 mb-6 relative">
              <span className="material-symbols-outlined absolute left-5 top-5 text-outline">description</span>
              <input className="w-full pl-14 pr-6 py-5 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/30 text-on-surface placeholder:text-outline/70 focus:outline-none font-medium" placeholder="Add a caption..." value={caption} onChange={e => setCaption(e.target.value)} />
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-2"><span className="material-symbols-outlined">error</span> {error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 flex items-center gap-2 font-medium"><span className="material-symbols-outlined">check_circle</span> Upload successful! Awaiting admin approval.</div>}
            
            <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-container-low p-4 rounded-[1.5rem]">
              <p className="text-on-surface-variant text-sm font-medium flex items-center gap-2 mb-4 sm:mb-0">
                <span className="material-symbols-outlined text-sm">security</span>
                Requires admin approval
              </p>
              <button type="submit" disabled={loading || !file} className="w-full sm:w-auto sunset-gradient px-8 py-3.5 rounded-full text-white font-bold disabled:opacity-50 hover:scale-[1.03] transition-transform shadow-lg flex items-center justify-center gap-2 group">
                <span className="material-symbols-outlined text-sm group-hover:-translate-y-1 transition-transform">upload</span>
                {loading ? "Uploading..." : "Share Memory"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-surface-container-high rounded-2xl p-8 text-center mb-12">
            <span className="material-symbols-outlined text-4xl text-outline mb-3 block">lock</span>
            <p className="text-on-surface-variant font-medium">Uploads are currently disabled.</p>
          </div>
        )}

        {/* Toolbar */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-outline text-lg">search</span>
              <input type="text" className="w-full pl-11 pr-4 py-3 bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary/30 text-sm placeholder:text-outline/70 focus:outline-none" placeholder="Search by caption or name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1">
              {(["all", "photo", "video"] as const).map(type => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 capitalize ${filterType === type ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
                  <span className="material-symbols-outlined text-sm">{type === "all" ? "apps" : type === "photo" ? "image" : "videocam"}</span>
                  {type === "all" ? `All (${items.length})` : type === "photo" ? `Photos (${photoCount})` : `Videos (${videoCount})`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-surface-container-high rounded-full p-1 ml-auto">
              <button onClick={() => setViewMode("list")} title="List view" className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${viewMode === "list" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
                <span className="material-symbols-outlined text-sm">view_agenda</span>
              </button>
              <button onClick={() => setViewMode("grid")} title="Grid view" className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>
                <span className="material-symbols-outlined text-sm">grid_view</span>
              </button>
            </div>
          </div>
        )}

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-outline/30 mb-4 block">photo_library</span>
            <p className="text-on-surface-variant font-medium text-lg">{searchQuery || filterType !== "all" ? "No memories match your filter." : "No memories yet. Be the first to share!"}</p>
          </div>
        ) : viewMode === "list" ? (
          /* ── LIST VIEW ── */
          <div className="max-w-3xl mx-auto space-y-12">
            {filteredItems.map((item, idx) => {
              const memComments = comments[item.id] || [];
              const isExpanded = expandedComments.has(item.id);
              return (
                <article key={item.id} className="bg-surface-container-lowest rounded-[2rem] overflow-hidden editorial-shadow border border-outline-variant/15 hover:border-primary/20 transition-colors duration-300">
                  {/* Author Header */}
                  <div className="p-6 flex items-center gap-4 border-b border-outline-variant/5">
                    {item.profiles?.photo_url ? (
                      <img src={item.profiles.photo_url} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-surface" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xl ring-2 ring-surface">{(item.profiles?.full_name ?? "?")[0]}</div>
                    )}
                    <div className="flex-grow">
                      <p className="font-bold text-base text-on-surface hover:text-primary transition-colors cursor-pointer">{item.profiles?.full_name ?? "Student"}</p>
                      <p className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5 uppercase tracking-wider mt-1">
                        <span className="material-symbols-outlined text-[14px]">{item.media_type === "video" ? "videocam" : "image"}</span>
                        {formatDate(item.created_at)} · {timeAgo(item.created_at)}
                      </p>
                    </div>
                  </div>
                  {/* Media */}
                  <div className="relative bg-surface-container-low cursor-pointer group" onClick={() => setLightboxIndex(idx)}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors z-10" />
                    {item.media_type === "video" ? (
                      <video src={item.media_url} className="w-full max-h-[600px] object-contain bg-black" preload="metadata" />
                    ) : (
                      <img src={item.media_url} alt={item.caption ?? ""} className="w-full max-h-[600px] object-contain" loading="lazy" />
                    )}
                    {item.media_type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors z-20">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-5xl text-white ml-2">play_arrow</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content & Actions */}
                  <div className="p-6">
                    {/* Caption */}
                    {item.caption && (
                      <div className="mb-6">
                        <p className="text-on-surface text-base leading-relaxed break-words font-medium">
                          <span className="font-bold mr-2 text-primary">{item.profiles?.full_name}</span>
                          {item.caption}
                        </p>
                      </div>
                    )}
                    
                    {/* Action Bar */}
                    <div className="flex items-center gap-6 py-4 border-t border-b border-outline-variant/10">
                      <button onClick={() => toggleLike(item.id)} className="flex items-center gap-2 group/like py-1">
                        <span className={`material-symbols-outlined text-2xl transition-all duration-300 ${userLikes.has(item.id) ? "text-red-500 scale-110" : "text-on-surface-variant group-hover/like:text-red-400 group-hover/like:scale-110"}`} style={userLikes.has(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                        <span className="text-sm font-bold text-on-surface-variant">{likeCounts[item.id] || 0}</span>
                      </button>
                      <button onClick={() => setExpandedComments(prev => { const n = new Set(prev); isExpanded ? n.delete(item.id) : n.add(item.id); return n; })} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors py-1">
                        <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
                        <span className="text-sm font-bold">{memComments.length}</span>
                      </button>
                      <button onClick={() => setShareItem(item)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors py-1 ml-auto">
                        <span className="material-symbols-outlined text-2xl">share</span>
                      </button>
                      <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = item.media_url;
                          a.download = `memory-${item.id}.${item.media_type === 'video' ? 'mp4' : 'jpg'}`;
                          a.target = "_blank";
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                        }} 
                        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors py-1"
                        title="Download"
                      >
                        <span className="material-symbols-outlined text-2xl">download</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div className="pt-6 animate-in fade-in duration-300">
                        <div className="space-y-4 max-h-72 overflow-y-auto mb-5 pr-2 custom-scrollbar">
                          {memComments.length === 0 ? (
                            <p className="text-on-surface-variant text-sm py-4 text-center bg-surface-container-low rounded-xl">No comments yet. Be the first to reply!</p>
                          ) : memComments.map(c => {
                            const cp = Array.isArray(c.profiles) ? (c.profiles as any)[0] : c.profiles;
                            return (
                              <div key={c.id} className="flex items-start gap-3 group/comment hover:bg-surface-container-lowest p-2 -mx-2 rounded-xl transition-colors">
                                {cp?.photo_url ? (
                                  <img src={cp.photo_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 mt-1">{(cp?.full_name ?? "?")[0]}</div>
                                )}
                                <div className="flex-1 bg-surface-container-low px-4 py-3 rounded-[1.25rem] rounded-tl-sm">
                                  <p className="text-sm text-on-surface leading-relaxed"><span className="font-bold mr-2 text-primary">{cp?.full_name ?? "Anonymous"}</span>{c.content}</p>
                                </div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/50 pt-3 group-hover/comment:text-on-surface-variant/80 transition-colors w-16 text-right flex-shrink-0">{timeAgo(c.created_at)}</p>
                              </div>
                            );
                          })}
                        </div>
                        <form onSubmit={e => { e.preventDefault(); const t = commentInputs[item.id]?.trim(); if (!t) return; addComment(item.id, t); setCommentInputs(prev => ({ ...prev, [item.id]: "" })); }} className="flex items-center gap-3 relative">
                          <input className="flex-1 bg-surface-container-high rounded-full pl-5 pr-14 py-4 text-sm text-on-surface placeholder:text-outline/70 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium" placeholder="Add a comment..." value={commentInputs[item.id] || ""} onChange={e => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))} />
                          <button type="submit" disabled={!commentInputs[item.id]?.trim()} className="absolute right-2 top-1.5 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-0 disabled:scale-75 transition-all duration-300">
                            <span className="material-symbols-outlined text-sm ml-0.5">send</span>
                          </button>
                        </form>
                      </div>
                    )}
                    {!isExpanded && memComments.length > 0 && (
                      <button onClick={() => setExpandedComments(prev => new Set(prev).add(item.id))} className="mt-4 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-surface-container-low">
                        View all {memComments.length} comment{memComments.length !== 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* ── GRID VIEW ── */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((item, idx) => {
              const memComments = comments[item.id] || [];
              return (
                <div key={item.id} className="group relative rounded-[2rem] overflow-hidden aspect-square bg-surface-container editorial-shadow cursor-pointer border border-outline-variant/10" onClick={() => setLightboxIndex(idx)}>
                  {item.media_type === "video" ? (
                     <div className="w-full h-full relative">
                      <video src={item.media_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" muted preload="metadata" />
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-white">play_arrow</span>
                      </div>
                    </div>
                  ) : (
                    <img src={item.media_url} alt={item.caption ?? ""} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 md:p-6 z-20">
                    
                    {/* User info on hover */}
                    <div className="absolute top-5 left-5 right-5 flex items-center gap-3 transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                       {item.profiles?.photo_url ? (
                        <img src={item.profiles.photo_url} alt="" className="w-8 h-8 rounded-full border border-white/50" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold border border-white/50">{(item.profiles?.full_name ?? "?")[0]}</div>
                      )}
                      <span className="text-white font-bold text-sm drop-shadow-md truncate">{item.profiles?.full_name ?? "Student"}</span>
                    </div>

                    {/* Action buttons on hover */}
                    <div className="flex items-center gap-5 mb-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                      <button onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} className="flex items-center gap-1.5 group/btn">
                        <span className={`material-symbols-outlined text-[22px] group-hover/btn:scale-110 transition-transform ${userLikes.has(item.id) ? "text-red-500" : "text-white"}`} style={userLikes.has(item.id) ? { fontVariationSettings: "'FILL' 1" } : {}}>favorite</span>
                        <span className="text-white text-sm font-bold shadow-black drop-shadow-lg">{likeCounts[item.id] || 0}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-white text-base">chat_bubble_outline</span>
                        <span className="text-white text-xs font-bold">{memComments.length}</span>
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); setShareItem(item); }} className="ml-auto">
                        <span className="material-symbols-outlined text-white text-base hover:text-white/80">share</span>
                      </button>
                    </div>
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      {item.profiles?.photo_url ? (
                        <img src={item.profiles.photo_url} alt="" className="w-6 h-6 rounded-full object-cover border border-white/30" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">{(item.profiles?.full_name ?? "?")[0]}</div>
                      )}
                      <p className="text-white text-xs font-bold truncate">{item.profiles?.full_name ?? "Student"}</p>
                    </div>
                    {item.caption && <p className="text-white/80 text-xs line-clamp-2 mt-1">{item.caption}</p>}
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