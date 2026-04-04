"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { PlatformSettings, Profile } from "@/types/database";

function useCountdown(targetDate: string) {
  const [time, setTime] = useState({ Days: 0, Hours: 0, Mins: 0, Secs: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTime({ Days: 0, Hours: 0, Mins: 0, Secs: 0 }); return; }
      setTime({
        Days: Math.floor(diff / 86400000),
        Hours: Math.floor((diff % 86400000) / 3600000),
        Mins: Math.floor((diff % 3600000) / 60000),
        Secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

export default function HomeClient({ settings, profile }: { settings: PlatformSettings | null; profile: Pick<Profile,"full_name"|"role"> | null }) {
  const grad = settings?.graduation_date ?? "2026-05-24";
  const timer = useCountdown(grad);

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[870px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeOut" }}
            alt="Senior Year Hero" 
            className="w-full h-full object-cover" 
            src="/stitch-assets/home_img_0.jpg"
          />
        </div>
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-primary font-body tracking-[0.3em] uppercase text-sm mb-6 font-bold">
            The Final Chapter
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-6xl md:text-8xl lg:text-9xl text-on-surface font-black tracking-tight leading-[0.9] serif-heading mb-8">
            Welcome,<br/>Class of 2026
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="max-w-2xl text-on-surface-variant text-lg md:text-xl font-body leading-relaxed mb-12">
            A curated digital archive for our final journey together. Preserving moments, celebrating milestones, and counting down to the beginning of forever.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-wrap justify-center gap-6">
            <Link href="/directory" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-full text-lg shadow-xl hover:scale-105 transition-transform active:scale-95">
              Start Curating
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md">
            <h2 className="text-4xl md:text-5xl font-black serif-heading text-on-surface leading-tight mb-4">The Final Countdown</h2>
            <p className="text-on-surface-variant font-body">Until the day we walk across the stage. Every second counts, every memory matters.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {Object.entries(timer).map(([label, val]) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-primary/20 flex items-center justify-center bg-surface-container-lowest shadow-sm relative overflow-hidden group">
                  <span className="text-3xl md:text-5xl font-black serif-heading text-primary relative z-10">
                    {String(val).padStart(label === "Days" && val > 99 ? 3 : 2, "0")}
                  </span>
                  <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                </div>
                <span className="mt-4 font-label tracking-widest text-xs uppercase font-bold text-on-surface-variant">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Cards (Asymmetric Editorial Grid) */}
      <section className="py-32 px-8 max-w-full overflow-hidden">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-end">
          
          {/* Card 1: Directory */}
          <Link href="/directory" className="md:col-span-4 group cursor-pointer block">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-xl h-[500px] shadow-xl transition-all duration-500 hover:-translate-y-4">
              <img alt="Browse Directory" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="/stitch-assets/home_img_1.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-on-surface/90 via-on-surface/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-[1px] bg-primary"></span>
                  <span className="text-primary-fixed text-xs font-bold tracking-[0.2em] uppercase">Connect</span>
                </div>
                <h3 className="text-3xl font-bold text-surface-container-lowest serif-heading mb-4">Browse Directory</h3>
                <p className="text-surface-variant/80 text-sm font-body leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Find your friends, browse by club, and see where everyone is heading next.
                </p>
                <span className="material-symbols-outlined text-surface-container-lowest">arrow_forward</span>
              </div>
            </motion.div>
          </Link>

          {/* Card 2: The Wall (Centerpiece) */}
          <Link href="/wall" className="md:col-span-5 group cursor-pointer pb-20 block">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-xl h-[600px] shadow-2xl transition-all duration-500 hover:-translate-y-4">
              <img alt="View The Wall" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="/stitch-assets/home_img_2.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-[1px] bg-secondary-container"></span>
                  <span className="text-secondary-fixed text-xs font-bold tracking-[0.2em] uppercase">Collaborate</span>
                </div>
                <h3 className="text-4xl font-black text-surface-container-lowest serif-heading mb-4">View The Wall</h3>
                <p className="text-surface-variant/80 text-base font-body leading-relaxed mb-6">
                    Leave your mark. Sign yearbooks digitally, post notes of gratitude, and see the collective pulse of the class.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-stone-300 overflow-hidden">
                      <img alt="User" src="/stitch-assets/home_img_3.jpg" />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-stone-400 overflow-hidden">
                      <img alt="User" src="/stitch-assets/home_img_4.jpg" />
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-surface bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">+24</div>
                  </div>
                  <span className="text-surface-variant/80 text-sm font-medium">Just posted today</span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 3: Memory Feed */}
          <Link href="/memory-feed" className="md:col-span-3 group cursor-pointer pt-32 block">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-xl h-[450px] shadow-lg transition-all duration-500 hover:-translate-y-4">
              <img alt="Memory Feed" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="/stitch-assets/home_img_5.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-tertiary/90 via-tertiary/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-[1px] bg-tertiary-fixed"></span>
                  <span className="text-tertiary-fixed text-xs font-bold tracking-[0.2em] uppercase">Archive</span>
                </div>
                <h3 className="text-2xl font-bold text-surface-container-lowest serif-heading mb-4">Memory Feed</h3>
                <span className="material-symbols-outlined text-surface-container-lowest bg-surface-container-lowest/10 p-3 rounded-full">auto_awesome</span>
              </div>
            </motion.div>
          </Link>
          
        </motion.div>
      </section>

      {/* Signature Editorial Quote */}
      <section className="py-24 bg-surface flex flex-col items-center justify-center text-center px-8 border-y border-outline-variant/10">
        <span className="material-symbols-outlined text-primary mb-8 text-5xl" style={{fontVariationSettings:"'FILL' 1"}}>format_quote</span>
        <blockquote className="text-3xl md:text-5xl font-black serif-heading text-on-surface max-w-4xl leading-tight mb-8">
            "Yesterday is but today's memory, and tomorrow is today's dream."
        </blockquote>
        <cite className="not-italic font-label tracking-widest text-sm uppercase text-primary font-bold">— Khalil Gibran</cite>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="text-xl font-black italic text-stone-900 mb-6 font-headline">
                Seniors 2026
            </div>
            <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                Designed for the dreamers, the achievers, and the legends in the making. Our time is now.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
