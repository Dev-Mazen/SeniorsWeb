"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
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
}: {
  settings: PlatformSettings | null;
  profile: Pick<Profile, "full_name" | "role"> | null;
}) {
  const grad = settings?.graduation_date ?? "2026-05-24";
  const timer = useCountdown(grad);
  const { scrollYProgress } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.35], [0, 140]);
  const heroContentY = useTransform(scrollYProgress, [0, 0.25], [0, -40]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0.5]);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Senior";

  const statusCards = [
    {
      label: "Wall",
      value: settings?.wall_posts_enabled ? "Live" : "Paused",
      tone: settings?.wall_posts_enabled ? "text-primary" : "text-on-surface-variant",
    },
    {
      label: "Uploads",
      value: settings?.uploads_enabled ? "Open" : "Locked",
      tone: settings?.uploads_enabled ? "text-secondary" : "text-on-surface-variant",
    },
    {
      label: "Awards",
      value: settings?.awards_revealed ? "Revealed" : "Building",
      tone: settings?.awards_revealed ? "text-tertiary" : "text-on-surface-variant",
    },
  ];

  const destinationCards = [
    {
      href: "/directory",
      title: "Directory Atlas",
      eyebrow: "Connect",
      copy: "Search the graduating class, revisit familiar faces, and see where everyone's heading next.",
      image: "/stitch-assets/home_img_1.jpg",
      accent: "from-primary/90 via-primary/60 to-transparent",
      size: "md:col-span-4 md:row-span-2",
    },
    {
      href: "/wall",
      title: "The Wall",
      eyebrow: "Collaborate",
      copy: "Leave messages, celebrate friendships, and watch the class heartbeat unfold in real time.",
      image: "/stitch-assets/home_img_2.jpg",
      accent: "from-secondary/90 via-secondary/50 to-transparent",
      size: "md:col-span-5 md:row-span-3",
    },
    {
      href: "/memory-feed",
      title: "Memory Feed",
      eyebrow: "Archive",
      copy: "A living gallery of photos, clips, and moments that deserve a second look.",
      image: "/stitch-assets/home_img_5.jpg",
      accent: "from-tertiary/90 via-tertiary/50 to-transparent",
      size: "md:col-span-3 md:row-span-2",
    },
    {
      href: "/hall-of-thanks",
      title: "Hall of Thanks",
      eyebrow: "Honor",
      copy: "Send gratitude to teachers, mentors, and the people who shaped the year.",
      image: "/stitch-assets/home_img_3.jpg",
      accent: "from-stone-900/90 via-stone-700/55 to-transparent",
      size: "md:col-span-3",
    },
    {
      href: "/time-capsule",
      title: "Time Capsule",
      eyebrow: "Future",
      copy: "Write something today that a future version of you will open later.",
      image: "/stitch-assets/home_img_4.jpg",
      accent: "from-primary-container/95 via-primary/50 to-transparent",
      size: "md:col-span-4",
    },
  ];

  const quickActions = [
    { href: "/directory", label: "Explore directory", icon: "travel_explore" },
    { href: "/wall", label: "Post on the wall", icon: "edit_square" },
    { href: "/memory-feed", label: "Open memories", icon: "photo_library" },
    { href: "/time-capsule", label: "Write to future me", icon: "hourglass_top" },
  ];

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-12 pt-8 md:px-8 md:pb-20">
        <div className="hero-mesh section-shell soft-noise relative mx-auto min-h-[760px] max-w-7xl overflow-hidden rounded-[2rem] md:min-h-[840px]">
          <div className="soft-grid absolute inset-0 opacity-40" />
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1.04, opacity: 0.32 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{ y: heroImageY }}
            alt="Senior Year Hero"
            className="absolute inset-y-0 right-0 h-full w-full object-cover object-center md:w-[62%]"
            src="/stitch-assets/home_img_0.jpg"
          />
          <div className="hero-gradient absolute inset-0" />
          <div className="relative z-10 grid min-h-[760px] grid-cols-1 gap-8 px-6 py-10 md:min-h-[840px] md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-12 lg:px-14">
            <motion.div style={{ y: heroContentY, opacity: heroContentOpacity }} className="flex flex-col justify-between">
              <div className="max-w-3xl pt-12 md:pt-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pill-badge mb-8 inline-flex rounded-full px-4 py-2 text-xs font-extrabold uppercase tracking-[0.26em] text-on-surface-variant"
                >
                  The final chapter is being written now
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="section-kicker mb-5"
                >
                  Welcome back, {firstName}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="text-balance serif-heading max-w-4xl text-5xl font-semibold leading-[0.9] text-white md:text-7xl lg:text-[6.5rem]"
                >
                  Build a yearbook that feels alive.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 max-w-2xl text-balance text-base leading-7 text-white/78 md:text-lg"
                >
                  Preserve the loud moments, the quiet ones, and the in-between stories. This space is your class archive,
                  social wall, and time capsule in one polished experience.
                </motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-10 flex flex-wrap gap-4">
                  <Link href="/directory" className="pressable rounded-full bg-white px-7 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-stone-900 transition-transform hover:scale-[1.02]">
                    Start exploring
                  </Link>
                  <Link href="/wall" className="pressable rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-md transition-transform hover:scale-[1.02]">
                    Visit the wall
                  </Link>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="mt-12 grid gap-4 md:max-w-2xl md:grid-cols-3">
                {statusCards.map((item) => (
                  <div key={item.label} className="pill-badge rounded-[1.5rem] px-5 py-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-on-surface-variant">{item.label}</p>
                    <p className={`mt-3 text-2xl font-black ${item.tone}`}>{item.value}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex items-end justify-end">
              <div className="section-shell ml-auto w-full max-w-md rounded-[2rem] p-6 text-left md:mb-8">
                <p className="section-kicker mb-5">Launch panel</p>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Link key={action.href} href={action.href} className="interactive-card flex items-center justify-between rounded-[1.5rem] border border-outline-variant/20 bg-white/70 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined rounded-full bg-surface-container px-3 py-3 text-on-surface">{action.icon}</span>
                        <span className="font-semibold text-on-surface">{action.label}</span>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-5 rounded-[1.5rem] bg-stone-900 px-5 py-5 text-white">
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/55">Profile</p>
                  <p className="mt-2 serif-heading text-3xl font-semibold">{profile?.full_name ?? "Class Member"}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/65">{profile?.role ?? "member"}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-4 py-8 md:px-8"
      >
        <div className="section-shell mx-auto max-w-7xl rounded-[2rem] px-6 py-10 md:px-10 md:py-12">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="section-kicker mb-4">Countdown</p>
              <h2 className="serif-heading text-4xl font-semibold leading-tight text-on-surface md:text-5xl">
                Every memory gets sharper as the finish line gets closer.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-on-surface-variant">
                Graduation is approaching fast. Use this space to write notes, collect photos, and leave behind something bigger
                than a static yearbook page.
              </p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(timer).map(([label, val]) => (
                <div key={label} className="spotlight-card rounded-[1.75rem] border border-outline-variant/18 px-4 py-6 text-center">
                  <p className="serif-heading text-4xl font-semibold text-on-surface md:text-5xl">
                    {String(val).padStart(label === "Days" && val > 99 ? 3 : 2, "0")}
                  </p>
                  <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.24em] text-on-surface-variant">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="px-4 py-12 md:px-8 md:py-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="section-kicker mb-4">Destinations</p>
              <h2 className="serif-heading text-4xl font-semibold text-on-surface md:text-5xl">
                The app now feels like a campus map instead of a list of links.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-on-surface-variant">
              Jump between stories, shout-outs, archives, and future letters with a homepage designed to surface mood, not just menus.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-12 md:auto-rows-[150px]"
          >
            {destinationCards.map((card) => (
              <Link key={card.href} href={card.href} className={`group block ${card.size}`}>
                <motion.div variants={fadeUp} className="interactive-card relative h-full min-h-[280px] overflow-hidden rounded-[2rem]">
                  <img alt={card.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src={card.image} />
                  <div className={`absolute inset-0 bg-gradient-to-t ${card.accent}`} />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-950/70" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7">
                    <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/70">{card.eyebrow}</p>
                    <h3 className="serif-heading text-3xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">{card.copy}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
                      <span>Open</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-4 py-10 md:px-8 md:py-14"
      >
        <div className="section-shell mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] px-6 py-10 md:flex-row md:items-end md:justify-between md:px-10">
          <div className="max-w-3xl">
            <span className="material-symbols-outlined mb-5 text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              format_quote
            </span>
            <blockquote className="serif-heading text-3xl font-semibold leading-tight text-on-surface md:text-5xl">
              Yesterday is today&apos;s memory, and tomorrow is today&apos;s dream.
            </blockquote>
            <cite className="mt-5 block not-italic text-sm font-extrabold uppercase tracking-[0.24em] text-primary">
              Khalil Gibran
            </cite>
          </div>
          <div className="max-w-sm rounded-[1.75rem] bg-stone-900 px-6 py-6 text-white">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-white/55">Best next move</p>
            <p className="mt-3 text-base leading-7 text-white/80">
              Add one memory, send one thank-you, and leave one note on the wall today. Small entries compound into an unforgettable archive.
            </p>
          </div>
        </div>
      </motion.section>

      <footer className="px-4 pb-24 pt-6 md:px-8 md:pb-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] border border-outline-variant/15 bg-surface-container-low px-6 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="max-w-lg">
            <p className="serif-heading text-3xl font-semibold text-on-surface">Seniors 2026</p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Designed as a digital keepsake for the dreamers, achievers, and legends in the making.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/awards" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-on-surface">
              Awards
            </Link>
            <Link href="/hall-of-thanks" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-on-surface">
              Hall of Thanks
            </Link>
            <Link href="/time-capsule" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-on-surface">
              Time Capsule
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
