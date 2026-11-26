"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Real screenshots of the app (1440x900 window), in the order you use it. */
const screens = [
  {
    src: "/media/app/home.webp",
    label: "Home",
    alt: "Kliprix home screen: paste up to 3 video links, then Process.",
  },
  {
    src: "/media/app/links.webp",
    label: "3 links added",
    alt: "Three YouTube videos added on the home screen, each with title, channel and length.",
  },
  {
    src: "/media/app/batch.webp",
    label: "Batch",
    alt: "Batch page with finished vertical clips for each video.",
  },
  {
    src: "/media/app/clip.webp",
    label: "Clip details",
    alt: "One clip: the vertical video next to its on-video title, YouTube title, description, hashtags and why it was picked.",
  },
];

/** How far (px) a finger must move sideways to change the screenshot. */
const SWIPE_PX = 40;

/** The app window: real screenshots, switched with the arrows, the arrow keys or a sideways
 * swipe on phones (wraps around at both ends). Nothing moves on its own. */
export function AppScreens() {
  const [index, setIndex] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const count = screens.length;
  // Steps from the latest index, so quick swipes or key repeats never get lost.
  const step = (delta: number) => setIndex((current) => (current + delta + count) % count);

  return (
    <div
      className="reveal mt-10 overflow-hidden rounded-[18px] border border-line-strong bg-linear-to-b from-[#121218] to-[#0b0b0f] shadow-[0_60px_120px_-40px_rgb(255_210_63/0.18),0_30px_80px_-20px_rgb(0_0_0/0.9)]"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Kliprix app screenshots"
    >
      <div className="flex h-10 items-center gap-[7px] border-b border-line px-4">
        <i className="size-[11px] rounded-full bg-[#2a2a31]" />
        <i className="size-[11px] rounded-full bg-[#2a2a31]" />
        <i className="size-[11px] rounded-full bg-[#2a2a31]" />
        <span className="ml-3.5 truncate font-mono text-xs text-dim">
          127.0.0.1:3000 · Kliprix · {screens[index]!.label}
        </span>
      </div>

      <div
        // pan-y: the page still scrolls up and down; sideways moves are ours.
        className="relative aspect-[16/10] touch-pan-y bg-[#0a0a0a] select-none"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          start.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={(event) => {
          const from = start.current;
          const touch = event.changedTouches[0];
          start.current = null;
          if (!from || !touch) return;
          const dx = touch.clientX - from.x;
          const dy = touch.clientY - from.y;
          if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
          step(dx < 0 ? 1 : -1);
        }}
      >
        {screens.map((screen, i) => (
          <img
            key={screen.src}
            src={screen.src}
            alt={screen.alt}
            width={2400}
            height={1500}
            draggable={false}
            loading={i === 0 ? "eager" : "lazy"}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 size-full object-cover object-top transition-opacity duration-500 ease-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        <span className="sr-only" aria-live="polite">
          {`Screenshot ${index + 1} of ${count}: ${screens[index]!.label}`}
        </span>
        <ArrowButton side="left" onClick={() => step(-1)} />
        <ArrowButton side="right" onClick={() => step(1)} />
      </div>
    </div>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous screenshot" : "Next screenshot"}
      className={cn(
        "absolute top-1/2 grid size-8 -translate-y-1/2 sm:size-10 place-items-center rounded-full border border-line-strong bg-black/60 text-foreground backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none",
        side === "left" ? "left-2 sm:left-3" : "right-2 sm:right-3",
      )}
    >
      <Icon className="size-4 sm:size-5" aria-hidden />
    </button>
  );
}
