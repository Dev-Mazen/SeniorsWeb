"use client";
import { useEffect, useState } from "react";

export default function GlobalScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!showScrollTop) return null;

  return (
    <div className="fixed z-[99] bottom-20 md:bottom-6 left-6 pointer-events-none flex flex-col items-start">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-surface-container-lowest shadow-xl border border-outline-variant/20 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:scale-110 active:scale-95 transition-all pointer-events-auto"
        title="Scroll to top"
      >
        <span className="material-symbols-outlined text-xl md:text-2xl">keyboard_arrow_up</span>
      </button>
    </div>
  );
}
