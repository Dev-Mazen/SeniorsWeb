"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Memory = {
  id: string;
  author_id: string;
  caption: string | null;
  media_url: string;
  media_type: string;
  status: string;
  created_at: string;
  profiles: { full_name: string | null, nickname?: string | null, email: string | null };
};

function shortDisplayName(name: string | null | undefined) {
  const parts = (name ?? "").split(" ").filter(Boolean);
  if (parts.length >= 2) return parts[1];
  if (parts.length === 1) return parts[0];
  return "Student";
}

export default function MemoriesClient({ initialMemories }: { initialMemories: Memory[] }) {
  const [memories, setMemories] = useState(initialMemories);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // Quick actions
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [editMemory, setEditMemory] = useState<Memory | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const filtered = memories.filter((m) => m.status === filter);

  async function setStatus(id: string, newStatus: string) {
    setLoadingAction(id);
    const supabase = createClient();
    await supabase.from("memories").update({ status: newStatus }).eq("id", id);
    setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
    setLoadingAction(null);
  }

  async function deleteMemory(id: string) {
    if (!confirm("Permanently delete this memory?")) return;
    setLoadingAction(id);
    const supabase = createClient();
    await supabase.from("memories").delete().eq("id", id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setLoadingAction(null);
  }

  async function saveEdit() {
    if (!editMemory) return;
    setLoadingAction("edit");
    const supabase = createClient();
    await supabase.from("memories").update({ caption: editCaption, status: "approved" }).eq("id", editMemory.id);
    setMemories((prev) => prev.map((m) => (m.id === editMemory.id ? { ...m, caption: editCaption, status: "approved" } : m)));
    setEditMemory(null);
    setLoadingAction(null);
  }

  // Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (editMemory) return; // Disable shortcuts while editing
    if (focusedIndex === null || focusedIndex >= filtered.length) return;

    const currentPost = filtered[focusedIndex];

    if (e.key === "a" || e.key === "A") {
      setStatus(currentPost.id, "approved");
      // Move focus down automatically
      if (focusedIndex < filtered.length - 1) setFocusedIndex(focusedIndex); 
      else setFocusedIndex(null);
    } else if (e.key === "r" || e.key === "R") {
      setStatus(currentPost.id, "rejected");
      if (focusedIndex < filtered.length - 1) setFocusedIndex(focusedIndex);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(Math.min(filtered.length - 1, focusedIndex + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(Math.max(0, focusedIndex - 1));
    }
  }, [focusedIndex, filtered, editMemory]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-4xl font-bold text-on-surface serif tracking-tight">Memories Moderation</h2>
          <p className="text-on-surface-variant font-medium mt-1">Review photos and videos submitted by students.</p>
        </div>
        <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/20">
          {(["pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setFocusedIndex(null); }}
              className={`px-5 py-2 rounded-full text-xs font-bold capitalize transition-colors flex items-center gap-2 ${filter === f ? "bg-primary text-white shadow-md shadow-primary/20" : "text-on-surface-variant hover:bg-surface-variant"}`}
            >
              {f === "pending" && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              {f} ({memories.filter((m) => m.status === f).length})
            </button>
          ))}
        </div>
      </header>

      {/* Shortcuts Guide */}
      {filter === "pending" && (
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6 text-sm text-primary font-medium">
          <span className="material-symbols-outlined">keyboard</span>
          <span>Hover a card or use <kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm text-xs mx-1">↑</kbd> <kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm text-xs mx-1">↓</kbd> then press <kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm text-xs font-bold mx-1">A</kbd> to <strong className="font-bold">Approve</strong> or <kbd className="bg-white px-1.5 py-0.5 rounded shadow-sm text-xs font-bold mx-1">R</kbd> to <strong className="font-bold">Reject</strong>.</span>
        </div>
      )}

      {/* Edit Modal */}
      {editMemory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95">
            <h3 className="serif text-2xl font-bold text-on-surface mb-6">Edit & Approve</h3>
            <textarea
              autoFocus
              className="w-full bg-surface-container px-4 py-3 rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />
            <div className="flex gap-3 mt-6">
              <button disabled={loadingAction === "edit"} onClick={saveEdit} className="flex-1 py-3 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-all shadow-md">
                {loadingAction === "edit" ? "Saving..." : "Save & Approve"}
              </button>
              <button onClick={() => setEditMemory(null)} className="px-6 py-3 bg-surface-container text-on-surface font-bold text-sm rounded-full hover:bg-surface-variant transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 pb-20">
        {filtered.length === 0 && (
          <div className="text-center py-24 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/20 border-dashed">
            <span className="material-symbols-outlined text-5xl opacity-20 mb-4 block">done_all</span>
            <p className="font-bold text-on-surface-variant text-lg">No {filter} memories.</p>
            <p className="text-sm opacity-60 mt-1">Queue is clean.</p>
          </div>
        )}
        
        {filtered.map((memory, index) => (
          <div 
            key={memory.id} 
            onMouseEnter={() => setFocusedIndex(index)}
            className={`flex flex-col md:flex-row gap-6 bg-surface-container-lowest p-6 rounded-[2rem] border transition-all ${focusedIndex === index ? "ring-2 ring-primary border-primary editorial-shadow" : "border-outline-variant/20 shadow-sm"}`}
          >
            {/* Media Box */}
            <div className="w-full md:w-64 h-64 flex-shrink-0 rounded-2xl overflow-hidden bg-black/5 relative relative-group">
              {memory.media_type.startsWith("video") ? (
                <video src={memory.media_url} controls className="w-full h-full object-cover" />
              ) : (
                <img src={memory.media_url} alt="Memory" className="w-full h-full object-cover" />
              )}
            </div>
            
            {/* Content Box */}
            <div className="flex flex-col flex-1 py-2">
               <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-on-surface flex items-center gap-2">
                       {shortDisplayName(memory.profiles?.full_name)}
                       {memory.profiles?.nickname && (
                        <span className="ml-2 text-xs font-bold uppercase tracking-[0.15em] text-primary/70">
                          @{memory.profiles.nickname}
                        </span>
                       )}
                    </h4>
                    <p className="text-xs font-semibold text-on-surface-variant mt-1 tracking-widest uppercase">
                       {new Date(memory.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full ${memory.status === 'pending' ? 'bg-amber-100 text-amber-800' : memory.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {memory.status}
                  </span>
               </div>
               
               <p className="mt-4 text-on-surface/80 text-base leading-relaxed bg-surface-container-low p-4 rounded-2xl">
                 {memory.caption || <span className="italic opacity-50">No caption provided.</span>}
               </p>
               
               {/* Controls */}
               <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-2">
                    {memory.status !== "approved" && (
                      <button disabled={loadingAction === memory.id} onClick={() => setStatus(memory.id, "approved")} className="flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-full text-sm font-bold transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">check</span> Approve {focusedIndex === index && <span className="ml-1 opacity-50 text-[10px]">A</span>}
                      </button>
                    )}
                    {memory.status !== "rejected" && (
                      <button disabled={loadingAction === memory.id} onClick={() => setStatus(memory.id, "rejected")} className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white rounded-full text-sm font-bold transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">close</span> Reject {focusedIndex === index && <span className="ml-1 opacity-50 text-[10px]">R</span>}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditMemory(memory); setEditCaption(memory.caption ?? "")}} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-primary hover:text-white text-on-surface-variant transition-all" title="Edit Content">
                      <span className="material-symbols-outlined text-[1rem]">edit</span>
                    </button>
                    <button onClick={() => deleteMemory(memory.id)} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-red-600 hover:text-white text-on-surface-variant transition-all" title="Delete Permanently">
                      <span className="material-symbols-outlined text-[1rem]">delete</span>
                    </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

