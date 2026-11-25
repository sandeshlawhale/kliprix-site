"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, SectionHead } from "./section-head";
import { CaptionStyles, HoverContext, LanguageToggle } from "./caption-demos";
import { providerLogos } from "./provider-logos";

const spring = { type: "spring", stiffness: 260, damping: 22 } as const;

/**
 * A bento card. Hovering it sets the "hover" variant, which every motion child inside picks
 * up, and shares the hover state through HoverContext for the demos that run on a timer.
 * Leaving the card returns everything to rest. At rest the card is grayscale; on hover its
 * colors fade in slowly and the border lights up.
 */
function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <motion.div
      initial="rest"
      animate={on ? "hover" : "rest"}
      onHoverStart={() => setOn(true)}
      onHoverEnd={() => setOn(false)}
      className={cn(
        "reveal relative min-w-0 overflow-hidden rounded-[20px] border border-line bg-linear-to-b from-white/[0.03] to-white/[0.01] p-6 transition-[filter,border-color] duration-700 ease-out hover:border-brand/70 sm:p-7 lg:grayscale lg:hover:grayscale-0",
        className,
      )}
    >
      <HoverContext.Provider value={on}>{children}</HoverContext.Provider>
    </motion.div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-[22px] font-semibold">{children}</h3>;
}

function CardText({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-[440px] text-[15px] leading-relaxed text-muted-foreground">{children}</p>
  );
}

/* ---------- highlight signals ---------- */

/** Deterministic bars (same on server and client); bars 38–46 are the picked moment. */
function bars(seed: number, boost: number) {
  let s = seed;
  return Array.from({ length: 64 }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    const hot = i >= 38 && i <= 46;
    const h = 12 + (s / 233280) * 45 + (hot ? 40 + boost : 0);
    return { h: Math.min(100, Math.round(h)), hot };
  });
}

const signals = [
  { label: "Chat activity", seed: 3 },
  { label: "Audio energy", seed: 7 },
  { label: "Motion", seed: 11 },
  { label: "Transcript", seed: 5 },
];

const bar = (i: number, hot: boolean): Variants => ({
  rest: { scaleY: hot ? 0.75 : 0.55, opacity: hot ? 0.85 : 1 },
  hover: { scaleY: 1, opacity: 1, transition: { delay: i * 0.006, ...spring } },
});

function Signals() {
  return (
    <div className="relative mt-6" aria-hidden="true">
      <div className="grid gap-3">
        {signals.map((sig, k) => (
          <div
            key={sig.label}
            className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3.5 text-[12.5px] text-muted-foreground"
          >
            {sig.label}
            <div className="flex h-[30px] min-w-0 items-end gap-px sm:gap-[3px]">
              {bars(sig.seed, k * 4).map((b, i) => (
                <motion.i
                  key={i}
                  variants={bar(i, b.hot)}
                  className={cn(
                    "flex-1 origin-bottom rounded-[2px]",
                    b.hot ? "bg-brand" : "bg-white/12",
                  )}
                  style={{ height: `${b.h}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Playhead that sweeps to the picked moment. */}
      <motion.div
        variants={{
          rest: { left: "calc(110px + 0%)", opacity: 0 },
          hover: {
            left: "calc(110px + (100% - 110px) * 0.665)",
            opacity: 1,
            transition: { duration: 0.9, ease: [0.2, 0.8, 0.2, 1] },
          },
        }}
        className="absolute -top-2 -bottom-2 w-0.5 rounded-full bg-brand shadow-[0_0_14px_var(--brand)]"
      />
    </div>
  );
}

/* ---------- framed for vertical: 16:9 becomes 9:16 ---------- */

function Reframe() {
  return (
    <div className="grid h-[170px] place-items-center" aria-hidden="true">
      <motion.div
        variants={{
          rest: { width: 220, height: 124, borderRadius: 10 },
          hover: { width: 86, height: 153, borderRadius: 14 },
        }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="relative overflow-hidden border border-line-strong shadow-[0_20px_40px_-15px_rgb(0_0_0/0.9)]"
      >
        <img src="/media/clip-1.jpg" alt="" loading="lazy" className="size-full object-cover" />
        <motion.span
          variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
          className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px]"
        >
          16:9
        </motion.span>
        <motion.span
          variants={{ rest: { opacity: 0 }, hover: { opacity: 1, transition: { delay: 0.3 } } }}
          className="absolute top-1.5 left-1.5 rounded bg-brand px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black"
        >
          9:16
        </motion.span>
      </motion.div>
    </div>
  );
}

/* ---------- copy-ready post text ---------- */

// Text Kliprix generated for the "Stealth gunfight in GTA 6" clip.
const posts = [
  { k: "Title", v: "Intense Stealth Gunfight in GTA 6 Gameplay" },
  { k: "Hashtags", v: "#gtavi #gta6 #gaming #action" },
  { k: "On-video", v: "Stealth gunfight in GTA 6" },
];

function CopyRows() {
  return (
    <div className="grid gap-2" aria-hidden="true">
      {posts.map((p, i) => (
        <div
          key={p.k}
          className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-[12.5px]"
        >
          <span className="w-16 shrink-0 text-dim">{p.k}</span>
          <span className="min-w-0 truncate text-[#d8d8de]">{p.v}</span>
          <span className="relative ml-auto h-5 w-[68px] shrink-0">
            <motion.span
              variants={{
                rest: { opacity: 1, y: 0 },
                hover: { opacity: 0, y: -8, transition: { delay: 0.15 + i * 0.25 } },
              }}
              className="absolute inset-0 flex items-center justify-end gap-1 text-muted-foreground"
            >
              <CopyIcon className="size-3" /> Copy
            </motion.span>
            <motion.span
              variants={{
                rest: { opacity: 0, y: 8 },
                hover: { opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.25 } },
              }}
              className="absolute inset-0 flex items-center justify-end gap-1 font-medium text-ok"
            >
              <CheckIcon className="size-3" /> Copied
            </motion.span>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- AI providers light up one at a time, then the lock closes ---------- */

const STEP = 0.14;
const LOCK_AT = providerLogos.length * STEP + 0.45; // after the last provider has lit up

function Providers() {
  return (
    <ul className="mt-5 flex flex-wrap gap-2 pr-14">
      {providerLogos.map((p, i) => (
        <motion.li
          key={p.name}
          variants={{
            rest: { borderColor: "rgb(255 255 255 / 0.14)", color: "#c9c9d1" },
            hover: {
              borderColor: "rgb(255 210 63 / 0.6)",
              color: "#ffd23f",
              transition: { delay: i * STEP, duration: 0.25 },
            },
          }}
          className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            fillRule="evenodd"
            aria-hidden="true"
            className="size-3.5"
            dangerouslySetInnerHTML={{ __html: p.svg }}
          />
          {p.name}
        </motion.li>
      ))}
    </ul>
  );
}

/** A padlock that slides in half hidden past the card's right edge, open, then snaps shut. */
function KeyLock() {
  return (
    <motion.svg
      viewBox="0 -12 48 68"
      aria-hidden="true"
      variants={{
        rest: { x: 70, rotate: 24, opacity: 0, transition: { duration: 0.25 } },
        hover: {
          x: 0,
          rotate: -14,
          opacity: 0.55,
          transition: { type: "spring", stiffness: 200, damping: 18 },
        },
      }}
      className="pointer-events-none absolute -right-8 bottom-4 w-20 origin-bottom overflow-visible"
    >
      <motion.path
        d="M14 26V17a10 10 0 0 1 20 0v9"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        variants={{
          rest: { y: -8, stroke: "#9a9aa6" },
          hover: {
            y: [-8, -8, 0],
            stroke: ["#9a9aa6", "#9a9aa6", "#ffd23f"],
            transition: { duration: LOCK_AT + 0.2, times: [0, 0.82, 1], ease: "easeIn" },
          },
        }}
      />
      <motion.rect
        x="6"
        y="24"
        width="36"
        height="30"
        rx="7"
        variants={{
          rest: { fill: "#2a2a31" },
          hover: {
            fill: ["#2a2a31", "#2a2a31", "#ffd23f"],
            transition: { duration: LOCK_AT + 0.25, times: [0, 0.82, 1] },
          },
        }}
      />
      <motion.circle
        cx="24"
        cy="37"
        r="3.6"
        variants={{
          rest: { fill: "#9a9aa6" },
          hover: {
            fill: ["#9a9aa6", "#9a9aa6", "#111111"],
            transition: { duration: LOCK_AT + 0.25, times: [0, 0.82, 1] },
          },
        }}
      />
      <motion.rect
        x="22.2"
        y="38"
        width="3.6"
        height="8"
        rx="1.8"
        variants={{
          rest: { fill: "#9a9aa6" },
          hover: {
            fill: ["#9a9aa6", "#9a9aa6", "#111111"],
            transition: { duration: LOCK_AT + 0.25, times: [0, 0.82, 1] },
          },
        }}
      />
    </motion.svg>
  );
}

/* ---------- quick edits: handles widen, keys press ---------- */

function Editor() {
  return (
    <div className="mt-5 grid gap-2.5" aria-hidden="true">
      <div className="relative h-[46px] overflow-hidden rounded-[10px] border border-line bg-[repeating-linear-gradient(90deg,#1c1c23_0_18px,#22222a_18px_36px)]">
        <motion.div
          variants={{
            rest: { left: "18%", right: "26%" },
            hover: { left: "8%", right: "38%" },
          }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          className="absolute inset-y-[-2px] rounded-[10px] border-2 border-brand shadow-[0_0_0_999px_rgb(8_8_11/0.55)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {[
          ["S", "split"],
          ["Del", "delete"],
          ["← →", "word"],
        ].map(([k, l], i) => (
          <span key={k} className="flex items-center gap-1.5">
            <motion.kbd
              variants={{
                rest: { y: 0, borderBottomWidth: 2 },
                hover: {
                  y: [0, 2, 0],
                  borderBottomWidth: [2, 1, 2],
                  color: ["#f4f4f6", "#ffd23f", "#f4f4f6"],
                  transition: { delay: 0.2 + i * 0.25, duration: 0.3 },
                },
              }}
              className="rounded-md border border-line-strong px-1.5 py-px font-mono text-[11.5px] text-foreground"
            >
              {k}
            </motion.kbd>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Features() {
  return (
    <Container id="features" className="pt-[clamp(56px,8vw,96px)] pb-6">
      <SectionHead
        eyebrow="Features"
        title="Everything a clip needs."
        sub="Nothing you have to fiddle with."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardTitle>Finds highlights the way viewers do</CardTitle>
          <CardText>
            Four signals are read together, so it picks the moment chat lost it and not just a loud
            noise. Every clip tells you why it was picked.
          </CardText>
          <Signals />
          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[13px]">
            <b className="rounded-lg border border-brand/30 bg-brand/12 px-2.5 py-1 text-xs font-semibold text-brand">
              Clip 04 · 24:44
            </b>
            “Takes down enemies one by one in a tense gunfight, then escapes.”
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>3 caption styles</CardTitle>
          <CardText>The spoken word lights up as it&apos;s said.</CardText>
          <CaptionStyles />
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>English or Hinglish</CardTitle>
          <CardText>Hindi written the way your audience types it in chat.</CardText>
          <LanguageToggle />
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Your AI, your key</CardTitle>
          <CardText>
            Pick any provider. Free tiers are enough, or run a local model with no key at all.
          </CardText>
          <Providers />
          <KeyLock />
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Quick edits, no timeline</CardTitle>
          <CardText>
            Trim, fix a caption word, split or crop, preview live, then download at full quality.
          </CardText>
          <Editor />
        </Card>

        <Card className="lg:col-span-3">
          <div className="grid items-center gap-4 sm:max-md:grid-cols-[1fr_auto] xl:grid-cols-[1fr_auto]">
            <div>
              <CardTitle>Framed for vertical</CardTitle>
              <CardText>
                Blurred background, the main video framed on the face or the full frame, a punchy
                title on top and captions below. 1080×1920, 30 fps.
              </CardText>
            </div>
            <div className="sm:max-md:w-[230px] xl:w-[230px]">
              <Reframe />
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-3">
          <CardTitle>Copy-ready post text</CardTitle>
          <CardText>
            Title, description, hashtags and a LinkedIn post for every clip, one click to copy.
          </CardText>
          <div className="mt-5">
            <CopyRows />
          </div>
        </Card>
      </div>
    </Container>
  );
}
