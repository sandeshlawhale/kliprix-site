"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckIcon, PlayIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ease = [0.2, 0.8, 0.2, 1] as const;

/* ---------- 01: type a link, press Add, the video card pops in ---------- */

const LINK = "youtube.com/watch?v=GTA6-vice-city";

function PasteDemo({ run }: { run: number }) {
  const idle = run === 0;
  const [typed, setTyped] = useState(idle ? LINK.length : 0);
  const [pressed, setPressed] = useState(false);
  const [added, setAdded] = useState(idle);

  useEffect(() => {
    if (idle) return;
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(i);
      if (i >= LINK.length) {
        clearInterval(t);
        setTimeout(() => setPressed(true), 250);
        setTimeout(() => {
          setPressed(false);
          setAdded(true);
        }, 520);
      }
    }, 32);
    return () => clearInterval(t);
  }, [idle]);

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line-strong pr-1.5 pl-3 font-mono text-[12px] text-muted-foreground">
        <span className="truncate">
          {LINK.slice(0, typed) || <span className="text-dim">Paste a video link</span>}
          {!added && (
            <span className="ml-px inline-block h-3.5 w-px animate-pulse bg-brand align-middle" />
          )}
        </span>
        <motion.b
          animate={{ scale: pressed ? 0.88 : 1 }}
          className={cn(
            "ml-auto rounded-md px-2.5 py-1 font-sans text-xs transition-colors",
            pressed ? "bg-brand text-black" : "bg-foreground text-black",
          )}
        >
          Add
        </motion.b>
      </div>
      <AnimatePresence>
        {added && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex items-center gap-3 rounded-lg border border-line-strong bg-white/[0.03] p-2"
          >
            <div className="relative h-10 w-[70px] shrink-0 overflow-hidden rounded-md">
              <img
                src="/media/clip-6.jpg"
                alt=""
                className="size-full object-cover object-[50%_40%]"
              />
              <PlayIcon className="absolute inset-0 m-auto size-3.5 fill-white text-white" />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-[12.5px] font-semibold">My first day in Vice City</p>
              <p className="flex items-center gap-1 text-[11px] text-ok">
                <CheckIcon className="size-3" /> Ready to clip
              </p>
            </div>
            <span className="ml-auto font-mono text-[11px] text-dim">1/3</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 02: the bar fills once, stages tick off as it passes them ---------- */

const STAGES = ["Download", "Highlights", "Transcription", "Picking clips", "Editing"];
const STAGE_MS = 650;

function PipelineDemo({ run }: { run: number }) {
  const idle = run === 0;
  const [stage, setStage] = useState(idle ? STAGES.length : 0);

  useEffect(() => {
    if (idle) return;
    const timers = STAGES.map((_, i) =>
      setTimeout(() => setStage(i + 1), STAGE_MS * (i + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [idle]);

  const finished = stage >= STAGES.length;
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="flex items-center gap-2 font-medium">
          {finished ? (
            <CheckIcon className="size-3.5 text-ok" />
          ) : (
            <span className="size-2 animate-pulse rounded-full bg-brand" />
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={finished ? "done" : stage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {finished ? "All clips ready" : STAGES[stage]}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="font-mono text-[11px] text-dim">
          {Math.min(stage + (finished ? 0 : 1), STAGES.length)}/{STAGES.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
        <motion.i
          className="block h-full rounded-full"
          initial={idle ? false : { width: "0%" }}
          animate={{
            width: "100%",
            backgroundColor: finished ? "#5ad69a" : "#ffd23f",
          }}
          transition={{
            width: { duration: idle ? 0 : (STAGE_MS * STAGES.length) / 1000, ease: "linear" },
            backgroundColor: { duration: 0.3 },
          }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STAGES.map((s, i) => (
          <span
            key={s}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] transition-colors duration-200",
              i < stage
                ? "border-ok/35 bg-ok/6 text-ok"
                : "border-white/12 text-muted-foreground/60",
            )}
          >
            {i < stage && (
              <motion.span
                initial={idle ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <CheckIcon className="size-2.5" />
              </motion.span>
            )}
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- 03: finished clips arrive one by one ---------- */

const CLIPS = [1, 3, 4, 6, 2];

function ClipsDemo({ run }: { run: number }) {
  const idle = run === 0;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5">
      <div className="flex w-full justify-center gap-2">
        {CLIPS.map((n, i) => (
          <motion.img
            key={n}
            src={`/media/clip-${n}.jpg`}
            alt=""
            loading="lazy"
            initial={idle ? false : { opacity: 0, x: 28, y: 34, scale: 0.55, rotate: 10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 26, delay: idle ? 0 : 0.14 * i }}
            className="aspect-[9/16] w-[17%] max-w-12 min-w-0 rounded-md border border-line-strong object-cover shadow-[0_10px_20px_-8px_rgb(0_0_0/0.8)]"
          />
        ))}
      </div>
      <motion.span
        initial={idle ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idle ? 0 : 0.16 * CLIPS.length + 0.3 }}
        className="flex items-center gap-1 rounded-full bg-brand/12 px-2.5 py-0.5 text-[11px] font-semibold text-brand"
      >
        <CheckIcon className="size-3" /> 5 shorts · 1080×1920
      </motion.span>
    </div>
  );
}

/* ---------- the three cards ---------- */

const steps = [
  {
    n: "01",
    title: "Paste up to 3 links",
    text: "YouTube videos or stream VODs. Kliprix checks the length and whether a chat replay exists.",
    Demo: PasteDemo,
  },
  {
    n: "02",
    title: "It finds the moments",
    text: "Chat activity, audio energy, motion and the transcript are combined, then your AI picks the best clips.",
    Demo: PipelineDemo,
  },
  {
    n: "03",
    title: "Download and post",
    text: "Up to 5 vertical 1080×1920 shorts per video, each with a title, description, hashtags and a LinkedIn post.",
    Demo: ClipsDemo,
  },
];

/**
 * Each card shows its finished state at rest. Hovering a card plays its demo; moving the
 * pointer off stops it and puts the card back at rest. Only the border lights up on hover.
 */
export function HowSteps() {
  const reduce = useReducedMotion();
  // 0 = at rest; any other number is a play run (a new number restarts the demo).
  const [runs, setRuns] = useState([0, 0, 0]);
  const next = useRef(1);

  function set(i: number, v: number) {
    setRuns((r) => r.map((x, j) => (j === i ? v : x)));
  }

  return (
    <div className="mt-12 grid gap-4 lg:grid-cols-3">
      {steps.map((s, i) => (
        <motion.div
          key={s.n}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.12, ease }}
          onHoverStart={() => !reduce && set(i, next.current++)}
          onHoverEnd={() => set(i, 0)}
          className="group grid min-w-0 gap-6 rounded-2xl border border-line bg-linear-to-b from-white/[0.03] to-white/[0.01] p-6 transition-colors duration-300 hover:border-brand/70 sm:p-7 md:max-lg:grid-cols-2 md:max-lg:items-center"
        >
          <div>
            <span className="font-mono text-xs text-brand">{s.n}</span>
            <h3 className="mt-3.5 mb-2 text-[21px] font-semibold">{s.title}</h3>
            <p className="text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
          <div className="h-[150px] min-w-0 overflow-hidden rounded-xl border border-line bg-panel p-4 lg:self-end">
            <s.Demo key={runs[i]} run={runs[i]} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
