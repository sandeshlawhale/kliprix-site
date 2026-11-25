"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Advances a word index on a timer; stays still for reduced motion. */
function useTicker(length: number, ms = 520) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % length), ms);
    return () => clearInterval(t);
  }, [length, ms]);
  return i;
}

const styles = [
  { name: "Pop", img: 1, words: ["why", "is", "everyone", "shooting"] },
  { name: "Karaoke", img: 3, words: ["Here", "my", "plan", "is"] },
  { name: "Boxed", img: 2, words: ["I", "noticed", "the", "pathway"] },
] as const;

function Caption({ style, i }: { style: (typeof styles)[number]; i: number }) {
  const w = style.words;
  const k = i % w.length;
  if (style.name === "Pop") {
    // 1–3 words at a time; the spoken word is yellow.
    const start = k < 2 ? 0 : 2;
    return (
      <>
        {w.slice(start, start + 2).map((word, j) => (
          <span key={word} className={cn(start + j === k && "text-brand")}>
            {word}{" "}
          </span>
        ))}
      </>
    );
  }
  if (style.name === "Karaoke") {
    return (
      <>
        {w.map((word, j) => (
          <span key={word} className={cn(j === k ? "text-brand" : j > k && "text-white/45")}>
            {word}{" "}
          </span>
        ))}
      </>
    );
  }
  return (
    <>
      {w.map((word, j) => (
        <span key={word} className={cn(j === k && "rounded bg-violet px-1 [text-shadow:none]")}>
          {word}{" "}
        </span>
      ))}
    </>
  );
}

export function CaptionStyles() {
  const i = useTicker(4);
  const [sel, setSel] = useState(0);
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {styles.map((s, idx) => (
        <motion.button
          key={s.name}
          type="button"
          onClick={() => setSel(idx)}
          aria-pressed={sel === idx}
          variants={{
            rest: { y: 0, rotate: 0 },
            hover: {
              y: -8,
              rotate: (idx - 1) * 3,
              transition: { delay: idx * 0.08, type: "spring", stiffness: 300, damping: 18 },
            },
          }}
          className="group text-center"
        >
          <div
            className={cn(
              "relative aspect-[9/16] overflow-hidden rounded-xl border border-line-strong transition-shadow",
              sel === idx && "border-brand shadow-[0_0_0_3px_rgb(255_210_63/0.18)]",
            )}
          >
            <img
              src={`/media/clip-${s.img}.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="caption-text absolute inset-x-1 bottom-[24%] text-[12px] leading-tight text-white">
              <Caption style={s} i={i} />
            </div>
          </div>
          <span
            className={cn(
              "mt-2 block text-xs text-muted-foreground group-hover:text-foreground",
              sel === idx && "text-foreground",
            )}
          >
            {s.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

const lines = {
  English: ["Hello,", "how", "are", "you?"],
  Hinglish: ["Namaste", "kaise", "ho", "aap?"],
};

export function LanguageToggle() {
  const [lang, setLang] = useState<keyof typeof lines>("Hinglish");
  const i = useTicker(4, 600);
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Caption language"
        className="mt-5 inline-flex rounded-[10px] border border-line-strong p-[3px] text-[13px]"
      >
        {(Object.keys(lines) as (keyof typeof lines)[]).map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={lang === l}
            onClick={() => setLang(l)}
            className={cn(
              "rounded-[7px] px-3.5 py-1.5 transition-colors",
              lang === l
                ? "bg-brand font-semibold text-black"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>
      <motion.p
        variants={{ rest: { scale: 1 }, hover: { scale: 1.1 } }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="caption-text mt-5 text-center text-[22px] leading-tight"
      >
        {lines[lang].map((w, j) => (
          <span key={w} className={cn(j === i && "text-brand")}>
            {w}{" "}
          </span>
        ))}
      </motion.p>
    </div>
  );
}
