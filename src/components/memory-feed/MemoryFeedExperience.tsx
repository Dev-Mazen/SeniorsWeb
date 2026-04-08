"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Author = { full_name: string | null; photo_url: string | null };
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

function Avatar({ author, ring = false }: { author: Author | null; ring?: boolean }) {
  if (author?.photo_url) {
    return (
      <div className={ring ? "rounded-full bg-gradient-to-br from-primary via-secondary to-tertiary p-[2px]" : ""}>
        <img src={author.photo_url} alt={author.full_name ?? "Student"} className="h-12 w-12 rounded-full object-cover" />
      </div>
    );
  }
  return <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-sm font-black text-white">{initials(author?.full_name)}</div>;
}

export default function MemoryFeedExperience({
  items,
  uploadsEnabled,
  userId,
  initialLikes,
  initialComments,
}: {
  items: MemoryItem[];
  uploadsEnabled: boolean;
  userId: string;
  initialLikes: MemoryLike[];
  initialComments: MemoryComment[];
}) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedMode, setFeedMode] = useState<FeedMode>("feed");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

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

  const normalizedItems = useMemo(() => items.map((item) => ({ ...item, profiles: authorOf(item.profiles) })), [items]);
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return normalizedItems.filter((item) => {
      const matchesType = filterMode === "all" || item.media_type === filterMode;
      const matchesQuery =
        !query ||
        item.caption?.toLowerCase().includes(query) ||
        item.profiles?.full_name?.toLowerCase().includes(query);
      return matchesType && matchesQuery;
    });
  }, [filterMode, normalizedItems, searchQuery]);

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
      .select("id, memory_id, content, created_at, user_id, profiles:user_id(full_name, photo_url)")
      .single();

    if (error || !data) return;
    setCommentsByMemory((prev) => ({ ...prev, [memoryId]: [...(prev[memoryId] ?? []), data as MemoryComment] }));
    setCommentDrafts((prev) => ({ ...prev, [memoryId]: "" }));
  }

  function pickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
  }

  async function submitUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadMessage(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("memories-media").upload(path, file, { contentType: file.type });

    if (uploadError) {
      setUploadMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("memories-media").getPublicUrl(path);
    const mediaType = file.type.startsWith("video") ? "video" : "photo";
    const { error: insertError } = await supabase.from("memories").insert({ author_id: userId, caption, media_url: publicUrlData.publicUrl, media_type: mediaType });

    setUploadMessage(insertError ? insertError.message : "Submitted for review. It will appear once approved.");
    if (!insertError) {
      setCaption("");
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setUploading(false);
  }

  function shareItem(item: MemoryItem) {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/memory-feed`;
    const text = item.caption || `Check out this memory from ${item.profiles?.full_name ?? "Seniors 2026"}.`;
    if (navigator.share) {
      navigator.share({ title: "Seniors 2026 Memory", text, url }).catch(() => undefined);
    } else {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => undefined);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-8 md:px-8">
      <section className="section-shell rounded-[2rem] px-6 py-8 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="pill-badge inline-flex rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-on-surface-variant">Social archive</div>
            <h1 className="serif-heading mt-5 text-5xl font-semibold leading-[0.92] text-on-surface md:text-7xl">A real social feed for senior memories.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-on-surface-variant md:text-lg">Switch between feed, explore, and reels views. Likes and unlikes now update optimistically and roll back cleanly if the database rejects a change.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[{ label: "Memories", value: normalizedItems.length }, { label: "Likes", value: totalLikes }, { label: "Comments", value: totalComments }, { label: "Videos", value: videoCount }].map((stat) => (
                <div key={stat.label} className="pill-badge rounded-[1.25rem] px-4 py-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-on-surface-variant">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black text-on-surface">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
              {storyAuthors.map((author, index) => (
                <button key={`${author?.full_name}-${index}`} className="flex min-w-[88px] flex-col items-center gap-2">
                  <Avatar author={author} ring />
                  <span className="max-w-[72px] truncate text-xs font-semibold text-on-surface-variant">{author?.full_name?.split(" ")[0]}</span>
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
                  <button key={mode.key} onClick={() => setFeedMode(mode.key as FeedMode)} className={`rounded-[1.25rem] px-4 py-4 text-left ${feedMode === mode.key ? "bg-stone-900 text-white" : "bg-white text-on-surface"}`}>
                    <span className="material-symbols-outlined text-lg">{mode.icon}</span>
                    <p className="mt-2 text-sm font-black uppercase tracking-[0.18em]">{mode.label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] bg-stone-900 p-5 text-white">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/45">Snapshot</p>
              <p className="mt-3 text-xl font-semibold">Photos: {photoCount}</p>
              <p className="mt-2 text-xl font-semibold">Videos: {videoCount}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">Use `Feed` for Instagram-style browsing, `Explore` for discovery, and `Reels` for full-screen momentum.</p>
            </div>
          </div>
        </div>
        <aside className="space-y-6">
          {uploadsEnabled ? (
            <form onSubmit={submitUpload} className="section-shell rounded-[1.75rem] p-5">
              <p className="section-kicker mb-4">Create</p>
              <h2 className="serif-heading text-3xl font-semibold text-on-surface">Share a memory</h2>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 flex min-h-[220px] w-full flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-outline-variant/35 bg-white/50 px-4 py-6 text-center">
                {preview ? (
                  file?.type.startsWith("video") ? (
                    <video src={preview} controls className="max-h-[220px] rounded-[1.25rem]" />
                  ) : (
                    <img src={preview} alt="Preview" className="max-h-[220px] rounded-[1.25rem] object-cover" />
                  )
                ) : (
                  <>
                    <span className="material-symbols-outlined text-5xl text-primary">add_photo_alternate</span>
                    <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-on-surface">Choose photo or video</p>
                  </>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={pickFile} className="hidden" />
              <textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Write a caption..." className="mt-4 h-28 w-full rounded-[1.25rem] bg-white p-4 text-sm text-on-surface outline-none" />
              {uploadMessage && <p className="mt-3 text-sm font-medium text-on-surface-variant">{uploadMessage}</p>}
              <button type="submit" disabled={!file || uploading} className="mt-4 w-full rounded-full bg-stone-900 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-white disabled:opacity-45">
                {uploading ? "Uploading..." : "Submit for review"}
              </button>
            </form>
          ) : (
            <div className="section-shell rounded-[1.75rem] p-5">
              <p className="section-kicker mb-4">Create</p>
              <h2 className="serif-heading text-3xl font-semibold text-on-surface">Uploads paused</h2>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">The feed is still browseable, but admins have uploads turned off for now.</p>
            </div>
          )}

          <div className="section-shell rounded-[1.75rem] p-5">
            <p className="section-kicker mb-4">Quick jump</p>
            <div className="space-y-3">
              <Link href="/" className="flex items-center justify-between rounded-[1.25rem] bg-white px-4 py-4 text-sm font-semibold text-on-surface">
                <span>Back to home</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link href="/wall" className="flex items-center justify-between rounded-[1.25rem] bg-white px-4 py-4 text-sm font-semibold text-on-surface">
                <span>Open the wall</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8">
        <div className="section-shell rounded-[1.75rem] p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: `All ${normalizedItems.length}` },
                { key: "photo", label: `Photos ${photoCount}` },
                { key: "video", label: `Videos ${videoCount}` },
              ].map((filter) => (
                <button key={filter.key} onClick={() => setFilterMode(filter.key as FilterMode)} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${filterMode === filter.key ? "bg-stone-900 text-white" : "bg-white text-on-surface-variant"}`}>
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative w-full md:max-w-sm">
              <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline">search</span>
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search people or captions..." className="w-full rounded-full bg-white px-12 py-3 text-sm text-on-surface outline-none" />
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="section-shell mt-6 rounded-[1.75rem] px-6 py-16 text-center">
            <span className="material-symbols-outlined text-6xl text-outline/40">photo_library</span>
            <p className="mt-4 text-lg font-semibold text-on-surface">Nothing matches this view yet.</p>
          </div>
        ) : feedMode === "explore" ? (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {filteredItems.map((item) => (
              <button key={item.id} onClick={() => setActiveId(item.id)} className="group relative aspect-[0.9] overflow-hidden rounded-[1.5rem] bg-surface-container-high text-left">
                {item.media_type === "video" ? (
                  <video src={item.media_url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" muted loop autoPlay playsInline />
                ) : (
                  <img src={item.media_url} alt={item.caption ?? item.profiles?.full_name ?? "Memory"} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-white/70">{item.profiles?.full_name ?? "Student"}</p>
                  {item.caption && <p className="mt-2 line-clamp-2 text-sm text-white">{item.caption}</p>}
                </div>
              </button>
            ))}
          </div>
        ) : feedMode === "reels" ? (
          <div className="mt-6 h-[78vh] snap-y snap-mandatory space-y-4 overflow-y-auto pr-2">
            {filteredItems.map((item) => {
              const liked = likedIds.has(item.id);
              const comments = commentsByMemory[item.id] ?? [];
              return (
                <div key={item.id} className="relative flex h-[74vh] snap-start items-end overflow-hidden rounded-[2rem] bg-stone-900">
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
                          <p className="font-black">{item.profiles?.full_name ?? "Student"}</p>
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
          <div className="mt-6 space-y-8">
            {filteredItems.map((item) => {
              const comments = commentsByMemory[item.id] ?? [];
              const liked = likedIds.has(item.id);
              return (
                <article key={item.id} className="section-shell overflow-hidden rounded-[2rem]">
                  <div className="flex items-center justify-between px-5 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                      <Avatar author={item.profiles} ring />
                      <div>
                        <p className="font-black text-on-surface">{item.profiles?.full_name ?? "Student"}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{fullDate(item.created_at)} • {timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveId(item.id)} className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-on-surface">Details</button>
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
                    {item.caption && <p className="mt-4 text-sm leading-7 text-on-surface"><span className="mr-1 font-black">{item.profiles?.full_name ?? "Student"}</span>{item.caption}</p>}
                    <div className="mt-4 flex items-center gap-2 rounded-full bg-white p-2">
                      <input value={commentDrafts[item.id] ?? ""} onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))} placeholder="Add a comment..." className="flex-1 bg-transparent px-3 text-sm text-on-surface outline-none placeholder:text-outline" />
                      <button onClick={() => addComment(item.id)} disabled={!commentDrafts[item.id]?.trim()} className="rounded-full bg-stone-900 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white disabled:opacity-40">Post</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {activeItem && (
        <div className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-md" onClick={() => setActiveId(null)}>
          <div className="mx-auto mt-8 flex max-h-[90vh] w-[min(1180px,95vw)] overflow-hidden rounded-[2rem] bg-stone-950 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
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
            <div className="flex w-[380px] max-w-[40vw] flex-col border-l border-white/10 bg-stone-950">
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <Avatar author={activeItem.profiles} ring />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{activeItem.profiles?.full_name ?? "Student"}</p>
                  <p className="text-xs text-white/45">{fullDate(activeItem.created_at)}</p>
                </div>
              </div>
              {activeItem.caption && <div className="border-b border-white/10 px-5 py-4 text-sm leading-6 text-white/85">{activeItem.caption}</div>}
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                {(commentsByMemory[activeItem.id] ?? []).map((comment) => {
                  const commentAuthor = authorOf(comment.profiles);
                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar author={commentAuthor} />
                      <div className="min-w-0">
                        <p className="text-sm text-white/88"><span className="mr-1 font-bold">{commentAuthor?.full_name ?? "Anonymous"}</span>{comment.content}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/35">{timeAgo(comment.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
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
                  <input value={commentDrafts[activeItem.id] ?? ""} onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [activeItem.id]: event.target.value }))} placeholder="Add a comment..." className="flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/35" />
                  <button onClick={() => addComment(activeItem.id)} disabled={!commentDrafts[activeItem.id]?.trim()} className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-stone-900 disabled:opacity-40">Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
