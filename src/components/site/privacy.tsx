"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import {
  CheckIcon,
  CpuIcon,
  EyeOffIcon,
  TerminalIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
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
            className="group relative overflow-hidden rounded-2xl border border-line bg-linear-to-b from-white/[0.04] to-white/[0.01] p-6 transition-colors duration-300 hover:border-brand/60"
          >
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

export function Compare() {
  return (
    <Container className="pt-[clamp(70px,10vw,110px)] pb-10">
      <SectionHead eyebrow="Why local" title="Kliprix vs. cloud clippers" />
      <div className="reveal mt-11 overflow-x-auto">
        <table className="w-full border-collapse text-[14px] sm:text-[15px]">
          <thead>
            <tr className="border-b border-line text-left text-[13px] font-semibold">
              <th className="py-4 pr-3 sm:px-5" />
              <th className="px-3 py-4 text-brand sm:px-5">Kliprix</th>
              <th className="px-3 py-4 text-dim sm:px-5">Typical cloud clipping tool</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, us, them]) => (
              <tr key={k} className="border-b border-line">
                <td className="py-4 pr-3 text-muted-foreground sm:px-5">{k}</td>
                <td className="px-3 py-4 font-semibold sm:px-5">
                  <span className="flex items-center gap-2">
                    <CheckIcon className="size-4 shrink-0 text-brand" />
                    {us}
                  </span>
                </td>
                <td className="px-3 py-4 text-[#d8d8de] sm:px-5">{them}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
