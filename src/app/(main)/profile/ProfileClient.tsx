"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfileClient({ profile, userId }: { profile: any; userId: string }) {
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [quote, setQuote] = useState(profile?.quote || "");
  const [funFact, setFunFact] = useState(profile?.fun_fact || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const supabase = createClient();
    const ext = f.name.split(".").pop();
    const path = `${userId}/avatar_${Date.now()}.${ext}`;
    
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, f, { contentType: f.type, upsert: true });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setPhotoUrl(publicUrl);
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSaved(false);
    const supabase = createClient();
    
    const { error: err } = await supabase
      .from("profiles")
      .update({
        nickname,
        quote,
        fun_fact: funFact,
        photo_url: photoUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);
      
    if (err) { setError(err.message); setLoading(false); return; }
    
    setSaved(true);
    setLoading(false);
    setTimeout(() => { setSaved(false); router.refresh(); }, 2000);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12">
        <h1 className="serif text-5xl font-black text-on-surface mb-4">My <span className="text-primary italic">Profile</span></h1>
        <p className="text-on-surface-variant text-lg">Update your details for the yearbook directory.</p>
      </header>

      <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-12 editorial-shadow border border-outline-variant/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="mb-10 relative z-10 max-w-sm">
          <Link href="/time-capsule" className="bg-surface/60 hover:bg-surface transition-colors p-5 rounded-[1.5rem] flex items-center justify-center gap-3 border border-outline-variant/20 shadow-sm hover:shadow-md group">
            <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform">hourglass_top</span>
            <span className="text-[14px] font-bold uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors text-center">Time Capsule</span>
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-8 relative z-10">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-outline-variant/10">
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar" className="w-28 h-28 rounded-full object-cover ring-4 ring-surface shadow-lg group-hover:ring-primary/50 transition-all" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-4xl ring-4 ring-surface shadow-lg group-hover:ring-primary/50 transition-all">
                  {(profile?.full_name ?? "S")[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-surface/80 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-on-surface">{profile?.full_name}</h2>
              <p className="text-on-surface-variant text-sm mb-2">{profile?.email}</p>
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-bold text-primary hover:text-primary-dim transition-colors uppercase tracking-wider">Change Photo</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Nickname (Optional)</label>
              <input 
                className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/30 text-on-surface placeholder:text-outline/50 transition-all shadow-inner"
                placeholder="What do your friends call you?"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Senior Quote</label>
              <textarea 
                className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/30 text-on-surface placeholder:text-outline/50 transition-all shadow-inner resize-none"
                placeholder="Your legacy in a few words..."
                rows={3}
                value={quote}
                onChange={e => setQuote(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Fun Fact</label>
              <input 
                className="w-full p-4 bg-surface-container-high rounded-xl border-none focus:ring-2 focus:ring-primary/30 text-on-surface placeholder:text-outline/50 transition-all shadow-inner"
                placeholder="Something nobody knows about you..."
                value={funFact}
                onChange={e => setFunFact(e.target.value)}
              />
            </div>
          </div>

          {/* Status Messages */}
          {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm flex items-center gap-2"><span className="material-symbols-outlined text-sm">error</span> {error}</div>}
          {saved && <div className="bg-green-500/10 text-green-600 p-4 rounded-xl text-sm flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-sm">check_circle</span> Profile gracefully updated!</div>}

          {/* Submit */}
          <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center sm:flex-row flex-col gap-4">
            <button type="button" onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/login");
              router.refresh();
            }} className="w-full sm:w-auto px-6 py-4 bg-surface-container hover:bg-red-50 hover:text-red-600 rounded-full text-on-surface-variant font-bold transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">logout</span> Log out
            </button>
            <button type="submit" disabled={loading || uploading} className="w-full sm:w-auto px-10 py-4 sunset-gradient rounded-full text-white font-bold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">save</span>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
