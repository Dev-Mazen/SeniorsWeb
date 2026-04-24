"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/admin", icon: "dashboard", label: "Overview" },
  { href: "/admin/users", icon: "group", label: "Students Management" },
  { href: "/admin/moderation/memories", icon: "photo_library", label: "Memories Moderation" },
  { href: "/admin/moderation/wall", icon: "sticky_note_2", label: "Chaos Board Moderation" },
  { href: "/admin/moderation/teachers", icon: "school", label: "Teacher Messages" },
  { href: "/admin/voting", icon: "how_to_vote", label: "Voting Control" },
  { href: "/admin/time-capsule", icon: "hourglass_bottom", label: "Time Capsule Settings" },
  { href: "/admin/content-release", icon: "dynamic_feed", label: "Content Release Config" },
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
    <aside className="fixed left-0 top-0 h-screen w-72 bg-surface shadow-2xl flex flex-col py-8 gap-2 rounded-r-[3rem] z-50 border-r border-outline-variant/10">
      <div className="px-8 mb-8">
        <h1 className="serif text-xl font-black text-primary">Seniors &apos;26</h1>
        <p className="text-xs font-bold tracking-widest uppercase opacity-50">Admin Center</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`mx-4 px-6 py-3 flex items-center gap-3 rounded-full transition-all ${active ? "bg-gradient-to-r from-primary to-primary-container text-white" : "text-on-surface/70 hover:bg-surface-container-low"}`}>
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 mt-auto">
        <div className="bg-surface-container-low p-4 rounded-xl mb-4 flex justify-between items-center">
          <div>
            <p className="text-xs opacity-60 mb-1">Signed in as</p>
            <p className="font-bold text-sm">{adminName}</p>
          </div>
          <ThemeToggle />
        </div>
        <button onClick={logout} className="w-full py-3 px-6 flex items-center gap-3 rounded-full hover:bg-surface-container-low text-on-surface/70 transition-all">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}