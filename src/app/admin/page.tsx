import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";

export default async function AdminPage() {
  const supabase = await createClient();
  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: pendingWall },
    { count: pendingMemories },
    { count: pendingTeacherMsgs },
    { count: totalMemories },
    { count: teacherMsgsCount },
    { count: totalVotes },
    { data: settings },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("wall_posts").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("memories").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("teacher_messages").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("memories").select("*", { count: "exact", head: true }),
    supabase.from("teacher_messages").select("*", { count: "exact", head: true }),
    supabase.from("awards_votes").select("*", { count: "exact", head: true }),
    supabase.from("platform_settings").select("*").single(),
  ]);

  const totalPending = (pendingWall ?? 0) + (pendingMemories ?? 0) + (pendingTeacherMsgs ?? 0);

  // Voting metrics logic
  // Assume ~15 categories per student for a rough vote percentage if we don't have distinct student counts.
  const expectedTotalVotes = (totalStudents ?? 1) * 15;
  const votingProgress = Math.min(100, Math.round(((totalVotes ?? 0) / expectedTotalVotes) * 100));

  const stats = [
    { label: "Total Students", value: totalStudents ?? 0, icon: "school", color: "text-primary" },
    { label: "Active Today", value: activeStudents ?? 0, icon: "person_check", color: "text-green-600" },
    { label: "Pending Approvals", value: totalPending, icon: "fact_check", color: "text-amber-600", urgent: totalPending > 0 },
    { label: "Total Memories", value: totalMemories ?? 0, icon: "photo_library", color: "text-secondary" },
    { label: "Votes Submitted", value: `${votingProgress}%`, icon: "how_to_vote", color: "text-tertiary" },
    { label: "Messages Submitted", value: teacherMsgsCount ?? 0, icon: "mail", color: "text-blue-600" },
  ];

  const quickLinks = [
    { href: "/admin/moderation/memories", icon: "photo_library", label: "Memories Moderation" },
    { href: "/admin/moderation/wall", icon: "sticky_note_2", label: "Chaos Board", urgent: (pendingWall ?? 0) > 0 },
    { href: "/admin/voting", icon: "how_to_vote", label: "Voting Control" },
    { href: "/admin/users", icon: "group", label: "Manage Students" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h2 className="serif text-4xl font-bold tracking-tight mb-2">Dashboard Overview</h2>
          <p className="text-on-surface-variant font-medium">Control Center — Class of 2026</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/content-release" className="pressable flex items-center gap-2 bg-stone-900 text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl shadow-black/10">
            <span className="material-symbols-outlined text-lg">rocket_launch</span>
            Content Release
          </Link>
        </div>
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
        {stats.map(s => (
          <div key={s.label} className={`interactive-card bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm relative overflow-hidden ${s.urgent ? "border border-amber-300 ring-1 ring-amber-100" : "border border-outline-variant/20"}`}>
            {s.urgent && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400 blur-2xl opacity-20" />}
            <div className="flex items-start justify-between mb-3 relative z-10">
               <span className={`material-symbols-outlined ${s.color} bg-on-surface/5 p-2 rounded-xl`}>{s.icon}</span>
            </div>
            <div className="serif text-3xl font-extrabold text-on-surface relative z-10">{s.value}</div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mt-2 relative z-10">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        
        {/* Main Content Area */}
        <div className="flex flex-col gap-8">
          
          {/* Action Hub */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 editorial-shadow">
             <h3 className="serif text-2xl font-bold mb-6">Moderation Hub</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map(card => (
                  <Link key={card.href} href={card.href} className="group flex items-center justify-between p-5 rounded-2xl bg-surface-container-low border border-transparent hover:border-outline-variant/30 hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                       <span className={`material-symbols-outlined text-xl ${card.urgent ? "text-amber-600" : "text-on-surface-variant"}`}>{card.icon}</span>
                       <span className="font-bold text-on-surface">{card.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition-all">arrow_forward</span>
                  </Link>
                ))}
             </div>
          </div>

          {/* Quick Review (Recent) */}
          <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 editorial-shadow">
             <div className="flex items-center justify-between mb-6">
                <h3 className="serif text-2xl font-bold">Recent Submissions</h3>
                <Link href="/admin/moderation/memories" className="text-sm font-bold text-primary hover:underline">View All</Link>
             </div>
             <div className="flex flex-col gap-3">
               {/* Skeletons/Placeholders simulating a feed -> to be implemented explicitly later */}
               {[1,2,3].map(i => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-surface-variant flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-surface-variant rounded mb-2" />
                      <div className="h-3 w-48 bg-surface-variant rounded opacity-60" />
                    </div>
                    <div className="flex gap-2">
                       <button className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center hover:bg-green-200 transition-colors">
                         <span className="material-symbols-outlined text-[1rem]">check</span>
                       </button>
                       <button className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center hover:bg-red-200 transition-colors">
                         <span className="material-symbols-outlined text-[1rem]">close</span>
                       </button>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

        {/* Sidebar Space */}
        <div className="flex flex-col gap-8">
           
           {/* Activity Timeline */}
           <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/15 editorial-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
              <h3 className="serif text-2xl font-bold mb-6">Activity Timeline</h3>
              
              <div className="relative border-l-2 border-surface-variant ml-3 space-y-6">
                 {[
                   { action: "New Memory uploaded", user: "Jason T.", time: "2m ago", icon: "photo_library", color: "text-secondary" },
                   { action: "Voted for Most Likely to Succeed", user: "Sarah W.", time: "15m ago", icon: "how_to_vote", color: "text-tertiary" },
                   { action: "Posted on Chaos Board", user: "Michael B.", time: "1h ago", icon: "sticky_note_2", color: "text-amber-600" },
                   { action: "Appreciated Mr. Harris", user: "Anonymous", time: "2h ago", icon: "school", color: "text-primary" },
                 ].map((t, idx) => (
                   <div key={idx} className="relative pl-6">
                      <span className={`material-symbols-outlined absolute -left-[17px] top-0 bg-white rounded-full text-base ${t.color}`}>
                         {t.icon}
                      </span>
                      <p className="text-sm font-semibold text-on-surface">{t.action}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{t.user} • {t.time}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Platform Status */}
           <div className="bg-stone-900 p-8 rounded-[2rem] editorial-shadow text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-transparent via-primary to-transparent" />
              <h3 className="serif text-xl font-bold mb-6">Platform Systems</h3>
              <div className="space-y-4">
                 {[
                   { label: "Graduation Date", value: settings?.graduation_date ?? "—" },
                   { label: "Voting Status", value: settings?.voting_enabled ? "Open" : "Locked", dot: settings?.voting_enabled ? "bg-green-500" : "bg-red-500" },
                   { label: "Media Uploads", value: settings?.uploads_enabled ? "Live" : "Frozen", dot: settings?.uploads_enabled ? "bg-green-500" : "bg-red-500" },
                 ].map(sys => (
                   <div key={sys.label} className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{sys.label}</span>
                      <div className="flex items-center gap-2">
                        {sys.dot && <span className={`w-2 h-2 rounded-full ${sys.dot} animate-pulse`} />}
                        <span className="font-bold text-sm tracking-widest uppercase">{sys.value}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}