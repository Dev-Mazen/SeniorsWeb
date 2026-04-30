"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type Author = { full_name: string | null; nickname?: string | null; photo_url: string | null };
type MemoryItem = {
  id: string;
  caption: string | null;
  media_url: string;
  media_type: string;
  created_at: string;
  profiles: Author | Author[] | null;
};
type MemoryLike = { memory_id: string; user_id: string };
type MemoryComment = {
  id: string;
  memory_id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: Author | Author[] | null;
};

type FeedMode = "feed" | "explore" | "reels";
type FilterMode = "all" | "photo" | "video";

const PAGE_SIZE = 10;
gsap.registerPlugin(useGSAP);

function authorOf(value: Author | Author[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function fullDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function initials(name: string | null | undefined) {
  return (name ?? "?").trim().charAt(0).toUpperCase();
}

function shortDisplayName(name: string | null | undefined) {
  const parts = (name ?? "").split(" ").filter(Boolean);
  if (parts.length >= 2) return parts[1];
  if (parts.length === 1) return parts[0];
  return "Student";
}

function displayIdentity(author: Author | Author[] | null | undefined) {
  const resolved = authorOf(author);
  return {
    name: shortDisplayName(resolved?.full_name),
    nickname: resolved?.nickname?.trim() || "",
  };
}

function Avatar({ author, ring = false, size = "h-12 w-12" }: { author: Author | null; ring?: boolean; size?: string }) {
  if (author?.photo_url) {
    return (
      <div className={ring ? "rounded-full bg-gradient-to-br from-primary via-secondary to-tertiary p-[2px]" : ""}>
        <img src={author.photo_url} alt={author.full_name ?? "Student"} className={`${size} rounded-full object-cover`} />
      </div>
    );
  }
  return <div className={`flex ${size} items-center justify-center rounded-full bg-stone-900 text-sm font-black text-white`}>{initials(author?.full_name)}</div>;
}

/* ─── Upload Modal ─── */
function UploadModal({
  onClose,
  userId,
}: {
  onClose: () => void;
  userId: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 12);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setFiles(nextFiles);
    setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setUploading(true);
    setMessage(null);
    setUploadProgress({ done: 0, total: files.length });

    try {
      const rows: { author_id: string; caption: string; media_url: string; media_type: "photo" | "video" }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadForm = new FormData();
        uploadForm.append("file", file);
        uploadForm.append("folder", `memories/${userId}`);
        const uploadRes = await fetch("/api/media/upload", { method: "POST", body: uploadForm });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData?.error || `Upload failed for ${file.name}`);
        }

        const mediaType: "photo" | "video" = file.type.startsWith("video") ? "video" : "photo";
        rows.push({ author_id: userId, caption, media_url: uploadData.url, media_type: mediaType });
        setUploadProgress({ done: i + 1, total: files.length });
      }

      const { error: insertError } = await supabase.from("memories").insert(rows);
      if (insertError) throw insertError;

      setMessage({ text: `${rows.length} uploads submitted for review.`, type: "success" });
      setCaption("");
      setFiles([]);
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Upload failed", type: "error" });
    }
    setUploading(false);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-lg">add_a_photo</span>
            </div>
            <div>
              <h2 className="serif-heading text-xl font-semibold text-on-surface">Share a Memory</h2>
              <p className="text-xs text-on-surface-variant">Upload a photo or video</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-on-surface text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7">
          {/* Drop zone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-[200px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/40 bg-surface-container-low/50 hover:border-primary/50 hover:bg-surface-container-low transition-all cursor-pointer group overflow-hidden"
          >
            {previews.length > 0 ? (
              <div className="relative w-full p-4">
                <div className="grid grid-cols-3 gap-3 max-h-[240px] overflow-y-auto">
                  {previews.map((src, idx) => (
                    <div key={src} className="relative rounded-xl overflow-hidden bg-black/10 aspect-square">
                      {files[idx]?.type.startsWith("video") ? (
                        <video src={src} className="w-full h-full object-cover" />
                      ) : (
                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); setFiles([]); previews.forEach((url) => URL.revokeObjectURL(url)); setPreviews([]); }}
                  className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer z-10"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-on-surface-variant text-left">{files.length} file(s) selected</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-4">
                  <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary transition-colors">cloud_upload</span>
                </div>
                <p className="text-on-surface font-semibold mb-1">Click to browse</p>
                <p className="text-on-surface-variant text-xs">JPEG, PNG, GIF, MP4 — select up to 12 files</p>
              </>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={pickFile} className="hidden" />

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="mt-4 w-full h-24 rounded-xl bg-surface-container-high p-4 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 resize-none placeholder:text-outline/70"
          />

          {/* Messages */}
          {message && (
            <div className={`mt-4 p-3 rounded-xl text-sm flex items-center gap-2 ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              <span className="material-symbols-outlined text-base">{message.type === "error" ? "error" : "check_circle"}</span>
              {message.text}
            </div>
          )}
          {uploading && uploadProgress.total > 0 && (
            <div className="mt-3 text-xs font-semibold text-on-surface-variant">
              Uploading {uploadProgress.done}/{uploadProgress.total}
            </div>
          )}

          {/* Info + Submit */}
          <div className="mt-5 flex items-center justify-between">
            <p className="text-on-surface-variant text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">security</span>
              Requires admin approval
            </p>
            <button
              type="submit"
              disabled={files.length === 0 || uploading}
              className="sunset-gradient px-6 py-3 rounded-full text-white font-bold text-sm disabled:opacity-50 hover:scale-[1.03] transition-transform shadow-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MemoryFeedExperience({
  items,
  uploadsEnabled,
  userId,
  userRole,
  initialLikes,
  initialComments,
}: {
  items: MemoryItem[];
  uploadsEnabled: boolean;
  userId: string;
  userRole: string;
  initialLikes: MemoryLike[];
  initialComments: MemoryComment[];
}) {
  const supabase = createClient();
  const isAdmin = userRole === "admin";

  const [feedMode, setFeedMode] = useState<FeedMode>("feed");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Editing comments
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const feedRootRef = useRef<HTMLDivElement>(null);

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() =>
    initialLikes.reduce<Record<string, number>>((acc, like) => {
      acc[like.memory_id] = (acc[like.memory_id] ?? 0) + 1;
      return acc;
    }, {})
  );
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set(initialLikes.filter((like) => like.user_id === userId).map((like) => like.memory_id)));
  const [commentsByMemory, setCommentsByMemory] = useState<Record<string, MemoryComment[]>>(() =>
    initialComments.reduce<Record<string, MemoryComment[]>>((acc, comment) => {
      if (!acc[comment.memory_id]) acc[comment.memory_id] = [];
      acc[comment.memory_id].push(comment);
      return acc;
    }, {})
  );

  useGSAP(
    () => {
      gsap.fromTo(
        ".memory-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" }
      );
    },
    { scope: feedRootRef, dependencies: [feedMode, filterMode, searchQuery], revertOnUpdate: true }
  );

  const normalizedItems = useMemo(() => items.map((item) => ({ ...item, profiles: authorOf(item.profiles) })), [items]);
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return normalizedItems.filter((item) => {
      const matchesType = filterMode === "all" || item.media_type === filterMode;
      const matchesQuery =
        !query ||
        item.caption?.toLowerCase().includes(query) ||
        item.profiles?.full_name?.toLowerCase().includes(query) ||
        item.profiles?.nickname?.toLowerCase().includes(query);
      return matchesType && matchesQuery;
    });
  }, [filterMode, normalizedItems, searchQuery]);

  // Paginated items
  const paginatedItems = useMemo(() => filteredItems.slice(0, visibleCount), [filteredItems, visibleCount]);
  const hasMore = visibleCount < filteredItems.length;

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterMode, searchQuery, feedMode]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredItems.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, filteredItems.length]);

  useEffect(() => {
    const channel = supabase
      .channel("memory-feed-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "memory_likes" }, (payload) => {
        const memoryId = (payload.new as { memory_id?: string })?.memory_id || (payload.old as { memory_id?: string })?.memory_id;
        if (!memoryId) return;
        const likeUser = (payload.new as { user_id?: string })?.user_id || (payload.old as { user_id?: string })?.user_id;
        if (likeUser === userId) return;
        if (payload.eventType === "INSERT") {
          setLikeCounts((prev) => ({ ...prev, [memoryId]: (prev[memoryId] ?? 0) + 1 }));
        }
        if (payload.eventType === "DELETE") {
          setLikeCounts((prev) => ({ ...prev, [memoryId]: Math.max(0, (prev[memoryId] ?? 1) - 1) }));
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "memory_comments" }, async (payload) => {
        const eventUserId = (payload.new as { user_id?: string })?.user_id || (payload.old as { user_id?: string })?.user_id;
        if (eventUserId === userId && payload.eventType !== "DELETE") return;
        if (payload.eventType === "DELETE") {
          const deletedId = (payload.old as { id?: string })?.id;
          const memoryId = (payload.old as { memory_id?: string })?.memory_id;
          if (!deletedId || !memoryId) return;
          setCommentsByMemory((prev) => ({
            ...prev,
            [memoryId]: (prev[memoryId] ?? []).filter((comment) => comment.id !== deletedId),
          }));
          return;
        }

        const commentId = (payload.new as { id?: string })?.id;
        const memoryId = (payload.new as { memory_id?: string })?.memory_id;
        if (!commentId || !memoryId) return;
        const { data } = await supabase
          .from("memory_comments")
          .select("id, memory_id, content, created_at, user_id, profiles:user_id(full_name, nickname, photo_url)")
          .eq("id", commentId)
          .single();
        if (!data) return;

        setCommentsByMemory((prev) => {
          const existing = prev[memoryId] ?? [];
          if (existing.some((comment) => comment.id === data.id)) {
            return {
              ...prev,
              [memoryId]: existing.map((comment) => (comment.id === data.id ? (data as MemoryComment) : comment)),
            };
          }
          return { ...prev, [memoryId]: [...existing, data as MemoryComment] };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const activeItem = filteredItems.find((item) => item.id === activeId) ?? null;
  const photoCount = normalizedItems.filter((item) => item.media_type === "photo").length;
  const videoCount = normalizedItems.filter((item) => item.media_type === "video").length;
  const totalLikes = Object.values(likeCounts).reduce((sum, count) => sum + count, 0);
  const totalComments = Object.values(commentsByMemory).reduce((sum, comments) => sum + comments.length, 0);
  const storyAuthors = normalizedItems.map((item) => item.profiles).filter((value, index, arr) => value?.full_name && arr.findIndex((x) => x?.full_name === value.full_name) === index).slice(0, 7);

  async function toggleLike(memoryId: string) {
    if (pendingLikes.has(memoryId)) return;
    const liked = likedIds.has(memoryId);

    setPendingLikes((prev) => new Set(prev).add(memoryId));
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (liked) next.delete(memoryId);
      else next.add(memoryId);
      return next;
    });
    setLikeCounts((prev) => ({ ...prev, [memoryId]: Math.max(0, (prev[memoryId] ?? 0) + (liked ? -1 : 1)) }));

    const { error } = liked
      ? await supabase.from("memory_likes").delete().eq("memory_id", memoryId).eq("user_id", userId)
      : await supabase.from("memory_likes").insert({ memory_id: memoryId, user_id: userId });

    if (error) {
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (liked) next.add(memoryId);
        else next.delete(memoryId);
        return next;
      });
      setLikeCounts((prev) => ({ ...prev, [memoryId]: Math.max(0, (prev[memoryId] ?? 0) + (liked ? 1 : -1)) }));
    }

    setPendingLikes((prev) => {
      const next = new Set(prev);
      next.delete(memoryId);
      return next;
    });
  }

  async function addComment(memoryId: string) {
    const content = commentDrafts[memoryId]?.trim();
    if (!content) return;

    const { data, error } = await supabase
      .from("memory_comments")
      .insert({ memory_id: memoryId, user_id: userId, content })
      .select("id, memory_id, content, created_at, user_id, profiles:user_id(full_name, nickname, photo_url)")
      .single();

    if (error || !data) return;
    setCommentsByMemory((prev) => ({ ...prev, [memoryId]: [...(prev[memoryId] ?? []), data as MemoryComment] }));
    setCommentDrafts((prev) => ({ ...prev, [memoryId]: "" }));
  }

  async function deleteComment(commentId: string, memoryId: string) {
    const { error } = await supabase.from("memory_comments").delete().eq("id", commentId);
    if (error) return;
    setCommentsByMemory((prev) => ({
      ...prev,
      [memoryId]: (prev[memoryId] ?? []).filter((c) => c.id !== commentId),
    }));
  }

  async function updateComment(commentId: string, memoryId: string, newContent: string) {
    if (!newContent.trim()) return;
    const { error } = await supabase.from("memory_comments").update({ content: newContent.trim() }).eq("id", commentId);
    if (error) return;
    setCommentsByMemory((prev) => ({
      ...prev,
      [memoryId]: (prev[memoryId] ?? []).map((c) => c.id === commentId ? { ...c, content: newContent.trim() } : c),
    }));
    setEditingCommentId(null);
    setEditingContent("");
  }

  function canModifyComment(comment: MemoryComment) {
    return isAdmin || comment.user_id === userId;
  }

  function shareItem(item: MemoryItem) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/memory-feed`;
    const identity = displayIdentity(authorOf(item.profiles));
    const text = `Check out this memory from ${
        identity.nickname ? `${identity.name} (${identity.nickname})` : identity.name
      }.`;
    if (navigator.share) {
      navigator.share({ title: "Seniors 2026 Memory", text, url }).catch(() => undefined);
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => undefined);
    }
  }

  /* ─── Comment Row with edit/delete ─── */
  function CommentRow({ comment, memoryId }: { comment: MemoryComment; memoryId: string }) {
    const commentAuthor = authorOf(comment.profiles);
    const canModify = canModifyComment(comment);
    const isEditing = editingCommentId === comment.id;
    const [showMenu, setShowMenu] = useState(false);

    return (
      <div className="group flex gap-3">
        <Avatar author={commentAuthor} size="h-8 w-8" />
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") updateComment(comment.id, memoryId, editingContent); if (e.key === "Escape") { setEditingCommentId(null); setEditingContent(""); } }}
                className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
              />
              <button onClick={() => updateComment(comment.id, memoryId, editingContent)} className="text-xs font-bold text-primary hover:text-primary/80">Save</button>
              <button onClick={() => { setEditingCommentId(null); setEditingContent(""); }} className="text-xs text-white/40 hover:text-white/60">Cancel</button>
            </div>
          ) : (
            <p className="text-sm text-white/88"><span className="mr-1 font-bold">{displayIdentity(commentAuthor).name}</span>{comment.content}</p>
          )}
          <div className="mt-1 flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">{timeAgo(comment.created_at)}</span>
            {canModify && !isEditing && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/60">
                  <span className="material-symbols-outlined text-sm">more_horiz</span>
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute left-0 bottom-6 z-20 bg-stone-800 rounded-xl shadow-xl border border-white/10 py-1 min-w-[120px]">
                      <button
                        onClick={() => { setEditingCommentId(comment.id); setEditingContent(comment.content); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Edit
                      </button>
                      <button
                        onClick={() => { deleteComment(comment.id, memoryId); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={feedRootRef} className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-8">
      {/* Upload Modal */}
      {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} userId={userId} />}

      {/* Hero Header */}
      <section className="section-shell scroll-reveal rounded-[2rem] px-6 py-8 md:px-10 ambient-anim">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="pill-badge inline-flex rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-on-surface-variant">Social archive</div>
            <h1 className="serif-heading mt-5 text-5xl font-semibold leading-[0.92] text-on-surface md:text-7xl">A real social feed for senior memories.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">Switch between feed, explore, and reels views. Like, comment, and share memories from the class.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[{ label: "Memories", value: normalizedItems.length }, { label: "Likes", value: totalLikes }, { label: "Comments", value: totalComments }, { label: "Videos", value: videoCount }].map((stat) => (
                <div key={stat.label} className="pill-badge rounded-[1.25rem] px-4 py-4 interactive-card">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-on-surface-variant">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black text-on-surface">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
              {storyAuthors.map((author, index) => (
                <button key={`${author?.full_name}-${index}`} className="flex min-w-[88px] flex-col items-center gap-2">
                  <Avatar author={author} ring />
                  <span className="max-w-[72px] truncate text-xs font-semibold text-on-surface-variant">{displayIdentity(author).name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="spotlight-card rounded-[1.75rem] border border-outline-variant/15 p-5">
              <p className="section-kicker mb-4">Modes</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { key: "feed", label: "Feed", icon: "dynamic_feed" },
                  { key: "explore", label: "Explore", icon: "grid_view" },
                  { key: "reels", label: "Reels", icon: "smart_display" },
                ].map((mode) => (
                  <button key={mode.key} onClick={() => setFeedMode(mode.key as FeedMode)} className={`interactive-card rounded-[1.25rem] px-4 py-4 text-left transition-all ${feedMode === mode.key ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105 ring-2 ring-primary/50" : "bg-surface-container-highest text-on-surface hover:bg-surface-variant hover:scale-[1.02]"}`}>
                    <span className="material-symbols-outlined text-lg">{mode.icon}</span>
                    <p className="mt-2 text-sm font-black uppercase tracking-[0.18em]">{mode.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="section-shell rounded-[1.75rem] p-5">
              <p className="section-kicker mb-4">Quick jump</p>
              <div className="space-y-3">
                <Link href="/" className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-highest hover:bg-surface-variant transition-colors px-4 py-4 text-sm font-semibold text-on-surface">
                  <span>Back to home</span>
                  <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                </Link>
                <Link href="/wall" className="flex items-center justify-between rounded-[1.25rem] bg-surface-container-highest hover:bg-surface-variant transition-colors px-4 py-4 text-sm font-semibold text-on-surface">
                  <span>Open the wall</span>
                  <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter toolbar */}
      <section className="mt-8 scroll-scale">
        <div className="section-shell rounded-[1.75rem] p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: `All ${normalizedItems.length}` },
                { key: "photo", label: `Photos ${photoCount}` },
                { key: "video", label: `Videos ${videoCount}` },
              ].map((filter) => (
                <button key={filter.key} onClick={() => setFilterMode(filter.key as FilterMode)} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition-all ${filterMode === filter.key ? "bg-primary text-on-primary shadow-md shadow-primary/20" : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"}`}>
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:max-w-sm">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline">search</span>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search people or captions..." className="w-full rounded-full bg-surface-container-highest focus:bg-surface-variant focus:ring-2 focus:ring-primary/30 transition-all px-12 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70" />
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredItems.length === 0 ? (
          <div className="section-shell mt-6 rounded-[1.75rem] px-6 py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-outline/40">photo_library</span>
            <p className="mt-4 text-lg font-semibold text-on-surface">Nothing matches this view yet.</p>
          </div>
        ) : feedMode === "explore" ? (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {paginatedItems.map((item) => (
              <button key={item.id} onClick={() => setActiveId(item.id)} className="memory-card group relative aspect-[0.9] overflow-hidden rounded-[1.5rem] bg-surface-container-high text-left scroll-reveal hover-glow">
                {item.media_type === "video" ? (
                  <video src={item.media_url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" muted loop autoPlay playsInline />
                ) : (
                  <img src={item.media_url} alt={item.caption ?? item.profiles?.full_name ?? "Memory"} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-white/70">{displayIdentity(item.profiles).name}</p>
                  {item.caption && <p className="mt-2 line-clamp-2 text-sm text-white">{item.caption}</p>}
                </div>
              </button>
            ))}
          </div>
        ) : feedMode === "reels" ? (
          <div className="mt-6 h-[78vh] snap-y snap-mandatory space-y-4 overflow-y-auto pr-2 mobile-snap-y no-scrollbar">
            {paginatedItems.map((item) => {
              const liked = likedIds.has(item.id);
              const comments = commentsByMemory[item.id] ?? [];
              return (
                <div key={item.id} className="memory-card relative flex h-[74vh] md:h-[78vh] snap-start items-end overflow-hidden rounded-[2rem] bg-stone-900 mobile-snap-child shadow-2xl">
                  {item.media_type === "video" ? (
                    <video src={item.media_url} className="absolute inset-0 h-full w-full object-cover" muted loop autoPlay playsInline />
                  ) : (
                    <img src={item.media_url} alt={item.caption ?? item.profiles?.full_name ?? "Memory"} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                  <div className="relative z-10 flex w-full items-end justify-between p-6 text-white">
                    <div className="max-w-xl">
                      <div className="mb-4 flex items-center gap-3">
                        <Avatar author={item.profiles} ring />
                        <div>
                          <p className="font-black">{displayIdentity(item.profiles).name}</p>
                          {displayIdentity(item.profiles).nickname && (
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                              @{displayIdentity(item.profiles).nickname}
                            </p>
                          )}
                          <p className="text-xs uppercase tracking-[0.18em] text-white/55">{timeAgo(item.created_at)} ago</p>
                        </div>
                      </div>
                      {item.caption && <p className="max-w-lg text-sm leading-7 text-white/85">{item.caption}</p>}
                    </div>
                    <div className="flex flex-col items-center gap-5">
                      <button onClick={() => toggleLike(item.id)} className="flex flex-col items-center gap-1">
                        <span className={`material-symbols-outlined text-3xl ${liked ? "text-red-500" : "text-white"}`} style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                        <span className="text-xs font-black">{likeCounts[item.id] ?? 0}</span>
                      </button>
                      <button onClick={() => setActiveId(item.id)} className="flex flex-col items-center gap-1">
                        <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                        <span className="text-xs font-black">{comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Feed Mode ─── */
          <div className="mt-6 space-y-8">
            {paginatedItems.map((item) => {
              const comments = commentsByMemory[item.id] ?? [];
              const liked = likedIds.has(item.id);
              return (
                <article key={item.id} className="memory-card section-shell overflow-hidden rounded-[2rem] scroll-reveal">
                  <div className="flex items-center justify-between px-5 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar author={item.profiles} ring />
                      <div>
                        <p className="font-black text-on-surface">{displayIdentity(item.profiles).name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{fullDate(item.created_at)} • {timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveId(item.id)} className="rounded-full bg-surface-container-highest hover:bg-surface-variant transition-colors px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-on-surface">Details</button>
                  </div>
                  <button onClick={() => setActiveId(item.id)} className="block w-full bg-black/5">
                    {item.media_type === "video" ? (
                      <video src={item.media_url} className="max-h-[720px] w-full bg-black object-contain" muted loop autoPlay playsInline />
                    ) : (
                      <img src={item.media_url} alt={item.caption ?? item.profiles?.full_name ?? "Memory"} className="max-h-[720px] w-full object-cover" />
                    )}
                  </button>
                  <div className="px-5 pb-5 pt-4 md:px-6">
                    <div className="flex items-center gap-5">
                      <button onClick={() => toggleLike(item.id)} disabled={pendingLikes.has(item.id)} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-2xl ${liked ? "text-red-500" : "text-on-surface-variant"}`} style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                        <span className="text-sm font-black text-on-surface">{likeCounts[item.id] ?? 0}</span>
                      </button>
                      <button onClick={() => setActiveId(item.id)} className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
                        <span className="text-sm font-black">{comments.length}</span>
                      </button>
                      <button onClick={() => shareItem(item)} className="text-on-surface-variant">
                        <span className="material-symbols-outlined text-2xl">share</span>
                      </button>
                    </div>
                    {item.caption && <p className="mt-4 text-sm leading-7 text-on-surface"><span className="mr-1 font-black">{displayIdentity(item.profiles).name}</span>{item.caption}</p>}
                    
                    {/* Inline comments preview */}
                    {comments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {comments.slice(-2).map((c) => {
                          const ca = authorOf(c.profiles);
                          return (
                            <p key={c.id} className="text-sm text-on-surface"><span className="font-bold mr-1">{displayIdentity(ca).name}</span>{c.content}</p>
                          );
                        })}
                        {comments.length > 2 && (
                          <button onClick={() => setActiveId(item.id)} className="text-xs font-bold text-on-surface-variant hover:text-primary">View all {comments.length} comments</button>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center gap-2 rounded-full bg-surface-container-highest p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <input value={commentDrafts[item.id] ?? ""} onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") addComment(item.id); }} placeholder="Add a comment..." className="flex-1 bg-transparent px-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70" />
                      <button onClick={() => addComment(item.id)} disabled={!commentDrafts[item.id]?.trim()} className="rounded-full bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-on-primary disabled:opacity-40 transition-colors">Post</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="h-4" />
        {hasMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3 text-on-surface-variant">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Loading more memories...</span>
            </div>
          </div>
        )}
        {!hasMore && filteredItems.length > PAGE_SIZE && (
          <p className="text-center text-sm text-on-surface-variant/50 py-8 font-medium">You&apos;ve seen all {filteredItems.length} memories ✓</p>
        )}
      </section>

      {/* Detail Modal (with editable/deletable comments) */}
      {activeItem && (
        <div className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-md" onClick={() => setActiveId(null)}>
          <div className="mx-auto mt-4 md:mt-8 flex max-h-[94vh] w-[min(1180px,96vw)] flex-col overflow-hidden rounded-[1.25rem] md:rounded-[2rem] bg-stone-950 text-white shadow-2xl md:flex-row" onClick={(event) => event.stopPropagation()}>
            <div className="relative flex min-h-[70vh] flex-1 items-center justify-center bg-black">
              {activeItem.media_type === "video" ? (
                <video src={activeItem.media_url} controls autoPlay playsInline className="h-full max-h-[90vh] w-full object-contain" />
              ) : (
                <img src={activeItem.media_url} alt={activeItem.caption ?? activeItem.profiles?.full_name ?? "Memory"} className="h-full max-h-[90vh] w-full object-contain" />
              )}
              <button onClick={() => setActiveId(null)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex w-full md:w-[380px] md:max-w-[40vw] flex-col border-t md:border-t-0 md:border-l border-white/10 bg-stone-950">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <Avatar author={activeItem.profiles} ring />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{displayIdentity(activeItem.profiles).name}</p>
                  {displayIdentity(activeItem.profiles).nickname && (
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                      @{displayIdentity(activeItem.profiles).nickname}
                    </p>
                  )}
                  <p className="text-xs text-white/45">{fullDate(activeItem.created_at)}</p>
                </div>
              </div>
              {activeItem.caption && <div className="border-b border-white/10 px-5 py-4 text-sm leading-6 text-white/85">{activeItem.caption}</div>}
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {(commentsByMemory[activeItem.id] ?? []).map((comment) => (
                  <CommentRow key={comment.id} comment={comment} memoryId={activeItem.id} />
                ))}
                {(commentsByMemory[activeItem.id] ?? []).length === 0 && (
                  <p className="text-center text-white/25 text-sm py-8">No comments yet</p>
                )}
              </div>
              <div className="border-t border-white/10 px-5 py-4">
                <div className="mb-3 flex items-center gap-5">
                  <button onClick={() => toggleLike(activeItem.id)} className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-xl ${likedIds.has(activeItem.id) ? "text-red-500" : "text-white/70"}`} style={likedIds.has(activeItem.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                    <span className="text-sm font-bold text-white/75">{likeCounts[activeItem.id] ?? 0}</span>
                  </button>
                  <button onClick={() => shareItem(activeItem)} className="flex items-center gap-2 text-white/70">
                    <span className="material-symbols-outlined text-xl">share</span>
                    <span className="text-sm font-bold">Share</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/6 p-2">
                  <input
                    value={commentDrafts[activeItem.id] ?? ""}
                    onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [activeItem.id]: event.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") addComment(activeItem.id); }}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35"
                  />
                  <button onClick={() => addComment(activeItem.id)} disabled={!commentDrafts[activeItem.id]?.trim()} className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-stone-900 disabled:opacity-40">Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating buttons: Create */}
      <div className="fixed z-[99] flex flex-col items-center gap-3 bottom-20 right-4 md:bottom-6 md:right-6 pointer-events-none">
        {/* FAB */}
        {uploadsEnabled && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full sunset-gradient shadow-2xl shadow-primary/30 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform group pointer-events-auto"
            title="Share a memory"
          >
            <span className="material-symbols-outlined text-2xl md:text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
          </button>
        )}
      </div>
    </div>
  );
}
                                                                              