import { CheckIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { WindowsIcon } from "./icons";
import { HeroReel } from "./hero-reel";

const facts = ["Works on 4 GB RAM", "Bring any AI: free tiers work", "MIT licensed"];

/*
 * Sizes use min(vw, vh) so the top of the clip fan always shows above the fold
 * (about a third of the center phone on a 1440x900 or 1366x768 screen), which invites the scroll.
 */
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden text-center">
      <div className="hero-glow pointer-events-none absolute inset-x-0 -top-52 h-[900px]" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-[1200px] px-5 pt-[clamp(28px,5.5vh,60px)] sm:px-8">
        <span className="inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white/[0.03] py-1.5 pr-3.5 pl-1.5 text-[13px] text-muted-foreground">
          <span className="rounded-full bg-brand/15 px-2.5 py-0.5 font-semibold text-brand">
            Free
          </span>
          Open source · runs 100% on your PC
        </span>

        <h1 className="mx-auto mt-[clamp(16px,2.6vh,26px)] mb-[clamp(12px,2vh,20px)] max-w-[1180px] text-[clamp(38px,min(6.2vw,8.2vh),80px)] leading-[1.02] font-bold">
          One long video in.
          <br />
          <span className="text-gradient">Five scroll-stopping shorts</span> out.
        </h1>

        <p className="mx-auto max-w-[640px] text-[clamp(16px,2.1vh,19px)] leading-relaxed text-muted-foreground">
          Kliprix finds the best moments in your streams, frames the action, adds word-by-word
          captions and writes your titles. No account. No watermark. No upload.
        </p>

        <div className="mt-[clamp(20px,3.2vh,32px)] flex flex-wrap justify-center gap-3">
          <a
            href={site.downloadZip}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 gap-2.5 rounded-xl px-5 text-[15px] font-semibold glow-brand",
            )}
          >
            <WindowsIcon className="size-[18px]" />
            Download for Windows
          </a>
          <a
            href="#install"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 rounded-xl border-line-strong bg-white/[0.04] px-5 text-[15px] font-semibold",
            )}
          >
            macOS &amp; Linux
          </a>
        </div>

        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[13px] text-dim">
          {facts.map((f) => (
            <li key={f} className="flex items-center gap-1">
              <CheckIcon className="size-3.5 text-brand" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(28px,4.5vh,52px)]">
          <HeroReel />
        </div>
      </div>
    </section>
  );
}
