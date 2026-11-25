"use client";

import { DownloadIcon } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { HeroReel } from "./hero-reel";

const container: Variants = { show: { transition: { staggerChildren: 0.09 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] },
  },
};

/*
 * Sizes use min(vw, vh) so the top of the clip fan always shows above the fold, which invites
 * the scroll. The section ends exactly at the bottom of the center clip; the side clips are cut
 * at the same line and a full-width fade covers that edge.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden text-center">
      <div className="hero-glow pointer-events-none absolute inset-x-0 -top-52 h-[900px]" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-[1200px] px-5 pt-[clamp(28px,5.5vh,60px)] sm:px-8"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white/[0.03] py-1.5 pr-3.5 pl-1.5 text-[13px] text-muted-foreground"
        >
          <span className="rounded-full bg-brand/15 px-2.5 py-0.5 font-semibold text-brand">
            Free
          </span>
          Open source · runs 100% on your PC
        </motion.span>

        <motion.h1
          variants={item}
          className="mx-auto mt-[clamp(16px,2.6vh,26px)] mb-[clamp(12px,2vh,20px)] max-w-[1180px] text-[clamp(38px,min(6.2vw,8.2vh),80px)] leading-[1.02] font-bold"
        >
          One long video in.
          <br />
          <span className="text-gradient">Five scroll-stopping shorts</span> out.
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto max-w-[660px] text-[clamp(16px,2.1vh,19px)] leading-relaxed text-muted-foreground"
        >
          Kliprix finds the best moments in your streams, frames the action, adds word-by-word
          captions and writes your titles, all on your computer. No account. No watermark.
        </motion.p>

        <motion.div variants={item} className="mt-[clamp(20px,3.2vh,32px)] flex justify-center">
          <a
            href={site.downloadZip}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2.5 rounded-xl px-6 text-[15px] font-semibold glow-brand",
            )}
          >
            <DownloadIcon className="size-[18px]" />
            Download for Free
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative mt-[clamp(28px,4.5vh,52px)]"
      >
        <HeroReel />
      </motion.div>

      {/* Full-width fade over the bottom edge of the clips. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[clamp(120px,22vh,220px)] bg-linear-to-b from-transparent via-background/70 to-background" />
    </section>
  );
}
