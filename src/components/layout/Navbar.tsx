"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

const navLinks = [
  { href: "/directory", label: "Directory" },
  { href: "/wall", label: "The Wall" },
  { href: "/memory-feed", label: "Memory Feed" },
  { href: "/awards", label: "Awards" },
  { href: "/hall-of-thanks", label: "Hall of Thanks" },
];

export default function Navbar({ role, photoUrl }: { role?: string; photoUrl?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openPalette, setOpenPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const allLinks = useMemo(() => (role === "admin" ? [...navLinks, { href: "/admin", label: "Admin" }] : navLinks), [role]);

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
    if (!query.trim()) return allLinks;
    return allLinks.filter((link) => link.label.toLowerCase().includes(query.toLowerCase()));
  }, [allLinks, query]);

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "px-2 pt-2 md:px-4" : "px-3 pt-3 md:px-6"}`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between transition-all duration-500 ease-out ${scrolled ? "section-shell rounded-[1.5rem] px-5 py-2 shadow-sm bg-surface/90 border-outline-variant/30 backdrop-blur-xl" : "section-shell rounded-[2rem] px-4 py-3 md:px-6 shadow-none border-transparent bg-white/40"}`}>
          <Link href="/" className="group flex items-center gap-3">
            <div className="orbital-ring flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-sm font-black text-white">
              26
            </div>
            <div className="leading-none">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.34em] text-on-surface-variant">Digital Yearbook</p>
              <p className="serif-heading text-2xl font-semibold text-on-surface">Seniors 2026</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {allLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-on-surface text-white shadow-lg shadow-stone-900/10"
                      : "text-on-surface-variant hover:bg-white/80 hover:text-on-surface"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenPalette(true)}
              className="pill-badge hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:text-on-surface md:flex"
              title="Open command palette"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              <span>Quick nav</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-on-surface">Ctrl K</span>
            </button>
            <Link
              href="/profile"
              className="pill-badge flex h-11 w-11 items-center justify-center rounded-full overflow-hidden text-on-surface-variant transition-colors hover:text-on-surface p-0.5 border border-outline-variant/20 relative"
              title="My Profile"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="My Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined absolute text-[22px]">person</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {openPalette && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/35 px-4 pt-28 backdrop-blur-sm" onClick={() => setOpenPalette(false)}>
          <div className="section-shell w-full max-w-xl overflow-hidden rounded-[2rem]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-outline-variant/20 px-4 py-3">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pages..."
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {paletteLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setOpenPalette(false);
                    setQuery("");
                  }}
                  className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-surface-container-low"
                >
                  <span>{link.label}</span>
                  <span className="text-on-surface-variant">{link.href}</span>
                </Link>
              ))}
              {paletteLinks.length === 0 && (
                <p className="px-4 py-6 text-sm text-on-surface-variant text-center">No pages match this search.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
