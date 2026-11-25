"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import {
  CheckIcon,
  CloudIcon,
  CpuIcon,
  EyeOffIcon,
  LaptopIcon,
  TerminalIcon,
  WalletIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, SectionHead } from "./section-head";

const ease = [0.2, 0.8, 0.2, 1] as const;

/** Counts from 0 to `to` once the number scrolls into view. */
function CountUp({
  to,
  prefix = "",
  suffix = "",
}: {
  to: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [v, setV] = useState(to);

  useEffect(() => {
    if (!inView || reduce || to === 0) return;
    const c = animate(0, to, { duration: 1.1, ease, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, reduce, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {v}
      {suffix}
    </span>
  );
}

const facts: {
  icon: LucideIcon;
  to: number;
  prefix?: string;
  suffix?: string;
  title: string;
  text: string;
}[] = [
  {
    icon: WalletIcon,
    to: 0,
    prefix: "₹",
    title: "Free forever",
    text: "No plans, no credits, no trial that runs out.",
  },
  {
    icon: CpuIcon,
    to: 4,
    suffix: " GB",
    title: "RAM is enough",
    text: "Runs on everyday laptops. Just a bit slower.",
  },
  { icon: EyeOffIcon, to: 0, title: "Trackers", text: "No account, no watermark, no analytics." },
  {
    icon: TerminalIcon,
    to: 1,
    title: "Command to start",
    text: "Installs everything on first run.",
  },
];

export function Privacy() {
  return (
    <Container id="privacy" className="pt-[clamp(90px,14vw,150px)] pb-14 text-center">
      <SectionHead
        center
        eyebrow="Private by design"
        title={
          <span className="mx-auto block max-w-[900px] text-[clamp(38px,6vw,64px)]">
            Your videos never leave <span className="text-brand">your computer.</span>
          </span>
        }
        lede="No account, no cloud and no tracking. Your API key is kept encrypted on your PC, or only in memory if you prefer."
      />

      <div className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.1, ease }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-2xl border border-line bg-linear-to-b from-white/[0.04] to-white/[0.01] p-6 transition-[border-color,box-shadow] duration-300 hover:border-brand/60 hover:shadow-[0_20px_50px_-20px_rgb(255_210_63/0.3)]"
          >
            <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-brand/0 blur-2xl transition-colors duration-500 group-hover:bg-brand/15" />
            <span className="grid size-10 place-items-center rounded-xl border border-line-strong bg-white/[0.03] text-brand transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <f.icon className="size-5" />
            </span>
            <b className="mt-6 block text-[44px] leading-none font-semibold tracking-tight">
              <CountUp to={f.to} prefix={f.prefix} suffix={f.suffix} />
            </b>
            <span className="mt-2 block text-[15px] font-semibold">{f.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              {f.text}
            </span>
          </motion.div>
        ))}
      </div>
    </Container>
  );
}

const rows: [string, string, string][] = [
  ["Price", "Free and open source", "Monthly plan or credits"],
  ["Watermark", "Never", "Often on the free tier"],
  ["Your video", "Stays on your PC", "Uploaded to their servers"],
  ["AI model", "Any provider you choose", "Theirs"],
  ["Hinglish captions", "Built in", "Rare"],
  ["Account", "None", "Required"],
];

function Side({ us }: { us: boolean }) {
  const Icon = us ? LaptopIcon : CloudIcon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: us ? 0 : 0.12, ease }}
      className={cn(
        "relative overflow-hidden rounded-[22px] border p-7 sm:p-8",
        us
          ? "border-brand/50 bg-linear-to-b from-brand/[0.08] to-white/[0.01] shadow-[0_30px_80px_-30px_rgb(255_210_63/0.35)]"
          : "border-line bg-white/[0.015]",
      )}
    >
      {us && (
        <div className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
      )}
      <div className="relative flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-xl",
            us ? "bg-brand text-black" : "bg-white/5 text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className={cn("text-xl font-semibold", !us && "text-muted-foreground")}>
            {us ? "Kliprix" : "Cloud clipping tools"}
          </h3>
          <p className="text-[13px] text-dim">
            {us ? "Runs on your computer" : "Runs on their servers"}
          </p>
        </div>
      </div>
      <ul className="relative mt-6 grid">
        {rows.map(([k, a, b], i) => (
          <motion.li
            key={k}
            initial={{ opacity: 0, x: us ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.07, ease }}
            className="flex items-center gap-3 border-t border-line py-3.5 first:border-t-0"
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full",
                us ? "bg-brand/15 text-brand" : "bg-white/5 text-dim",
              )}
            >
              {us ? (
                <CheckIcon className="size-3.5" strokeWidth={3} />
              ) : (
                <XIcon className="size-3.5" />
              )}
            </span>
            <span className="w-32 shrink-0 text-[13px] text-dim">{k}</span>
            <span className={cn("text-[15px]", us ? "font-semibold" : "text-muted-foreground")}>
              {us ? a : b}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export function Compare() {
  return (
    <Container className="pt-[clamp(70px,10vw,110px)] pb-10">
      <SectionHead
        eyebrow="Why local"
        title="Kliprix vs. cloud clippers"
        lede="Same idea, different deal. Cloud tools rent you their servers; Kliprix uses the computer you already own."
      />
      <div className="mt-12 grid gap-4 lg:grid-cols-[1.08fr_1fr]">
        <Side us />
        <Side us={false} />
      </div>
    </Container>
  );
}
