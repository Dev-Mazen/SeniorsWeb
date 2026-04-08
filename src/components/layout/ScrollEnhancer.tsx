"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useState } from "react";

export default function ScrollEnhancer() {
  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 25,
    mass: 0.2,
  });
  const [showTop, setShowTop] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowTop(latest > 520);
  });

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-[140] h-1 w-full origin-left bg-gradient-to-r from-primary via-secondary to-tertiary"
        style={{ scaleX: smoothProgress }}
      />

      {showTop && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="pressable fixed bottom-24 right-5 md:bottom-8 z-[130] h-11 w-11 rounded-full bg-primary text-white shadow-xl hover:bg-primary/90"
          aria-label="Back to top"
          title="Back to top"
        >
          <span className="material-symbols-outlined">north</span>
        </motion.button>
      )}
    </>
  );
}
