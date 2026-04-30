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
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]" />
            <p className="text-on-surface-variant/60 font-black uppercase tracking-[0.5em] text-[10px]">Operations Command</p>
          </div>
          <h2 className="serif text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-on-surface via-primary to-primary-container dark:from-white dark:to-primary-fixed drop-shadow-sm pb-2">Dashboard</h2>
          <p className="text-sm font-medium text-on-surface-variant/60 mt-4 max-w-lg leading-relaxed">Synthesizing platform telemetry and moderate stream injections for the Class of 2026 legacy system.</p>
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Temporal Status</span>
            <span className="text-sm font-black text-on-surface tracking-tight uppercase">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <Link href="/admin/content-release" className="group relative flex items-center gap-4 bg-on-surface dark:bg-primary-fixed text-surface dark:text-primary-fixed-dim px-10 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="material-symbols-outlined text-lg group-hover:rotate-[30deg] transition-transform duration-700">rocket_launch</span>
            Initiate Release
          </Link>
        </div>
      </header>

      {/* Analytics Grid - High Precision Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-8 mb-20">
        {stats.map((s, idx) => (
          <div key={s.label} className={`group relative bg-white/40 dark:bg-neutral-950/40 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white dark:border-white/5 transition-all duration-700 hover:-translate-y-3 shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-primary/5 ${s.urgent ? "ring-2 ring-amber-500/30" : ""}`}>
            <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 pointer-events-none rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
               <div className={`${s.color} bg-surface-container-lowest dark:bg-white/5 w-14 h-14 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-xl shadow-black/[0.03] dark:shadow-none`}>
                 <span className="material-symbols-outlined text-2xl block">{s.icon}</span>
               </div>
               {s.urgent && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
            </div>
            
            <div className="relative z-10">
              <div className="serif text-5xl font-black text-on-surface tracking-tighter mb-1 group-hover:text-primary transition-colors duration-500">{s.value}</div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 group-hover:text-on-surface transition-colors duration-500">{s.label}</div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-on-surface/5 rounded-full overflow-hidden">
               <div className={`h-full bg-primary/40 group-hover:w-full transition-all duration-1000`} style={{ width: idx % 2 === 0 ? '40%' : '60%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-12">
        
        <div className="flex flex-col gap-12">
          {/* Moderation Command Hub */}
          <div className="group bg-white/60 dark:bg-neutral-950/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] relative overflow-hidden transition-all duration-700 hover:border-primary/20">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
             
             <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                   <h3 className="serif text-4xl font-black text-on-surface tracking-tight">Moderation Hub</h3>
                   <div className="flex items-center gap-3 mt-2">
                      <span className="w-8 h-0.5 bg-primary/40 rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">Critical Interface Access</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                {quickLinks.map(card => (
                   <Link key={card.href} href={card.href} className="group/link flex items-center justify-between p-8 rounded-[2.5rem] bg-surface-container-low/40 dark:bg-white/5 border border-outline-variant/10 hover:border-primary/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center transition-all duration-700 ${card.urgent ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 animate-pulse" : "bg-white dark:bg-white/5 text-on-surface-variant group-hover/link:bg-primary group-hover/link:text-white shadow-lg shadow-black/[0.02]"}`}>
                         <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="font-black text-xl text-on-surface tracking-tight group-hover/link:translate-x-1 transition-transform">{card.label}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Authorized Access</span>
                       </div>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center opacity-0 group-hover/link:opacity-100 group-hover/link:bg-primary/5 transition-all">
                       <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
                    </div>
                  </Link>
                ))}
             </div>
          </div>

          {/* Activity Stream */}
          <div className="bg-white/60 dark:bg-neutral-950/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] transition-all duration-700">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-lg shadow-secondary/5">
                    <span className="material-symbols-outlined text-3xl">history_edu</span>
                  </div>
                  <div>
                    <h3 className="serif text-4xl font-black tracking-tight text-on-surface">Stream Log</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mt-1">Active Memory Ingestion</p>
                  </div>
                </div>
                <Link href="/admin/moderation/memories" className="px-8 py-3 bg-primary/5 hover:bg-primary hover:text-white text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/10 transition-all duration-500">Analyze All</Link>
             </div>
             <div className="flex flex-col gap-6">
               {[1,2,3].map(i => (
                 <div key={i} className="group flex items-center gap-8 p-8 rounded-[3rem] border border-outline-variant/10 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-500 hover:shadow-xl hover:shadow-black/[0.02]">
                    <div className="w-20 h-20 rounded-[2rem] bg-surface-container-low dark:bg-neutral-900 flex-shrink-0 animate-pulse group-hover:scale-105 transition-transform border border-outline-variant/10 shadow-inner" />
                    <div className="flex-1">
                      <div className="h-6 w-48 bg-surface-container-low dark:bg-neutral-900 rounded-xl mb-3 group-hover:bg-primary/20 transition-colors" />
                      <div className="h-4 w-72 bg-surface-container-low dark:bg-neutral-900 rounded-lg opacity-40" />
                    </div>
                    <div className="flex gap-4">
                       <button className="w-14 h-14 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-500 shadow-lg shadow-green-500/5">
                         <span className="material-symbols-outlined text-2xl font-black">check</span>
                       </button>
                       <button className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-lg shadow-red-500/5">
                         <span className="material-symbols-outlined text-2xl font-black">close</span>
                       </button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-12">
           {/* Timeline - Elegant Vertical Track */}
           <div className="group bg-white/60 dark:bg-neutral-950/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-white dark:border-white/5 shadow-2xl shadow-black/[0.02] relative overflow-hidden transition-all duration-700 hover:border-secondary/20">
              <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/5 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
              <h3 className="serif text-4xl font-black mb-12 text-on-surface tracking-tight">System Events</h3>
              
              <div className="relative border-l-2 border-outline-variant/10 ml-6 space-y-12">
                 {[
                   { action: "Memory Ingested", user: "Jason T.", time: "2m ago", icon: "photo_library", color: "text-secondary" },
                   { action: "Vote Registered", user: "Sarah W.", time: "15m ago", icon: "how_to_vote", color: "text-tertiary" },
                   { action: "Chaos Entry", user: "Michael B.", time: "1h ago", icon: "sticky_note_2", color: "text-amber-500" },
                   { action: "Tribute Sent", user: "Anonymous", time: "2h ago", icon: "school", color: "text-primary" },
                 ].map((t, idx) => (
                   <div key={idx} className="relative pl-12 group/event">
                      <div className={`absolute -left-[23px] top-0 w-11 h-11 rounded-2xl bg-white dark:bg-neutral-950 border border-outline-variant/20 flex items-center justify-center group-hover/event:border-primary group-hover/event:rotate-12 transition-all duration-700 shadow-xl shadow-black/[0.03]`}>
                         <span className={`material-symbols-outlined text-[1.2rem] font-black ${t.color}`}>{t.icon}</span>
                      </div>
                      <p className="text-lg font-black text-on-surface group-hover/event:text-primary transition-colors duration-500 tracking-tight">{t.action}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mt-2 flex items-center gap-3">
                         {t.user} <span className="w-1 h-1 rounded-full bg-on-surface-variant/20" /> {t.time}
                      </p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Precision Health Metrics */}
           <div className="bg-white/80 dark:bg-black p-12 rounded-[4rem] border border-white dark:border-white/5 shadow-[0_30px_70px_rgba(0,0,0,0.04)] relative overflow-hidden group transition-all duration-700 hover:shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <h3 className="serif text-3xl font-black mb-12 text-on-surface tracking-tight">System Status</h3>
              <div className="space-y-10">
                 {[
                   { label: "Graduation Lock", value: settings?.graduation_date ?? "—", icon: "event_available" },
                   { label: "Voting Gateway", value: settings?.voting_enabled ? "Authorized" : "Locked", dot: settings?.voting_enabled ? "bg-green-500" : "bg-red-500", icon: "vpn_key" },
                   { label: "Asset Pipeline", value: settings?.uploads_enabled ? "Active" : "Halted", dot: settings?.uploads_enabled ? "bg-green-500" : "bg-red-500", icon: "hub" },
                 ].map(sys => (
                   <div key={sys.label} className="flex items-center justify-between group/sys">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-on-surface/5 dark:bg-white/5 flex items-center justify-center text-on-surface-variant/40 group-hover/sys:text-primary group-hover/sys:bg-primary/10 group-hover/sys:rotate-12 transition-all duration-500">
                          <span className="material-symbols-outlined text-xl">{sys.icon}</span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40">{sys.label}</span>
                      </div>
                      <div className="flex items-center gap-4 bg-white dark:bg-white/5 px-6 py-2.5 rounded-full border border-outline-variant/10 shadow-sm group-hover/sys:scale-105 transition-all duration-500">
                        {sys.dot && <span className={`w-2.5 h-2.5 rounded-full ${sys.dot} shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-pulse`} />}
                        <span className="font-black text-[11px] tracking-widest uppercase text-on-surface">{sys.value}</span>
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