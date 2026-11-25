"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

// Real Kliprix exports, cut to 8 s muted loops (see site/README.md for how to replace them).
const phones = [
  { cls: "phone-3", n: 2, video: false },
  { cls: "phone-4", n: 6, video: false },
  { cls: "phone-1", n: 3, video: true },
  { cls: "phone-2", n: 4, video: true },
  { cls: "phone-0", n: 1, video: true },
] as const;

// Positions scale with the fan (--s), so the chips stay beside the same clips on every width.
const chips = [
  {
    text: "Picked from a chat spike",
    dot: "bg-brand",
    pos: "left-[calc(50%-400px*var(--s))] top-[calc(40px*var(--s))]",
  },
  {
    text: "Face-tracked crop",
    dot: "bg-violet",
    pos: "left-[calc(50%+200px*var(--s))] top-[calc(16px*var(--s))]",
  },
  {
    text: "Hinglish captions",
    dot: "bg-brand-2",
    pos: "left-[calc(50%+250px*var(--s))] top-[calc(250px*var(--s))]",
  },
  {
    text: "Title + hashtags written",
    dot: "bg-ok",
    pos: "left-[calc(50%-470px*var(--s))] top-[calc(290px*var(--s))]",
  },
];

/** The fan of vertical clips. Videos play only while on screen and never with reduced motion. */
export function HeroReel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const videos = Array.from(root.querySelectorAll("video"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        for (const v of videos) {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="reel" aria-label="Shorts made by Kliprix">
      {phones.map((p) => (
        <div key={p.cls} className={`phone ${p.cls}`}>
          {p.video ? (
            <video
              src={`/media/clip-${p.n}.mp4`}
              poster={`/media/clip-${p.n}.jpg`}
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/media/clip-${p.n}.jpg`} alt="" loading="lazy" />
          )}
        </div>
      ))}
      {chips.map((c, i) => (
        <motion.div
          key={c.text}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay: 0.9 + i * 0.15, duration: 0.5 },
            scale: { delay: 0.9 + i * 0.15, duration: 0.5 },
            y: { delay: 1.4 + i * 0.4, duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute z-10 hidden items-center gap-2 rounded-xl border border-line-strong bg-[#14141a]/85 px-3 py-2 text-[13px] font-medium whitespace-nowrap shadow-[0_12px_30px_-8px_rgb(0_0_0/0.7)] backdrop-blur-md lg:flex ${c.pos}`}
        >
          <i className={`size-2 rounded-full ${c.dot}`} />
          {c.text}
        </motion.div>
      ))}
    </div>
  );
}
