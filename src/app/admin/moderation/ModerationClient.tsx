"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Item = {
  id: string;
  content?: string;
  caption?: string;
  media_url?: string;
  media_type?: string;
  status?: string;
  profiles?: { full_name: string | null } | null;
  teachers?: { name: string } | null;
  subject?: { full_name: string | null } | null;
  created_at: string;
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Section({
  title,
  items,
  table,
  onAction,
}: {
  title: string;
  items: Item[];
  table: string;
  onAction: (table: string, id: string, status: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white/60 dark:bg-neutral-950/40 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02]">
      <h3 className="serif text-3xl font-black mb-8 flex items-center gap-4 text-on-surface">
        {title}
        <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/5 shadow-inner">
          {items.length} Pending
        </span>
      </h3>
      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row items-center gap-8 p-8 bg-surface-container-low/40 dark:bg-white/5 rounded-[2.5rem] border border-outline-variant/10 group hover:border-primary/20 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-500 shadow-sm"
          >
            {item.media_url && (
              <div className="relative flex-shrink-0 group/media">
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl group-hover/media:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <img
                    src={item.media_url}
                    alt=""
                    className="w-32 h-32 rounded-[2rem] object-cover shadow-2xl group-hover/media:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-black/20 rounded-[2rem] opacity-0 group-hover/media:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="material-symbols-outlined text-white text-3xl">zoom_in</span>
                </div>
              </div>
            )}
            {!item.media_url && (
              <div className="w-20 h-20 rounded-3xl bg-on-surface/5 dark:bg-white/5 flex-shrink-0 flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500 shadow-inner">
                <span className="material-symbols-outlined text-3xl">description</span>
              </div>
            )}
            <div className="flex-grow min-w-0">
              <p className="serif text-2xl font-black text-on-surface tracking-tighter mb-2 group-hover:text-primary transition-colors duration-500 truncate">
                {item.content ?? item.caption ?? "(Visual Payload Only)"}
              </p>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-on-surface/5 dark:bg-white/10 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[10px]">person</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{item.profiles?.full_name ?? "Anonymous"}</span>
                 </div>
                 {item.teachers && (
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs text-primary/40">arrow_forward</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{item.teachers.name}</span>
                   </div>
                 )}
                 <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{timeAgo(item.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <button
                onClick={() => onAction(table, item.id, "rejected")}
                className="w-16 h-16 rounded-2xl bg-surface-container-highest dark:bg-red-500/10 text-on-surface-variant dark:text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-lg group/reject"
              >
                <span className="material-symbols-outlined text-2xl font-black group-hover/reject:rotate-12">close</span>
              </button>
              <button
                onClick={() => onAction(table, item.id, "approved")}
                className="w-16 h-16 rounded-2xl bg-on-surface dark:bg-green-600 text-surface dark:text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 shadow-2xl group/approve"
              >
                <span className="material-symbols-outlined text-2xl font-black group-hover/approve:rotate-12">check</span>
              </button>
              <button
                onClick={() => onAction(table, item.id, "delete")}
                className="w-12 h-12 rounded-xl bg-on-surface/5 dark:bg-white/5 text-on-surface-variant/40 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Approved Items Panel ──────────────────────────────────────────────────────
function ApprovedSection({
  title,
  items,
  table,
  onDelete,
}: {
  title: string;
  items: Item[];
  table: string;
  onDelete: (table: string, id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="bg-white/60 dark:bg-neutral-950/40 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02]">
      <h3 className="serif text-3xl font-black mb-8 flex items-center gap-4 text-on-surface">
        <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
           <span className="material-symbols-outlined text-2xl font-black">verified</span>
        </div>
        {title} — Authenticated
        <span className="bg-green-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-green-500/20">
          {items.length} Published
        </span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-6 p-6 bg-green-50/20 dark:bg-green-500/5 rounded-3xl border border-green-200/30 dark:border-green-500/10 group hover:scale-[1.02] transition-all duration-500"
          >
            {item.media_url ? (
              <img
                src={item.media_url}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover shadow-xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600/40">
                 <span className="material-symbols-outlined text-2xl">description</span>
              </div>
            )}
            <div className="flex-grow min-w-0">
              <p className="text-lg font-black text-on-surface tracking-tight truncate mb-1">
                {item.content ?? item.caption ?? "(Published Media)"}
              </p>
              <div className="flex items-center gap-3">
                 <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">{item.profiles?.full_name ?? "Anonymous"}</span>
                 <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">{timeAgo(item.created_at)}</span>
              </div>
            </div>
            <button
              onClick={() => onDelete(table, item.id)}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-on-surface-variant/30 hover:bg-red-600 hover:text-white transition-all duration-500 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RejectedSection({
  title,
  items,
  table,
  onAction,
}: {
  title: string;
  items: Item[];
  table: string;
  onAction: (table: string, id: string, status: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="bg-white/60 dark:bg-neutral-950/40 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02]">
      <h3 className="serif text-3xl font-black mb-8 flex items-center gap-4 text-on-surface">
        <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600">
           <span className="material-symbols-outlined text-2xl font-black">block</span>
        </div>
        {title} — Neutralized
        <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-red-500/20">
          {items.length} Rejected
        </span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-6 p-6 bg-red-50/20 dark:bg-red-500/5 rounded-3xl border border-red-200/30 dark:border-red-500/10 group opacity-70 hover:opacity-100 transition-all duration-500"
          >
            {item.media_url ? (
              <img
                src={item.media_url}
                alt=""
                className="w-20 h-20 rounded-2xl object-cover shadow-xl grayscale blur-[2px] group-hover:blur-0 transition-all duration-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600/40">
                 <span className="material-symbols-outlined text-2xl">description</span>
              </div>
            )}
            <div className="flex-grow min-w-0">
              <p className="text-lg font-black text-on-surface tracking-tight truncate mb-1 line-through opacity-60">
                {item.content ?? item.caption ?? "(Rejected Media)"}
              </p>
              <div className="flex items-center gap-3">
                 <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60">{item.profiles?.full_name ?? "Anonymous"}</span>
                 <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">{timeAgo(item.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onAction(table, item.id, "approved")}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-green-600 hover:bg-green-600 hover:text-white transition-all duration-500"
              >
                <span className="material-symbols-outlined text-lg">check</span>
              </button>
              <button
                onClick={() => onAction(table, item.id, "delete")}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-red-600/40 hover:bg-red-600 hover:text-white transition-all duration-500"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModerationClient({
  wallPosts,
  memories,
  teacherMsgs,
  seniorMems,
  approvedWall,
  approvedMem,
  rejectedWall,
  rejectedMem,
  rejectedTeacherMsgs,
  rejectedSeniorMems,
}: {
  wallPosts: Item[];
  memories: Item[];
  teacherMsgs: Item[];
  seniorMems: Item[];
  approvedWall: Item[];
  approvedMem: Item[];
  rejectedWall: Item[];
  rejectedMem: Item[];
  rejectedTeacherMsgs: Item[];
  rejectedSeniorMems: Item[];
}) {
  const [wp, setWp] = useState(wallPosts);
  const [mem, setMem] = useState(memories);
  const [tm, setTm] = useState(teacherMsgs);
  const [sm, setSm] = useState(seniorMems);
  const [aw, setAw] = useState(approvedWall);
  const [am, setAm] = useState(approvedMem);
  
  const [rw, setRw] = useState(rejectedWall);
  const [rm, setRm] = useState(rejectedMem);
  const [rt, setRt] = useState(rejectedTeacherMsgs);
  const [rs, setRs] = useState(rejectedSeniorMems);

  const [activeTab, setActiveTab] = useState<"pending" | "published" | "rejected">("pending");

  async function handleAction(table: string, id: string, status: string) {
    const supabase = createClient();
    if (status === "delete") {
      await supabase.from(table as any).delete().eq("id", id);
    } else {
      await supabase.from(table as any).update({ status }).eq("id", id);
    }

    // Refresh UI naively by router.refresh or manually. Given HotReloader, it will refresh the page automatically.
    // For local UX, we can just remove them from current view.
    const remove = (prev: Item[]) => prev.filter((i) => i.id !== id);
    if (table === "wall_posts") { setWp(remove); setRw(remove); }
    else if (table === "memories") { setMem(remove); setRm(remove); }
    else if (table === "teacher_messages") { setTm(remove); setRt(remove); }
    else if (table === "senior_memories") { setSm(remove); setRs(remove); }
  }

  async function handleDelete(table: string, id: string) {
    const supabase = createClient();
    await supabase.from(table as any).delete().eq("id", id);
    const remove = (prev: Item[]) => prev.filter((i) => i.id !== id);
    if (table === "wall_posts") setAw(remove);
    else if (table === "memories") setAm(remove);
  }

  const [bulkLoading, setBulkLoading] = useState(false);

  async function handleBulkAction(status: "approved" | "rejected") {
    setBulkLoading(true);
    const supabase = createClient();
    const batches: { table: string; ids: string[]; setter: (fn: (p: Item[]) => Item[]) => void }[] = [
      { table: "wall_posts", ids: wp.map(i => i.id), setter: setWp },
      { table: "memories", ids: mem.map(i => i.id), setter: setMem },
      { table: "teacher_messages", ids: tm.map(i => i.id), setter: setTm },
      { table: "senior_memories", ids: sm.map(i => i.id), setter: setSm },
    ];
    for (const batch of batches) {
      if (batch.ids.length === 0) continue;
      await supabase.from(batch.table as any).update({ status }).in("id", batch.ids);
      batch.setter(() => []);
    }
    setBulkLoading(false);
  }

  const totalPending = wp.length + mem.length + tm.length + sm.length;
  const totalPublished = aw.length + am.length;
  const totalRejected = rw.length + rm.length + rt.length + rs.length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 max-w-7xl mx-auto px-6">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-20 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Command Deck</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-on-surface via-primary to-primary-container dark:from-white dark:to-primary-fixed pb-2">Central <span className="italic">Moderation</span></h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">
            Universal authority console for overseeing {totalPending + totalPublished + totalRejected} interactions across the platform.
          </p>
        </div>
        
        <div className="flex bg-white/40 dark:bg-black/40 backdrop-blur-3xl rounded-[2.5rem] p-2 border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] relative z-10">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${activeTab === "pending" ? "bg-primary dark:bg-primary-fixed text-white dark:text-primary-fixed-dim shadow-2xl shadow-primary/30 scale-105" : "text-on-surface-variant/60 hover:text-on-surface hover:bg-on-surface/5"}`}
          >
            Pending <span className="opacity-40 font-bold">({totalPending})</span>
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${activeTab === "published" ? "bg-green-600 text-white shadow-2xl shadow-green-500/30 scale-105" : "text-on-surface-variant/60 hover:text-on-surface hover:bg-on-surface/5"}`}
          >
            Published <span className="opacity-40 font-bold">({totalPublished})</span>
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-8 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${activeTab === "rejected" ? "bg-red-600 text-white shadow-2xl shadow-red-500/30 scale-105" : "text-on-surface-variant/60 hover:text-on-surface hover:bg-on-surface/5"}`}
          >
            Rejected <span className="opacity-40 font-bold">({totalRejected})</span>
          </button>
        </div>
      </header>

      {/* Bulk Operations HUD */}
      {activeTab === "pending" && totalPending > 0 && (
        <div className="flex items-center justify-between bg-white/60 dark:bg-primary-fixed/5 backdrop-blur-2xl border border-white dark:border-primary-fixed/10 p-8 rounded-[3rem] mb-16 shadow-2xl shadow-black/[0.02] animate-in slide-in-from-top-12">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined text-3xl">offline_bolt</span>
             </div>
             <div>
                <h3 className="serif text-2xl font-black text-on-surface tracking-tight">Bulk Authority</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mt-1">Execute system-wide protocols</p>
             </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleBulkAction("approved")}
              disabled={bulkLoading}
              className="px-10 py-5 bg-on-surface dark:bg-green-600 text-surface dark:text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shadow-black/10 flex items-center gap-4 group/btn"
            >
              <span className="material-symbols-outlined text-xl group-hover/btn:rotate-12 transition-transform">done_all</span>
              Authorize All
            </button>
            <button
              onClick={() => handleBulkAction("rejected")}
              disabled={bulkLoading}
              className="px-10 py-5 bg-surface-container-highest dark:bg-red-600 text-on-surface dark:text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 shadow-xl flex items-center gap-4 group/btn"
            >
              <span className="material-symbols-outlined text-xl group-hover/btn:rotate-12 transition-transform">block</span>
              Purge Queue
            </button>
          </div>
        </div>
      )}

      <div className="space-y-16 pb-64">
        {activeTab === "pending" && (
          <div className="grid grid-cols-1 gap-12">
            <Section title="Global Wall Submissions" items={wp} table="wall_posts" onAction={handleAction} />
            <Section title="Temporal Memory Payloads" items={mem} table="memories" onAction={handleAction} />
            <Section title="Faculty Tribute Messages" items={tm} table="teacher_messages" onAction={handleAction} />
            <Section title="Senior Heritage Feed" items={sm} table="senior_memories" onAction={handleAction} />
          </div>
        )}

        {activeTab === "published" && (
          <div className="grid grid-cols-1 gap-12">
            <ApprovedSection title="Wall Records" items={aw} table="wall_posts" onDelete={handleDelete} />
            <ApprovedSection title="Memory Vaults" items={am} table="memories" onDelete={handleDelete} />
            {totalPublished === 0 && (
              <div className="text-center py-48 bg-white/20 dark:bg-neutral-950/20 rounded-[5rem] border-2 border-outline-variant/10 border-dashed backdrop-blur-3xl">
                <div className="w-32 h-32 bg-on-surface/5 rounded-full flex items-center justify-center mx-auto mb-10">
                  <span className="material-symbols-outlined text-7xl text-on-surface-variant/20">inventory_2</span>
                </div>
                <h4 className="serif text-4xl font-black text-on-surface tracking-tight mb-4 capitalize">Vault Empty</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40">No authenticated records have been published.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "rejected" && (
          <div className="grid grid-cols-1 gap-12">
            <RejectedSection title="Purged Wall Posts" items={rw} table="wall_posts" onAction={handleAction} />
            <RejectedSection title="Neutralized Memories" items={rm} table="memories" onAction={handleAction} />
            <RejectedSection title="Deauthorized Tributes" items={rt} table="teacher_messages" onAction={handleAction} />
            <RejectedSection title="Expunged Senior Feed" items={rs} table="senior_memories" onAction={handleAction} />
            {totalRejected === 0 && (
              <div className="text-center py-48 bg-white/20 dark:bg-neutral-950/20 rounded-[5rem] border-2 border-outline-variant/10 border-dashed backdrop-blur-3xl">
                <div className="w-32 h-32 bg-on-surface/5 rounded-full flex items-center justify-center mx-auto mb-10">
                  <span className="material-symbols-outlined text-7xl text-on-surface-variant/20">gpp_good</span>
                </div>
                <h4 className="serif text-4xl font-black text-on-surface tracking-tight mb-4 capitalize">Integrity Maintained</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40">No records have been flagged or purged.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}