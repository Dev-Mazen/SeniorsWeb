"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/directory", label: "Directory", hint: "Classmates, profiles, and shared memories" },
  { href: "/wall", label: "The Wall", hint: "Live notes, messages, and shout-outs" },
  { href: "/memory-feed", label: "Memory Feed", hint: "Photos, videos, and recent archive posts" },
  { href: "/awards", label: "Awards", hint: "Voting, results, and class superlatives" },
  { href: "/hall-of-thanks", label: "Hall of Thanks", hint: "Teacher gratitude and appreciation" },
];

export default function Navbar({ role, photoUrl }: { role?: string; photoUrl?: string | null }) {
  const pathname = usePathname();
  const [openPalette, setOpenPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const allLinks = useMemo(
    () => (role === "admin" ? [...navLinks, { href: "/admin", label: "Admin", hint: "Moderation, settings, and platform controls" }] : navLinks),
    [role],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcutPressed = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (shortcutPressed) {
        event.preventDefault();
        setOpenPalette((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpenPalette(false);
      }
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const paletteLinks = useMemo(() => {
    if (!deferredQuery.trim()) return allLinks;
    const normalized = deferredQuery.toLowerCase();
    return allLinks.filter((link) => `${link.label} ${link.hint} ${link.href}`.toLowerCase().includes(normalized));
  }, [allLinks, deferredQuery]);

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-700 ${scrolled ? "px-2 pt-3 md:px-6" : "px-4 pt-4 md:px-8"}`}>
        <div 
          className={`mx-auto flex max-w-7xl items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            scrolled 
              ? "section-shell rounded-full px-6 py-2.5 shadow-2xl bg-surface-container-lowest/70 dark:bg-surface-container-low/60 border-outline-variant/10 backdrop-blur-3xl ring-1 ring-white/5" 
              : "px-4 py-2 border-transparent bg-transparent"
          }`}
        >
          <Link href="/" className="group flex items-center gap-4">
            <div className="orbital-ring flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-sm font-black text-white shadow-lg shadow-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              26
            </div>
            <div className="leading-none transition-all duration-500 group-hover:translate-x-1.5">
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-on-surface-variant/60 group-hover:text-primary transition-colors">Class of</p>
              <p className="serif-heading text-2xl font-black text-on-surface tracking-tight group-hover:tracking-normal">Seniors</p>
            </div>
          </Link>

          <nav id="tour-navigation" className="hidden items-center gap-1.5 lg:flex">
            {allLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative rounded-full px-5 py-2.5 text-sm font-bold tracking-tight transition-all duration-500 overflow-hidden group/link ${
                    active
                      ? "text-primary-fixed-dim bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/20"
                      : "text-on-surface-variant/70 hover:text-on-surface hover:bg-surface-container-high/50"
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                  {active && (
                    <motion.div 
                      layoutId="nav-glow" 
                      className="absolute inset-0 bg-primary/10 dark:bg-primary/20 blur-xl"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/link:translate-x-full transition-transform duration-1000" />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setOpenPalette(true);
                setQuery("");
              }}
              className="pill-badge hidden items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold text-on-surface-variant transition-all duration-500 hover:text-on-surface hover:bg-surface-container-high/80 hover:scale-105 active:scale-95 md:flex border border-outline-variant/10 shadow-sm"
              title="Open command palette"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span className="tracking-wide">Quick nav</span>
              <span className="rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-black text-on-surface/50 border border-outline-variant/5">⌘ K</span>
            </button>
            
            <div className="h-6 w-[1px] bg-outline-variant/20 hidden md:block" />
            
            <ThemeToggle />
            
            <Link
              href="/profile"
              className="pill-badge flex h-11 w-11 items-center justify-center rounded-full overflow-hidden text-on-surface-variant transition-all duration-500 hover:scale-110 active:scale-90 p-0.5 border border-outline-variant/15 relative group shadow-sm hover:shadow-md hover:border-primary/30"
              title="My Profile"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="My Profile" className="w-full h-full rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
              ) : (
                <span className="material-symbols-outlined absolute text-[24px]">person</span>
              )}
              <div className="absolute inset-0 rounded-full border-2 border-primary scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {openPalette && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-start justify-center bg-background/40 px-4 pt-32 backdrop-blur-md" 
            onClick={() => setOpenPalette(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="section-shell w-full max-w-xl overflow-hidden rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] bg-surface-container-lowest/90 dark:bg-surface-container-low/95 border-outline-variant/10" 
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-outline-variant/10 px-6 py-5">
                <span className="material-symbols-outlined text-primary scale-110">search</span>
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Type to find anything..."
                  className="w-full bg-transparent outline-none text-base font-medium text-on-surface placeholder:text-on-surface-variant/40"
                />
                <button 
                  onClick={() => setOpenPalette(false)}
                  className="p-1.5 rounded-full hover:bg-surface-container-high/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
                </button>
              </div>
              
              <div className="max-h-[28rem] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-outline-variant/20">
                <div className="px-4 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-2">Navigation</p>
                  {paletteLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setOpenPalette(false);
                        setQuery("");
                      }}
                      className="group flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:translate-x-1"
                    >
                      <div className="min-w-0">
                        <p className={`font-bold transition-colors ${pathname === link.href ? "text-primary" : "text-on-surface group-hover:text-primary"}`}>{link.label}</p>
                        <p className="truncate text-xs text-on-surface-variant/70 font-medium">{link.hint}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pathname === link.href && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>
                        )}
                        <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary/50 group-hover:translate-x-1 transition-all">chevron_right</span>
                      </div>
                    </Link>
                  ))}
                  {paletteLinks.length === 0 && (
                    <div className="px-4 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-3 block">search_off</span>
                      <p className="text-sm text-on-surface-variant/60 font-medium">No results found for &quot;{query}&quot;</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-surface-container-low/50 dark:bg-surface-container/50 border-t border-outline-variant/5 px-6 py-3 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/40">
                      <kbd className="bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/10">ESC</kbd> to close
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/40">
                      <kbd className="bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/10">↵</kbd> to select
                    </div>
                 </div>
                 <p className="text-[10px] font-black tracking-widest text-primary/40 uppercase">Seniors Console</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
