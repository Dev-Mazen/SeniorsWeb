"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/directory", icon: "groups", label: "Directory" },
  { href: "/wall", icon: "dashboard_customize", label: "Wall" },
  { href: "/memory-feed", icon: "auto_awesome", label: "Memories" },
  { href: "/awards", icon: "emoji_events", label: "Awards" },
  { href: "/hall-of-thanks", icon: "volunteer_activism", label: "Thanks" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-3 left-1/2 z-[100] flex w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 items-center gap-1 rounded-[2rem] border border-white/60 bg-white/80 px-3 py-2 shadow-[0_18px_40px_-20px_rgba(28,28,25,0.3)] backdrop-blur-2xl md:hidden overflow-x-auto hide-scrollbar">
      {tabs.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`relative flex min-w-[58px] flex-col items-center justify-center rounded-[1.25rem] px-3 py-2 transition-all ${
            pathname === href ? "bg-stone-900 text-white shadow-lg shadow-stone-900/15" : "text-stone-500"
          }`}
        >
          {pathname === href && <span className="absolute -top-1 h-1.5 w-1.5 rounded-full bg-primary" />}
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em]">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
