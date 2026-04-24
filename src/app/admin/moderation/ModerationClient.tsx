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
  if (items.length === 0)
    return (
      <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-on-surface-variant text-sm">No pending items.</p>
      </div>
    );

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
      <h3 className="font-bold text-lg mb-4">
        {title}{" "}
        <span className="bg-primary/10 text-primary text-xs font-black px-2 py-0.5 rounded-full ml-2">
          {items.length}
        </span>
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 p-4 bg-surface-container-low rounded-xl group hover:bg-surface-container transition-colors"
          >
            {item.media_url &&
              (item.media_type === "video" ? (
                <video
                  src={item.media_url}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <img
                  src={item.media_url}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ))}
            {!item.media_url && (
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">
                  description
                </span>
              </div>
            )}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">
                {item.content ?? item.caption ?? "(media only)"}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                {item.profiles?.full_name ?? "Anonymous"}
                {item.teachers ? ` → ${item.teachers.name}` : ""}
                {item.subject ? ` about ${item.subject.full_name}` : ""}
                {" · "}
                {timeAgo(item.created_at)}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onAction(table, item.id, "rejected")}
                title="Reject"
                className="w-9 h-9 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:bg-red-200 transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <button
                onClick={() => onAction(table, item.id, "approved")}
                title="Approve"
                className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">check</span>
              </button>
              <button
                onClick={() => onAction(table, item.id, "delete")}
                title="Delete permanently"
                className="w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
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
    <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-green-600 text-base">verified</span>
        {title} — Published
        <span className="bg-green-100 text-green-700 text-xs font-black px-2 py-0.5 rounded-full ml-1">
          {items.length}
        </span>
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 bg-green-50/50 rounded-xl"
          >
            {item.media_url && (
              <img
                src={item.media_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-on-surface truncate">
                {item.content ?? item.caption ?? "(media)"}
              </p>
              <p className="text-xs text-on-surface-variant">
                {item.profiles?.full_name ?? "Anonymous"} · {timeAgo(item.created_at)}
              </p>
            </div>
            <button
              onClick={() => onDelete(table, item.id)}
              title="Delete"
              className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-all flex-shrink-0"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
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
    <div className="bg-surface-container-lowest rounded-xl p-6 mb-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-red-600 text-base">block</span>
        {title} — Rejected
        <span className="bg-red-100 text-red-700 text-xs font-black px-2 py-0.5 rounded-full ml-1">
          {items.length}
        </span>
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-3 bg-red-50/50 rounded-xl"
          >
            {item.media_url && (
              <img
                src={item.media_url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 opacity-70"
              />
            )}
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-on-surface truncate strike-through opacity-80">
                {item.content ?? item.caption ?? "(media)"}
              </p>
              <p className="text-xs text-on-surface-variant">
                {item.profiles?.full_name ?? "Anonymous"} · {timeAgo(item.created_at)}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onAction(table, item.id, "approved")}
                title="Approve instead"
                className="w-8 h-8 rounded-full flex items-center justify-center text-green-600 hover:bg-green-100 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm">check</span>
              </button>
              <button
                onClick={() => onAction(table, item.id, "delete")}
                title="Delete permanently"
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-700 transition-all flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
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
    <div>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface" style={{fontFamily:"'Noto Serif', serif"}}>Moderation Queue</h2>
        <p className="text-on-surface-variant text-sm mt-1">
          {totalPending} pending · {totalPublished} published · {totalRejected} rejected
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 items-center">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === "pending"
              ? "bg-primary text-white shadow-md"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Pending ({totalPending})
        </button>
        <button
          onClick={() => setActiveTab("published")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === "published"
              ? "bg-green-600 text-white shadow-md"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Published ({totalPublished})
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            activeTab === "rejected"
              ? "bg-red-600 text-white shadow-md"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Rejected ({totalRejected})
        </button>

        {/* Bulk Actions */}
        {activeTab === "pending" && totalPending > 0 && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkAction("approved")}
              disabled={bulkLoading}
              className="px-4 py-2 rounded-full text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              Accept All ({totalPending})
            </button>
            <button
              onClick={() => handleBulkAction("rejected")}
              disabled={bulkLoading}
              className="px-4 py-2 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">block</span>
              Reject All ({totalPending})
            </button>
          </div>
        )}
      </div>

      {activeTab === "pending" && (
        <>
          <Section title="Wall Posts" items={wp} table="wall_posts" onAction={handleAction} />
          <Section title="Memory Feed" items={mem} table="memories" onAction={handleAction} />
          <Section title="Teacher Messages" items={tm} table="teacher_messages" onAction={handleAction} />
          <Section title="Senior Memories" items={sm} table="senior_memories" onAction={handleAction} />
        </>
      )}

      {activeTab === "published" && (
        <>
          <ApprovedSection title="Wall Posts" items={aw} table="wall_posts" onDelete={handleDelete} />
          <ApprovedSection title="Memory Feed" items={am} table="memories" onDelete={handleDelete} />
          {totalPublished === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-30 block mb-4">inventory_2</span>
              No published items yet.
            </div>
          )}
        </>
      )}

      {activeTab === "rejected" && (
        <>
          <RejectedSection title="Wall Posts" items={rw} table="wall_posts" onAction={handleAction} />
          <RejectedSection title="Memory Feed" items={rm} table="memories" onAction={handleAction} />
          <RejectedSection title="Teacher Messages" items={rt} table="teacher_messages" onAction={handleAction} />
          <RejectedSection title="Senior Memories" items={rs} table="senior_memories" onAction={handleAction} />
          {totalRejected === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-30 block mb-4">gpp_good</span>
              No rejected items yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}