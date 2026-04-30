/* eslint-disable */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  const { scrollYProgress } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.35], [0, 120]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.25], [0, -40]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0.5]);
  const countdownY = useTransform(scrollYProgress, [0, 0.4], [50, 0]);

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
      <div className="bg-background min-h-screen">
      {/* Global Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-[0.03]" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>

      {/* Hero Section */}
      <section className="relative h-[100svh] w-full overflow-hidden border-b border-outline-variant/5">
        <div className="absolute inset-0 bg-surface-container-lowest">
          <motion.img 
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.6 }}
            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: heroImageY }}
            alt="Senior Year Hero" 
            className="w-full h-full object-cover mix-blend-luminosity grayscale-[0.5] dark:grayscale-0 dark:opacity-40" 
            src="/stitch-assets/home_img_0.jpg"
          />
        </div>
        
        {/* Animated Light Blobs - Refined for both modes */}
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[150px] bg-primary/10 dark:bg-primary/20 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
        <motion.div animate={{ scale: [1, 1.4, 1], rotate: [0, -90, 0], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] bg-secondary/10 dark:bg-secondary/20 pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 dark:opacity-80" />
        
        <motion.div
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }} 
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-outline-variant/20 bg-surface-container-low/40 backdrop-blur-xl mb-10 shadow-sm"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_var(--color-primary)]"></span>
            <span className="text-on-surface font-black tracking-[0.4em] uppercase text-[10px]">The Final Chapter</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }} 
            className="text-7xl md:text-9xl lg:text-[11rem] text-on-surface font-black tracking-tighter leading-[0.8] serif mb-10 drop-shadow-sm"
          >
            Seniors <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary italic pr-6 pb-2">2026</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8, duration: 1 }} 
            className="max-w-2xl text-on-surface-variant/80 text-lg md:text-2xl font-body leading-relaxed mb-14 font-medium text-balance"
          >
            A curated digital archive for our final journey together. Preserving moments, celebrating milestones, and counting down to the beginning of forever.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}>
            <Link href="/directory" className="group relative inline-flex items-center justify-center px-10 py-5 font-black tracking-[0.2em] uppercase text-xs rounded-full overflow-hidden w-full sm:w-auto shadow-xl transition-all hover:shadow-primary/20 hover:-translate-y-1">
              <span className="absolute inset-0 bg-on-surface dark:bg-primary transition-all duration-500 group-hover:scale-105"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]"></span>
              <span className="relative z-10 text-surface dark:text-on-primary flex items-center gap-4">
                Start Curating
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-500">north_east</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[9px] tracking-[0.4em] uppercase font-black text-on-surface-variant/40">Scroll</span>
          <div className="w-[1px] h-14 bg-gradient-to-b from-primary/50 to-transparent"></div>
        </motion.div>
      </section>

      {/* Countdown Section (Glassmorphism) */}
      <motion.section
        style={{ y: countdownY }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-20 px-6 md:px-12 -mt-24 z-20 relative max-w-[1440px] mx-auto"
      >
        <div className="section-shell rounded-[3rem] p-12 md:p-20 shadow-3xl overflow-hidden relative group/countdown">
          <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          <div className="flex flex-col xl:flex-row items-center justify-between gap-16 relative z-10">
            <div className="text-center xl:text-left max-w-xl">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary uppercase text-[10px] font-black tracking-widest mb-6 border border-primary/15 shadow-sm">Milestone Archive</span>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black serif-heading text-on-surface leading-[1] mb-8 tracking-tighter">The Final <br/><span className="text-primary italic">Countdown</span></h2>
              <p className="text-on-surface-variant font-medium text-xl leading-relaxed text-balance opacity-80">Until the day we walk across the stage. Every second counts, every memory matters in the archive.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full xl:w-auto">
              {Object.entries(timer).map(([label, val]) => (
                <div key={label} className="group relative flex flex-col items-center bg-surface-container-high/40 backdrop-blur-2xl rounded-[2rem] p-8 border border-outline-variant/10 hover:border-primary/40 transition-all duration-700 hover:bg-surface-container-high/60 overflow-hidden hover:-translate-y-3 shadow-lg hover:shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <span className="text-5xl md:text-6xl lg:text-7xl font-black serif text-on-surface tracking-tighter mb-3 relative z-10">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={val}
                        initial={{ opacity: 0, y: -20, filter: "blur(12px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, filter: "blur(12px)" }}
                        transition={{ duration: 0.5, ease: "anticipate" }}
                        className="inline-block"
                      >
                        {String(val).padStart(label === "Days" && val > 99 ? 3 : 2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="font-black tracking-[0.3em] text-[11px] uppercase text-on-surface-variant/60 group-hover:text-primary transition-colors relative z-10">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Navigation Cards (Asymmetric Editorial Grid) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="py-40 px-6 max-w-full overflow-hidden"
      >
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Card 1: Directory */}
          <Link href="/directory" className="md:col-span-4 group cursor-pointer block h-full">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] h-[550px] md:h-full min-h-[450px] shadow-2xl transition-all duration-1000 hover:shadow-primary/25 hover:-translate-y-3 ring-1 ring-outline-variant/10">
              <img alt="Browse Directory" className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 mix-blend-luminosity dark:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-[0.23,1,0.32,1]" src="/stitch-assets/home_img_1.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="absolute top-8 right-8 w-14 h-14 rounded-full border border-on-surface/10 bg-surface/30 backdrop-blur-xl flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-700 overflow-hidden shadow-lg group-hover:bg-primary group-hover:border-primary/20">
                 <span className="material-symbols-outlined text-on-surface/60 text-2xl group-hover:-translate-y-12 group-hover:text-white transition-all duration-500">arrow_forward</span>
                 <span className="material-symbols-outlined text-white text-2xl absolute translate-y-12 group-hover:translate-y-0 transition-all duration-500">arrow_forward</span>
              </div>
              <div className="absolute bottom-0 left-0 p-10 md:p-12 w-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-8 h-[2px] bg-primary rounded-full"></span>
                  <span className="text-on-surface text-[11px] font-black tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">Database</span>
                </div>
                <h3 className="text-4xl lg:text-5xl font-black text-on-surface serif-heading mb-6 leading-tight tracking-tighter">Browse <br/>Directory</h3>
                <div className="h-0 group-hover:h-24 transition-all duration-700 ease-[0.23,1,0.32,1] overflow-hidden opacity-0 group-hover:opacity-100">
                  <p className="text-on-surface-variant font-medium text-base leading-relaxed transform translate-y-6 group-hover:translate-y-0 transition-all duration-700 delay-100">
                    Find your friends, browse by club, and see where everyone is heading next in their post-grad journey.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 2: The Wall (Centerpiece) */}
          <Link href="/wall" className="md:col-span-5 group cursor-pointer block h-full">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] h-[650px] shadow-3xl transition-all duration-1000 hover:shadow-secondary/25 hover:-translate-y-3 ring-1 ring-outline-variant/15 bg-surface-container">
              <img alt="View The Wall" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-[0.23,1,0.32,1] saturate-[0.2] dark:saturate-50 group-hover:saturate-100 opacity-60 group-hover:opacity-100" src="/stitch-assets/home_img_2.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-95 group-hover:opacity-60 transition-opacity duration-700"></div>
              
              <div className="absolute top-8 right-8 w-14 h-14 rounded-full border border-on-surface/10 bg-surface/30 backdrop-blur-xl flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-700 overflow-hidden shadow-lg group-hover:bg-secondary group-hover:border-secondary/20">
                 <span className="material-symbols-outlined text-on-surface/60 text-2xl group-hover:-translate-y-12 group-hover:text-white transition-all duration-500">arrow_forward</span>
                 <span className="material-symbols-outlined text-white text-2xl absolute translate-y-12 group-hover:translate-y-0 transition-all duration-500">arrow_forward</span>
              </div>

              <div className="absolute bottom-0 left-0 p-10 md:p-14 w-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-8 h-[2px] bg-secondary rounded-full"></span>
                  <span className="text-on-surface text-[11px] font-black tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">Collaborative</span>
                </div>
                <h3 className="text-5xl lg:text-6xl font-black text-on-surface serif-heading mb-8 tracking-tighter leading-[0.9]">The Social <br/><span className="text-secondary italic">Wall</span></h3>
                <p className="text-on-surface-variant font-medium text-lg leading-relaxed mb-10 max-w-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    Leave your mark. Sign yearbooks digitally, post notes of gratitude, and see the collective pulse of the class.
                </p>
                <div className="flex items-center gap-5 bg-surface/40 backdrop-blur-2xl rounded-3xl p-5 border border-outline-variant/15 w-max shadow-xl group-hover:border-secondary/30 transition-all duration-700">
                  <div className="flex -space-x-4">
                    {[3, 4, 1].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full ring-4 ring-background bg-surface-container overflow-hidden transition-transform hover:scale-110 hover:z-10 cursor-pointer">
                        <img alt="User" src={`/stitch-assets/home_img_${i}.jpg`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full ring-4 ring-background bg-secondary text-white flex items-center justify-center text-xs font-black tracking-tighter shadow-inner hover:scale-110 hover:z-10 cursor-pointer">+24</div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-on-surface text-xs font-black uppercase tracking-widest leading-none mb-1">Active Now</span>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] opacity-70">Live Feed</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 3: Memory Feed */}
          <Link href="/memory-feed" className="md:col-span-3 group cursor-pointer block h-full">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2.5rem] h-[550px] md:h-full min-h-[450px] shadow-2xl transition-all duration-1000 hover:shadow-tertiary/25 hover:-translate-y-3 ring-1 ring-outline-variant/10">
              <img alt="Memory Feed" className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 mix-blend-luminosity dark:mix-blend-normal group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-[0.23,1,0.32,1]" src="/stitch-assets/home_img_5.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700"></div>
              
              <div className="absolute top-8 right-8 w-14 h-14 rounded-full border border-on-surface/10 bg-surface/30 backdrop-blur-xl flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-all duration-700 overflow-hidden shadow-lg group-hover:bg-tertiary group-hover:border-tertiary/20">
                 <span className="material-symbols-outlined text-on-surface/60 text-2xl group-hover:-translate-y-12 group-hover:text-white transition-all duration-500">arrow_forward</span>
                 <span className="material-symbols-outlined text-white text-2xl absolute translate-y-12 group-hover:translate-y-0 transition-all duration-500">arrow_forward</span>
              </div>

              <div className="absolute bottom-0 left-0 p-10 md:p-12 w-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-8 h-[2px] bg-tertiary rounded-full"></span>
                  <span className="text-on-surface text-[11px] font-black tracking-[0.3em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">Archive</span>
                </div>
                <h3 className="text-4xl lg:text-5xl font-black text-on-surface serif-heading mb-8 tracking-tighter">Memory <br/>Archive</h3>
                <div className="w-16 h-16 rounded-3xl bg-surface/30 backdrop-blur-2xl border border-on-surface/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-tertiary group-hover:border-transparent transition-all duration-700 shadow-xl group-hover:rotate-12">
                  <span className="material-symbols-outlined text-on-surface group-hover:text-white text-3xl">auto_awesome</span>
                </div>
              </div>
            </motion.div>
          </Link>
          
        </motion.div>
      </motion.section>

      {/* Signature Editorial Quote */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="py-40 bg-surface-container relative overflow-hidden flex flex-col items-center justify-center text-center px-10 border-y border-outline-variant/10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <span className="material-symbols-outlined text-primary mb-12 text-7xl opacity-90 drop-shadow-sm" style={{fontVariationSettings:"'FILL' 1"}}>format_quote</span>
        <blockquote className="text-5xl md:text-6xl lg:text-7xl font-black serif-heading text-on-surface max-w-5xl tracking-tight leading-[1.1] mb-12 relative z-10 text-balance">
            &quot;Yesterday is but today&apos;s memory, and tomorrow is today&apos;s dream.&quot;
        </blockquote>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-[1px] bg-primary/30"></div>
          <cite className="not-italic font-black tracking-[0.4em] text-[11px] uppercase text-primary">— Khalil Gibran</cite>
          <div className="w-16 h-[1px] bg-primary/30"></div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest py-32 px-10 relative overflow-hidden">
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent"></div>
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-16 relative z-10">
          <div className="max-w-md">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true }}
              className="text-4xl font-black italic text-on-surface mb-8 flex items-center gap-4"
            >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl">school</span>
                </div>
                Seniors &apos;26
            </motion.div>
            <p className="text-on-surface-variant font-medium text-base leading-relaxed opacity-70">
                Designed for the dreamers, the achievers, and the legends in the making. A legacy project for the Class of 2026.
            </p>
          </div>
          
          <motion.div 
             initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true }}
             className="flex flex-col items-start md:items-end gap-4"
          >
             <div className="text-[11px] font-black tracking-[0.4em] text-on-surface-variant/40 uppercase">Platform Status</div>
             <div className="flex items-center gap-4 bg-surface-container-high/50 backdrop-blur-xl px-6 py-3.5 rounded-full border border-outline-variant/10 shadow-sm">
               <span className="relative flex h-3.5 w-3.5">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
               </span>
               <span className="text-on-surface text-sm font-black tracking-widest uppercase">Archive Synchronized</span>
             </div>
             <p className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-[0.2em]">Build v2.4.0 • 2026</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
