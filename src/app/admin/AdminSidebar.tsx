"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const links = [
  { href: "/admin", icon: "dashboard", label: "Overview" },
  { href: "/admin/users", icon: "group", label: "Students" },
  { href: "/admin/moderation/memories", icon: "photo_library", label: "Memories" },
  { href: "/admin/moderation/wall", icon: "sticky_note_2", label: "Chaos Board" },
  { href: "/admin/moderation/teachers", icon: "school", label: "Teachers" },
  { href: "/admin/voting", icon: "how_to_vote", label: "Voting" },
  { href: "/admin/time-capsule", icon: "hourglass_bottom", label: "Capsule" },
  { href: "/admin/content-release", icon: "dynamic_feed", label: "Release" },
  { href: "/admin/settings", icon: "tune", label: "Settings" },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-surface-container-lowest/80 backdrop-blur-3xl shadow-2xl flex flex-col py-10 rounded-r-[4rem] z-50 border-r border-outline-variant/10 transition-all duration-700">
      <div className="px-12 mb-14 relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 blur-3xl rounded-full" 
        />
        <h1 className="serif text-4xl font-black text-on-surface tracking-tighter">Seniors <span className="text-primary italic">26.</span></h1>
        <div className="flex items-center gap-3 mt-3">
           <div className="w-8 h-1 bg-primary/20 rounded-full" />
           <p className="text-[9px] font-black tracking-[0.4em] uppercase text-on-surface-variant/40">Command Center</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar pr-4">
        {links.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="relative group">
              <div className={`ml-8 mr-2 px-8 py-4 flex items-center gap-5 rounded-2xl transition-all duration-500 relative z-10 ${active ? "bg-on-surface text-surface shadow-2xl shadow-primary/10" : "text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface"}`}>
                <span className={`material-symbols-outlined text-xl transition-all duration-500 ${active ? "fill-1 scale-110" : "group-hover:rotate-12"}`}>{icon}</span>
                <span aria-current={active ? "page" : undefined} className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
              </div>
              {active && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-6 inset-y-2 w-1.5 bg-primary rounded-full z-20"
                  transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-8 mt-auto">
        <div className="bg-surface-container-low/40 backdrop-blur-2xl p-6 rounded-[2.5rem] mb-6 flex justify-between items-center border border-outline-variant/10 group/profile">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/profile:bg-on-surface group-hover/profile:text-surface transition-all duration-500">
               <span className="material-symbols-outlined text-2xl">shield_person</span>
            </div>
            <div className="max-w-[80px]">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 mb-1">Custodial</p>
              <p className="font-black text-[10px] text-on-surface tracking-tight truncate">{adminName}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <button onClick={logout} className="w-full py-5 px-10 flex items-center gap-4 rounded-3xl hover:bg-red-500/10 text-on-surface-variant/40 hover:text-red-500 transition-all duration-500 group active:scale-95">
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg">power_settings_new</span>
          <span className="font-black text-[9px] uppercase tracking-[0.3em]">Terminate</span>
        </button>
      </div>
    </aside>
  );
}