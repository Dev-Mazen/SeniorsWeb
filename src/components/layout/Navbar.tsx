"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/wall", label: "The Wall" },
  { href: "/memory-feed", label: "Memory Feed" },
  { href: "/awards", label: "Awards" },
  { href: "/hall-of-thanks", label: "Hall of Thanks" },
  { href: "/time-capsule", label: "Time Capsule" },
];

export default function Navbar({ role }: { role?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="bg-white/70 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-black italic text-on-surface serif">Seniors 2026</Link>
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`font-medium transition-colors duration-200 text-sm ${
                pathname === href
                  ? "text-primary font-bold border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </Link>
          ))}
          {role === "admin" && (
            <Link href="/admin" className="text-secondary font-bold text-sm hover:text-secondary/80 transition-colors">
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center space-x-2">
          <button onClick={handleLogout} className="p-2 hover:bg-surface-container rounded-full transition-all" title="Sign out">
            <span className="material-symbols-outlined text-on-surface-variant">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
