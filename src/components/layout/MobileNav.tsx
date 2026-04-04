"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/wall", icon: "dashboard_customize", label: "Wall" },
  { href: "/memory-feed", icon: "auto_awesome", label: "Memories" },
  { href: "/directory", icon: "group", label: "Directory" },
  { href: "/time-capsule", icon: "hourglass_top", label: "Capsule" },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center px-4 py-3 border-t border-stone-200/10 bg-white/80 backdrop-blur-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)] rounded-t-[2rem]">
      {tabs.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-full transition-all ${
            pathname === href ? "bg-orange-100 text-primary" : "text-stone-400"
          }`}
        >
          <span className="material-symbols-outlined text-xl">{icon}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
