"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type Item = { id: string; caption: string | null; media_url: string; media_type: string; created_at: string; profiles: { full_name: string | null; photo_url: string | null } | null };

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MemoryFeedClient({ items, uploadsEnabled, userId }: { items: Item[]; uploadsEnabled: boolean; userId: string }) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("memories-media").upload(path, file);
    if (upErr) { setError(upErr.message); setLoading(false); return; }
    const { data: urlData } = supabase.storage.from("memories-media").getPublicUrl(path);
    const mediaType = file.type.startsWith("video") ? "video" : "photo";
    const { error: insErr } = await supabase.from("memories").insert({ author_id: userId, caption, media_url: urlData.publicUrl, media_type: mediaType });
    if (insErr) { setError(insErr.message); setLoading(false); return; }
    setCaption(""); setFile(null); setPreview(null); setSuccess(true); setLoading(false);
    setTimeout(() => setSuccess(false), 5000);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-32">
      <header className="mb-12">
        <h1 className="serif text-6xl font-black text-on-surface mb-3">Memory <span className="text-primary italic">Feed</span></h1>
        <p className="text-on-surface-variant text-lg">Photos and videos from our final year together.</p>
      </header>

      {uploadsEnabled ? (
        <form onSubmit={handleUpload} className="bg-surface-container-lowest rounded-xl p-6 editorial-shadow mb-12 border border-outline-variant/20">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-outline-variant rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-surface-container-low transition-all mb-4"
          >
            {preview ? (
              file?.type.startsWith("video") ? (
                <video src={preview} className="max-h-48 mx-auto rounded-lg" controls />
              ) : (
                <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-lg object-cover" />
              )
            ) : (
              <>
                <span className="material-symbols-outlined text-5xl text-outline mb-3 block">add_a_photo</span>
                <p className="text-on-surface-variant font-medium">Click to upload a photo or video</p>
                <p className="text-outline text-xs mt-1">PNG, JPG, MP4 supported</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          <input
            className="w-full p-3 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/60 mb-4"
            placeholder="Add a caption..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-3 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Submitted for review!</p>}
          <div className="flex justify-between items-center">
            <p className="text-on-surface-variant text-xs">Requires admin approval.</p>
            <button type="submit" disabled={loading || !file} className="sunset-gradient px-8 py-3 rounded-full text-white font-bold disabled:opacity-50 hover:scale-105 transition-transform">
              {loading ? "Uploading..." : "Share Memory"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-surface-container-high rounded-xl p-8 text-center mb-12">
          <span className="material-symbols-outlined text-4xl text-outline mb-3 block">lock</span>
          <p className="text-on-surface-variant font-medium">Uploads are currently disabled.</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-outline/40">photo_library</span>
          <p className="text-on-surface-variant mt-4">No memories yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {items.map(item => (
            <article key={item.id} className="bg-surface-container-lowest rounded-xl overflow-hidden editorial-shadow">
              <div className="p-5 flex items-center gap-3">
                {item.profiles?.photo_url ? (
                  <img src={item.profiles.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                    {(item.profiles?.full_name ?? "?")[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{item.profiles?.full_name ?? "Student"}</p>
                  <p className="text-xs text-on-surface-variant">{timeAgo(item.created_at)}</p>
                </div>
              </div>
              {item.media_type === "video" ? (
                <video src={item.media_url} controls className="w-full max-h-[500px] object-cover bg-black" />
              ) : (
                <img src={item.media_url} alt={item.caption ?? ""} className="w-full max-h-[500px] object-cover" />
              )}
              {item.caption && <div className="p-5"><p className="text-on-surface">{item.caption}</p></div>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}