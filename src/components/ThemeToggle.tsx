"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-surface-container" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors group"
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      {/* Sun icon */}
      <span 
        className={`material-symbols-outlined text-[1.2rem] absolute transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-amber-600"}`}
      >
        light_mode
      </span>

      {/* Moon icon */}
      <span 
        className={`material-symbols-outlined text-[1.2rem] absolute transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isDark ? "rotate-0 scale-100 opacity-100 text-blue-300" : "-rotate-90 scale-0 opacity-0"}`}
      >
        dark_mode
      </span>

      <span className="sr-only">Toggle Theme</span>
    </button>
  );
}
