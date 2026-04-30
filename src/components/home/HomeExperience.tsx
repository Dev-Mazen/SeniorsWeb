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
      if (diff <= 0) {
        setTime({ Days: 0, Hours: 0, Mins: 0, Secs: 0 });
        return;
      }

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

export default function HomeExperience({
  settings,
  profile,
  stats,
  recentMemories,
}: {
  settings: PlatformSettings | null;
  profile: Pick<Profile, "full_name" | "role"> | null;
  stats: {
    memories: number;
    wallPosts: number;
    classmates: number;
  };
  recentMemories: Array<{
    id: string;
    caption: string | null;
    media_url: string;
    media_type: string;
    created_at: string;
    profiles: { full_name: string | null; photo_url: string | null } | { full_name: string | null; photo_url: string | null }[] | null;
  }>;
}) {
  const grad = settings?.graduation_date ?? "2026-05-24";
  const timer = useCountdown(grad);
  const { scrollYProgress } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.4], [0, 200]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Senior";

  const statusCards = [
    {
      label: "Archive Wall",
      value: settings?.wall_enabled ? "Active" : "Locked",
      tone: settings?.wall_enabled ? "text-primary" : "text-on-surface-variant/40",
      icon: "dashboard_customize"
    },
    {
      label: "Intel Flow",
      value: settings?.uploads_enabled ? "Synced" : "Paused",
      tone: settings?.uploads_enabled ? "text-secondary" : "text-on-surface-variant/40",
      icon: "sync_alt"
    },
    {
      label: "Recognition",
      value: settings?.awards_revealed ? "Live" : "Pending",
      tone: settings?.awards_revealed ? "text-tertiary" : "text-on-surface-variant/40",
      icon: "workspace_premium"
    },
  ];

  const destinationCards = [
    {
      href: "/directory",
      title: "Class Atlas",
      eyebrow: "Registry",
      copy: "Search the graduating class, revisit familiar faces, and see where everyone's heading next.",
      image: "/stitch-assets/home_img_1.jpg",
      accent: "from-primary/80 via-primary/40 to-transparent",
      size: "md:col-span-5 md:row-span-2",
    },
    {
      href: "/wall",
      title: "The Living Wall",
      eyebrow: "Fragments",
      copy: "Leave messages, celebrate friendships, and watch the class heartbeat unfold in real time.",
      image: "/stitch-assets/home_img_2.jpg",
      accent: "from-secondary/80 via-secondary/40 to-transparent",
      size: "md:col-span-4 md:row-span-3",
    },
    {
      href: "/memory-feed",
      title: "Chronicle",
      eyebrow: "Archive",
      copy: "A living gallery of photos, clips, and moments that deserve a second look.",
      image: "/stitch-assets/home_img_5.jpg",
      accent: "from-tertiary/80 via-tertiary/40 to-transparent",
      size: "md:col-span-3 md:row-span-2",
    },
    {
      href: "/hall-of-thanks",
      title: "Sanctuary of Gratitude",
      eyebrow: "Honor",
      copy: "Send gratitude to teachers, mentors, and the people who shaped the year.",
      image: "/stitch-assets/home_img_3.jpg",
      accent: "from-on-surface/80 via-on-surface/40 to-transparent",
      size: "md:col-span-5 md:row-span-2",
    },
    {
      href: "/time-capsule",
      title: "Temporal Vault",
      eyebrow: "Legacy",
      copy: "Write something today that a future version of you will open later.",
      image: "/stitch-assets/home_img_4.jpg",
      accent: "from-primary-container/80 via-primary-container/40 to-transparent",
      size: "md:col-span-3 md:row-span-2",
    },
  ];

  const quickActions = [
    { href: "/directory", label: "Registry Access", icon: "travel_explore" },
    { href: "/wall", label: "Pin Fragment", icon: "edit_square" },
    { href: "/memory-feed", label: "View Archive", icon: "photo_library" },
    { href: "/time-capsule", label: "Temporal Lock", icon: "hourglass_top" },
  ];

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative px-4 pt-4 md:px-8 scroll-fade ambient-anim">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="section-shell relative mx-auto min-h-[85vh] max-w-[1600px] overflow-hidden rounded-[3.5rem] shadow-2xl"
        >
          {/* Parallax Background */}
          <motion.div 
            style={{ y: heroImageY }}
            className="absolute inset-0 z-0"
          >
            <img
              alt="Archive Hero"
              className="h-full w-full object-cover grayscale-[0.2] brightness-[0.7]"
              src="/stitch-assets/home_img_0.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </motion.div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 z-[1] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 grid h-full min-h-[85vh] grid-cols-1 md:grid-cols-[1.4fr_0.6fr] gap-12 p-8 md:p-20">
            <motion.div 
              style={{ y: heroContentY, opacity: heroContentOpacity }}
              className="flex flex-col justify-center"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 w-fit"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">The Living Archive v20.26</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="serif text-7xl md:text-[9.5rem] font-black text-on-surface leading-[0.8] tracking-tighter mb-10"
              >
                Legacy <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-secondary italic">Redefined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="max-w-xl text-xl md:text-2xl font-medium text-on-surface-variant leading-relaxed mb-12"
              >
                Class of 2026. This isn't just a website. It's a digital nerve center for every memory, every shout-out, and every dream.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap gap-6"
              >
                <Link href="/directory" className="group relative px-12 py-6 rounded-full bg-on-surface text-background font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/20 active:scale-95">
                  <span className="relative z-10">Initialize Scan</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/wall" className="px-12 py-6 rounded-full border border-outline-variant/20 bg-surface-container-low/40 backdrop-blur-xl text-on-surface font-black text-xs uppercase tracking-[0.3em] hover:bg-surface-container-low transition-all active:scale-95">
                  Access Wall
                </Link>
              </motion.div>

              {/* Stats Bar */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-20 flex flex-wrap gap-12"
              >
                {statusCards.map((card) => (
                  <div key={card.label} className="group cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`material-symbols-outlined text-sm ${card.tone}`}>{card.icon}</span>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 group-hover:text-on-surface-variant transition-colors">{card.label}</p>
                    </div>
                    <p className={`text-2xl font-black ${card.tone}`}>{card.value}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Launch Panel Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="hidden md:flex flex-col justify-center items-end"
            >
              <div className="section-shell w-full max-w-sm rounded-[3rem] p-1 shadow-2xl">
                <div className="bg-surface-container-lowest/40 backdrop-blur-3xl rounded-[2.8rem] p-10">
                  <div className="mb-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Terminal Access</p>
                    <h2 className="serif text-4xl font-black text-on-surface leading-none">Command Center</h2>
                  </div>

                  <div className="space-y-4">
                    {quickActions.map((action) => (
                      <Link key={action.href} href={action.href} className="group flex items-center justify-between p-6 rounded-[1.8rem] bg-surface-container-high/40 hover:bg-primary/10 border border-outline-variant/10 transition-all hover:border-primary/20">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">{action.icon}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant group-hover:text-on-surface transition-colors">{action.label}</span>
                        </div>
                        <span className="material-symbols-outlined text-outline/30 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-outline-variant/10">
                    <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-primary/5 border border-primary/10">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black">
                        {firstName[0]}
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Operator</p>
                        <p className="text-xs font-black text-on-surface">{profile?.full_name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <div className="relative overflow-hidden py-10 bg-on-surface/5 -skew-y-2 border-y border-outline-variant/10 scroll-fade">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex gap-20 whitespace-nowrap"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-20">
              <span className="serif text-5xl font-black text-on-surface/10 uppercase tracking-tighter">Class of 2026</span>
              <span className="w-4 h-4 rounded-full bg-primary/20" />
              <span className="serif text-5xl font-black text-on-surface/10 uppercase tracking-tighter italic">Unforgettable</span>
              <span className="w-4 h-4 rounded-full bg-secondary/20" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Countdown Section */}
      <section className="px-4 md:px-8 scroll-scale">
        <div className="section-shell mx-auto max-w-7xl rounded-[3.5rem] bg-surface-container-lowest/50 backdrop-blur-3xl p-8 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-20 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 mb-8"
              >
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Temporal Sync</span>
              </motion.div>
              <h2 className="serif text-5xl md:text-7xl font-black text-on-surface leading-none tracking-tighter mb-8">
                The Clock is <br />
                <span className="text-secondary italic">Accelerating.</span>
              </h2>
              <p className="text-xl font-medium text-on-surface-variant leading-relaxed max-w-md">
                 Graduation isn't just a date; it's the convergence of every story we've built together. Make every second count.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Object.entries(timer).map(([label, val], idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={label} 
                  className="group relative bg-surface-container-high/40 p-8 rounded-[2.5rem] border border-outline-variant/10 text-center hover:bg-surface-container-high transition-all hover:shadow-xl hover:-translate-y-2"
                >
                  <p className="text-5xl md:text-6xl font-black text-on-surface tracking-tighter mb-4 transition-transform group-hover:scale-110">
                    {String(val).padStart(2, "0")}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/40 group-hover:text-secondary transition-colors">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Matrix */}
      <section className="px-4 md:px-8 scroll-reveal">
        <div className="mx-auto max-w-7xl">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8"
              >
                <span className="material-symbols-outlined text-sm">explore</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Sub-Module Matrix</span>
              </motion.div>
              <h2 className="serif text-5xl md:text-7xl font-black text-on-surface leading-none tracking-tighter">
                Explore the <br />
                <span className="text-primary italic">Ecosystem.</span>
              </h2>
            </div>
            <p className="max-w-md text-lg font-medium text-on-surface-variant leading-relaxed">
              Navigate between the living fragments of our history. Each portal leads to a unique dimension of our collective year.
            </p>
          </header>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-12 md:auto-rows-[160px] gap-6"
          >
            {destinationCards.map((card) => (
              <Link key={card.href} href={card.href} className={`group block ${card.size}`}>
                <motion.div 
                  variants={fadeUp}
                  className="relative h-full min-h-[360px] overflow-hidden rounded-[3rem] shadow-2xl group-hover:shadow-primary/10 transition-all duration-700"
                >
                  <img 
                    alt={card.title} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.6]" 
                    src={card.image} 
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.accent} opacity-60 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-10 h-[1px] bg-white/40" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70">{card.eyebrow}</p>
                    </div>
                    <h3 className="serif text-4xl md:text-5xl font-black text-white leading-none mb-6 group-hover:translate-x-2 transition-transform">{card.title}</h3>
                    <p className="text-sm font-medium text-white/60 max-w-xs opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">{card.copy}</p>
                    
                    <div className="mt-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white group-hover:text-primary transition-colors">
                      <span>Enter Module</span>
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-2 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Live Pulse */}
      <section className="px-4 md:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="section-shell rounded-[3rem] p-10 md:p-14 bg-surface-container-lowest/50 backdrop-blur-3xl flex flex-col justify-center"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6">Archive Density</p>
            <h2 className="serif text-5xl font-black text-on-surface leading-none mb-10">Real-time Metrics.</h2>
            <div className="space-y-6">
              {[
                { label: "Class Registry", val: stats.classmates, tone: "text-primary", icon: "groups" },
                { label: "Archived Fragments", val: stats.memories, tone: "text-secondary", icon: "auto_awesome" },
                { label: "Wall Scrawls", val: stats.wallPosts, tone: "text-tertiary", icon: "history_edu" }
              ].map((s) => (
                <div key={s.label} className="p-6 rounded-[2rem] bg-surface-container-high/40 border border-outline-variant/10 flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <span className={`material-symbols-outlined text-2xl ${s.tone}`}>{s.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">{s.label}</p>
                  </div>
                  <p className={`text-3xl font-black ${s.tone}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="section-shell rounded-[3rem] p-10 md:p-14 bg-surface-container-lowest/50 backdrop-blur-3xl"
          >
            <div className="flex items-center justify-between mb-12">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mb-3">Live Feed</p>
                <h2 className="serif text-4xl font-black text-on-surface leading-none">Recent Syncs</h2>
              </div>
              <Link href="/memory-feed" className="px-8 py-4 rounded-full bg-secondary text-background font-black text-[10px] uppercase tracking-[0.3em] hover:shadow-xl hover:shadow-secondary/20 transition-all active:scale-95">
                Full Stream
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentMemories.map((m) => {
                const author = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                return (
                  <Link key={m.id} href="/memory-feed" className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-xl">
                    <img 
                      src={m.media_url} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary mb-2">{author?.full_name}</p>
                      <p className="text-xs font-medium text-white line-clamp-1">{m.caption || "Archived fragment"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 pb-20 md:px-8 md:pb-12 scroll-fade">
        <div className="mx-auto max-w-[1600px] rounded-[3.5rem] bg-surface-container-low/30 backdrop-blur-3xl border border-outline-variant/10 p-12 md:p-20 text-center interactive-card">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="serif text-6xl md:text-8xl font-black text-on-surface leading-none mb-8">Seniors 2026.</h2>
            <p className="text-xl font-medium text-on-surface-variant leading-relaxed mb-12">
              Designed as a digital sanctuary for the dreamers, achievers, and legends in the making. Your story is eternal.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {["directory", "wall", "memory-feed", "awards", "hall-of-thanks"].map((link) => (
                <Link 
                  key={link} 
                  href={`/${link}`} 
                  className="px-8 py-4 rounded-full bg-surface-container-high/40 hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.4em] border border-outline-variant/10"
                >
                  {link.replace("-", " ")}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
