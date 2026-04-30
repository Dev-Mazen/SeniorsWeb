"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

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
    <nav className="fixed bottom-6 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-center gap-1 rounded-[2.5rem] border border-outline-variant/10 bg-surface-container-lowest/80 px-2 py-2 shadow-2xl backdrop-blur-3xl md:hidden overflow-x-auto hide-scrollbar">
      {tabs.map(({ href, icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex min-w-[64px] flex-1 flex-col items-center justify-center rounded-[2rem] py-3 transition-all duration-500 ${
              isActive ? "text-on-surface" : "text-on-surface-variant/40 hover:text-on-surface-variant"
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="absolute inset-0 bg-surface-container-highest rounded-[1.8rem] -z-10"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              />
            )}
            
            <motion.span 
              animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
              className="material-symbols-outlined text-[24px]"
            >
              {icon}
            </motion.span>
            
            <span className={`mt-1.5 text-[8px] font-black uppercase tracking-[0.2em] ${isActive ? "opacity-100" : "opacity-0 translate-y-1"} transition-all duration-500`}>
              {label}
            </span>

            {isActive && (
              <motion.span 
                layoutId="nav-dot"
                className="absolute -top-1 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
