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
    <div className="bg-surface-container-lowest">
      {/* Global Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-[0.03]" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>

      {/* Hero Section */}
      <section className="relative h-[100svh] w-full overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-black">
          <motion.img 
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.5 }}
            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: heroImageY }}
            alt="Senior Year Hero" 
            className="w-full h-full object-cover mix-blend-luminosity" 
            src="/stitch-assets/home_img_0.jpg"
          />
        </div>
        
        {/* Animated Light Blobs */}
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full blur-[150px] bg-primary/20 pointer-events-none mix-blend-screen" />
        <motion.div animate={{ scale: [1, 1.4, 1], rotate: [0, -90, 0], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] bg-secondary/20 pointer-events-none mix-blend-screen" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
        
        <motion.div
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }} 
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)] shadow-primary"></span>
            <span className="text-white font-body tracking-[0.3em] uppercase text-xs font-bold">The Final Chapter</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }} 
            className="text-6xl md:text-8xl lg:text-[10rem] text-white font-black tracking-tighter leading-[0.85] serif mb-8 drop-shadow-2xl"
          >
            Seniors <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ffb0a3] to-secondary italic pr-4">2026</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.8, duration: 1 }} 
            className="max-w-2xl text-white/70 text-lg md:text-xl font-body leading-relaxed mb-12 font-medium"
          >
            A curated digital archive for our final journey together. Preserving moments, celebrating milestones, and counting down to the beginning of forever.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}>
            <Link href="/directory" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold tracking-widest uppercase text-sm rounded-full overflow-hidden w-full sm:w-auto">
              <span className="absolute inset-0 bg-white group-hover:bg-primary transition-colors duration-500"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]"></span>
              <span className="relative z-10 text-black group-hover:text-white transition-colors duration-500 flex items-center gap-3">
                Start Curating
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">north_east</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-widest uppercase font-black text-white/50">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
        </motion.div>
      </section>

      {/* Countdown Section (Glassmorphism) */}
      <motion.section
        style={{ y: countdownY }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-16 px-6 md:px-12 -mt-16 z-20 relative max-w-[1400px] mx-auto"
      >
        <div className="bg-surface/60 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-10 md:p-16 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay"></div>
          
          <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
            <div className="text-center xl:text-left max-w-xl">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary uppercase text-[10px] font-black tracking-widest mb-4 border border-primary/20">Milestone</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black serif-heading text-on-surface leading-[1.1] mb-6">The Final <br/><span className="text-primary italic">Countdown</span></h2>
              <p className="text-on-surface-variant font-body text-lg leading-relaxed text-balance">Until the day we walk across the stage. Every second counts, every memory matters.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full xl:w-auto">
              {Object.entries(timer).map(([label, val]) => (
                <div key={label} className="group relative flex flex-col items-center bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-primary/30 transition-all duration-500 hover:bg-white/10 overflow-hidden hover:-translate-y-2 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="text-4xl md:text-5xl lg:text-6xl font-black serif text-on-surface tracking-tighter mb-2 relative z-10">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={val}
                        initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        transition={{ duration: 0.3 }}
                        className="inline-block"
                      >
                        {String(val).padStart(label === "Days" && val > 99 ? 3 : 2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="font-label tracking-[0.2em] text-[10px] uppercase font-bold text-on-surface-variant group-hover:text-primary transition-colors relative z-10">{label}</span>
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
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="py-32 px-6 max-w-full overflow-hidden"
      >
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Card 1: Directory */}
          <Link href="/directory" className="md:col-span-4 group cursor-pointer block h-full">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] h-[500px] md:h-full min-h-[400px] shadow-xl transition-all duration-700 hover:shadow-primary/20 hover:-translate-y-2">
              <img alt="Browse Directory" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 mix-blend-multiply group-hover:grayscale-0 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1]" src="/stitch-assets/home_img_1.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                 <span className="material-symbols-outlined text-white/50 text-xl group-hover:-translate-y-8 transition-transform">arrow_forward</span>
                 <span className="material-symbols-outlined text-white text-xl absolute translate-y-8 group-hover:translate-y-0 transition-transform">arrow_forward</span>
              </div>
              <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-[2px] bg-primary rounded-full"></span>
                  <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">Connect</span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white serif-heading mb-4 leading-tight">Browse <br/>Directory</h3>
                <div className="h-0 group-hover:h-20 transition-all duration-500 overflow-hidden">
                  <p className="text-white/70 text-sm font-body leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    Find your friends, browse by club, and see where everyone is heading next.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 2: The Wall (Centerpiece) */}
          <Link href="/wall" className="md:col-span-5 group cursor-pointer block h-full">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] h-[600px] shadow-2xl transition-all duration-700 hover:shadow-secondary/20 hover:-translate-y-2 ring-1 ring-white/10">
              <img alt="View The Wall" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[0.16,1,0.3,1] saturate-50 group-hover:saturate-100" src="/stitch-assets/home_img_2.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                 <span className="material-symbols-outlined text-white/50 text-xl group-hover:-translate-y-8 transition-transform">arrow_forward</span>
                 <span className="material-symbols-outlined text-white text-xl absolute translate-y-8 group-hover:translate-y-0 transition-transform">arrow_forward</span>
              </div>

              <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full bg-gradient-to-t from-black via-black/50 to-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-[2px] bg-secondary rounded-full"></span>
                  <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">Collaborate</span>
                </div>
                <h3 className="text-4xl lg:text-5xl font-black text-white serif-heading mb-6 tracking-tight">The Wall</h3>
                <p className="text-white/80 text-base font-body leading-relaxed mb-8 max-w-sm">
                    Leave your mark. Sign yearbooks digitally, post notes of gratitude, and see the collective pulse of the class.
                </p>
                <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-max">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full ring-2 ring-black bg-stone-300 overflow-hidden">
                      <img alt="User" src="/stitch-assets/home_img_3.jpg" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-10 h-10 rounded-full ring-2 ring-black bg-stone-400 overflow-hidden">
                      <img alt="User" src="/stitch-assets/home_img_4.jpg" className="w-full h-full object-cover" />
                    </div>
                    <div className="w-10 h-10 rounded-full ring-2 ring-black bg-primary text-white flex items-center justify-center text-[11px] font-black tracking-tighter shadow-inner">+24</div>
                  </div>
                  <span className="text-white/70 text-xs font-black uppercase tracking-wider">Active Today</span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Card 3: Memory Feed */}
          <Link href="/memory-feed" className="md:col-span-3 group cursor-pointer block h-full">
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-[2rem] h-[500px] md:h-full min-h-[400px] shadow-xl transition-all duration-700 hover:shadow-tertiary/20 hover:-translate-y-2">
              <img alt="Memory Feed" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 mix-blend-multiply group-hover:grayscale-0 group-hover:opacity-100 group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-1000 ease-[0.16,1,0.3,1]" src="/stitch-assets/home_img_5.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500 overflow-hidden">
                 <span className="material-symbols-outlined text-white/50 text-xl group-hover:-translate-y-8 transition-transform">arrow_forward</span>
                 <span className="material-symbols-outlined text-white text-xl absolute translate-y-8 group-hover:translate-y-0 transition-transform">arrow_forward</span>
              </div>

              <div className="absolute bottom-0 left-0 p-8 md:p-10 w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-[2px] bg-tertiary rounded-full"></span>
                  <span className="text-white text-[10px] font-black tracking-[0.2em] uppercase">Archive</span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-black text-white serif-heading mb-4">Memory <br/>Feed</h3>
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-tertiary group-hover:border-transparent transition-all duration-500">
                  <span className="material-symbols-outlined text-white/80 group-hover:text-white">auto_awesome</span>
                </div>
              </div>
            </motion.div>
          </Link>
          
        </motion.div>
      </motion.section>

      {/* Signature Editorial Quote */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-32 bg-surface-container relative overflow-hidden flex flex-col items-center justify-center text-center px-8 border-y border-outline-variant/10"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <span className="material-symbols-outlined text-primary mb-10 text-6xl opacity-80" style={{fontVariationSettings:"'FILL' 1"}}>format_quote</span>
        <blockquote className="text-4xl md:text-5xl lg:text-6xl font-black serif-heading text-on-surface max-w-4xl tracking-tight leading-[1.15] mb-10 relative z-10">
            "Yesterday is but today's memory, and tomorrow is today's dream."
        </blockquote>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-[1px] bg-primary/40"></div>
          <cite className="not-italic font-label tracking-[0.2em] text-xs uppercase text-primary font-bold">— Khalil Gibran</cite>
          <div className="w-12 h-[1px] bg-primary/40"></div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-stone-950 py-24 px-8 relative overflow-hidden">
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
          <div className="max-w-sm">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true }}
              className="text-3xl md:text-4xl font-black italic text-white/90 mb-6 flex items-center gap-3"
            >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-white">school</span>
                </div>
                Seniors '26
            </motion.div>
            <p className="text-white/50 font-body text-sm leading-relaxed">
                Designed for the dreamers, the achievers, and the legends in the making. Our time is now.
            </p>
          </div>
          <motion.div 
             initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once:true }}
             className="flex flex-col items-end gap-2"
          >
             <div className="text-[10px] font-black tracking-widest text-white/30 uppercase">System Status</div>
             <div className="flex items-center gap-2">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
               </span>
               <span className="text-white/80 text-sm font-bold tracking-widest uppercase">Live Archive</span>
             </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
