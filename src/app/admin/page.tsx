import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const [
    { count: totalStudents },
    { count: pendingWall },
    { count: pendingMemories },
    { count: pendingTeacherMsgs },
    { data: settings },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("wall_posts").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("memories").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("teacher_messages").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("platform_settings").select("*").single(),
  ]);
  const totalPending = (pendingWall ?? 0) + (pendingMemories ?? 0) + (pendingTeacherMsgs ?? 0);
  const moderationBars = [
    { label: "Wall", value: pendingWall ?? 0, color: "bg-primary" },
    { label: "Memories", value: pendingMemories ?? 0, color: "bg-secondary" },
    { label: "Teacher Messages", value: pendingTeacherMsgs ?? 0, color: "bg-tertiary" },
  ];
  const maxModeration = Math.max(1, ...moderationBars.map((b) => b.value));

  const stats = [
    { label: "Total Seniors", value: totalStudents ?? 0, icon: "group", color: "text-secondary" },
    { label: "Pending Moderation", value: totalPending, icon: "pending_actions", color: "text-primary", highlight: true },
    { label: "Grad Date", value: settings?.graduation_date ?? "—", icon: "event", color: "text-tertiary", isDate: true },
  ];

  return (
    <div>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="serif text-4xl font-bold tracking-tight mb-2">Command Center</h2>
          <p className="text-on-surface-variant">Class of 2026 — Digital Archive Management</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map(s => (
          <div key={s.label} className={`interactive-card hover-glow bg-surface-container-lowest p-8 rounded-xl shadow-sm ${s.highlight ? "border-l-4 border-primary" : ""}`}>
            <span className={`material-symbols-outlined text-3xl mb-4 block ${s.color}`}>{s.icon}</span>
            <div className="serif text-3xl font-extrabold">{s.isDate ? new Date(s.value as string + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : s.value}</div>
            <div className="text-sm font-medium opacity-60 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { href: "/admin/users", icon: "group", label: "Manage Users", desc: `${totalStudents ?? 0} registered seniors` },
          { href: "/admin/moderation", icon: "fact_check", label: "Review Queue", desc: `${totalPending} items pending`, urgent: totalPending > 0 },
          { href: "/admin/settings", icon: "tune", label: "Platform Settings", desc: "Toggle features & countdown" },
        ].map(card => (
          <Link key={card.href} href={card.href} className={`interactive-card hover-glow pressable group bg-surface-container-lowest p-8 rounded-xl hover:-translate-y-2 transition-all duration-300 editorial-shadow flex flex-col gap-4 ${card.urgent ? "border-2 border-primary/30" : ""}`}>
            <span className={`material-symbols-outlined text-3xl ${card.urgent ? "text-primary" : "text-on-surface-variant"}`}>{card.icon}</span>
            <div>
              <h3 className="font-black text-lg group-hover:text-primary transition-colors">{card.label}</h3>
              <p className="text-on-surface-variant text-sm">{card.desc}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-2 transition-transform mt-auto">arrow_forward</span>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="serif text-xl font-bold">Moderation Load</h3>
            <span className="text-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
              Live snapshot
            </span>
          </div>
          <div className="space-y-4">
            {moderationBars.map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold">{bar.label}</span>
                  <span className="text-on-surface-variant">{bar.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className={`h-full ${bar.color} transition-all duration-700`}
                    style={{ width: `${(bar.value / maxModeration) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl">
          <h3 className="serif text-xl font-bold mb-4">Operations Signals</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
              <span className="text-sm font-semibold">Queue Pressure</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${totalPending > 10 ? "bg-red-100 text-red-700" : totalPending > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                {totalPending > 10 ? "High" : totalPending > 0 ? "Medium" : "Low"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
              <span className="text-sm font-semibold">Student Onboarding</span>
              <span className="text-sm font-bold text-on-surface">{totalStudents ?? 0} accounts</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-4">
              <span className="text-sm font-semibold">Site Health</span>
              <span className="text-sm font-bold text-green-700">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature state */}
      <div className="mt-10 bg-surface-container-lowest p-8 rounded-xl">
        <h3 className="serif text-xl font-bold mb-6">Current Site Permissions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Wall Posts", enabled: settings?.wall_enabled },
            { label: "Uploads", enabled: settings?.uploads_enabled },
            { label: "Voting", enabled: settings?.voting_enabled },
            { label: "Awards Revealed", enabled: settings?.awards_revealed },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
              <div className={`w-3 h-3 rounded-full ${f.enabled ? "bg-green-500" : "bg-red-400"}`} />
              <span className="text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>
        <Link href="/admin/settings" className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-bold hover:underline">
          Edit Settings <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}