"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {showScrollTop && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed z-[120] bottom-24 md:bottom-10 right-8 md:right-12 pointer-events-none"
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] bg-on-surface text-background shadow-2xl flex flex-col items-center justify-center group pointer-events-auto active:scale-90 transition-all overflow-hidden"
            title="Ascend to Archive Header"
          >
            <motion.span 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="material-symbols-outlined text-2xl"
            >
              expand_less
            </motion.span>
            <span className="text-[7px] font-black uppercase tracking-[0.2em] -mt-1 opacity-40 group-hover:opacity-100 transition-opacity">TOP</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
