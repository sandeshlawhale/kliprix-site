"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

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
    pos: "left-[calc(50%-470px*var(--s))] top-[calc(205px*var(--s))]",
  },
  {
    text: "Face-tracked crop",
    dot: "bg-violet",
    pos: "left-[calc(50%+170px*var(--s))] top-[calc(120px*var(--s))]",
  },
  {
    text: "Hinglish captions",
    dot: "bg-brand-2",
    pos: "left-[calc(50%+285px*var(--s))] top-[calc(300px*var(--s))]",
  },
  {
    text: "Title + hashtags written",
    dot: "bg-ok",
    pos: "left-[calc(50%-330px*var(--s))] top-[calc(365px*var(--s))]",
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
    let io: IntersectionObserver | undefined;
    // The posters show at once; the video files start downloading only after the page has
    // loaded, so they never hold up the first paint.
    const start = () => {
      io = new IntersectionObserver(
        ([e]) => {
          for (const v of videos) {
            if (e.isIntersecting) v.play().catch(() => {});
            else v.pause();
          }
        },
        { threshold: 0.05 },
      );
      io.observe(root);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      io?.disconnect();
    };
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
              preload="none"
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
          className={`absolute z-10 hidden lg:block ${c.pos}`}
        >
          <MagneticChip dot={c.dot}>{c.text}</MagneticChip>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * A pill that leans toward the pointer when it comes close and springs back when it leaves.
 * Only follows a mouse (not touch), and never with reduced motion.
 */
function MagneticChip({ dot, children }: { dot: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const RANGE = 140; // px around the pill's edge where it starts to pull
    const PULL = 0.35;
    const MAX = 26; // px the pill can travel
    const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - x.get();
      const cy = r.top + r.height / 2 - y.get();
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width / 2 + RANGE && Math.abs(dy) < r.height / 2 + RANGE;
      x.set(near ? clamp(dx * PULL) : 0);
      y.set(near ? clamp(dy * PULL) : 0);
    };
    const reset = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", reset);
    };
  }, [reduce, x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      whileHover={{ scale: 1.06 }}
      className="flex cursor-default items-center gap-2 rounded-xl border border-line-strong bg-[#14141a]/85 px-3 py-2 text-[13px] font-medium whitespace-nowrap shadow-[0_12px_30px_-8px_rgb(0_0_0/0.7)] backdrop-blur-md transition-colors hover:border-brand/60"
    >
      <i className={`size-2 rounded-full ${dot}`} />
      {children}
    </motion.div>
  );
}
