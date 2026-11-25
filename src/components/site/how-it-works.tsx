/* eslint-disable @next/next/no-img-element */
import { CheckIcon } from "lucide-react";
import { Container, SectionHead } from "./section-head";
import { CopyButton } from "./copy-button";

const providers = ["Gemini", "Claude", "OpenAI", "OpenRouter", "LM Studio", "llama.cpp"];

export function ProviderStrip() {
  return (
    <div className="border-y border-line py-6">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-5 sm:px-8 md:flex-row md:justify-between">
        <small className="text-[13px] whitespace-nowrap text-dim">
          Use the AI you already have
        </small>
        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-[17px] font-semibold tracking-tight text-[#c9c9d1] opacity-75">
          {providers.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  text,
  children,
}: {
  n: string;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background px-7 pt-7 pb-8">
      <span className="font-mono text-xs text-brand">{n}</span>
      <h3 className="mt-3.5 mb-2 text-[21px] font-semibold">{title}</h3>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{text}</p>
      <div className="mt-6 flex h-[120px] flex-col justify-center gap-2 rounded-xl border border-line bg-panel p-4">
        {children}
      </div>
    </div>
  );
}

function Prog({ label, pct, done }: { label: string; pct: number; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-[12.5px] text-muted-foreground">
      {done ? <CheckIcon className="size-3.5 text-ok" /> : <span className="text-brand">●</span>}
      <span className="w-32 shrink-0 sm:w-auto">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/7">
        <i className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const thumbs = [1, 3, 4, 6, 2];

export function HowItWorks() {
  return (
    <Container id="how" className="pt-[clamp(80px,12vw,130px)] pb-10">
      <SectionHead
        eyebrow="How it works"
        title="From link to posted"
        sub="in three steps."
        lede="No timeline to learn. Paste, press Start, and come back to finished clips."
      />
      <div className="reveal mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
        <Step
          n="01"
          title="Paste up to 3 links"
          text="YouTube videos or stream VODs. Kliprix checks the length and whether a chat replay exists."
        >
          <div className="flex h-9 items-center gap-2 rounded-lg border border-line-strong pr-1.5 pl-3 font-mono text-[12.5px] text-muted-foreground">
            youtube.com/watch?v=…
            <b className="ml-auto rounded-md bg-foreground px-2.5 py-1 font-sans text-xs text-black">
              Add
            </b>
          </div>
          <div className="flex h-9 items-center rounded-lg border border-line-strong px-3 font-mono text-[12.5px] text-muted-foreground opacity-50">
            Paste a video link
          </div>
        </Step>
        <Step
          n="02"
          title="It finds the moments"
          text="Chat activity, audio energy, motion and the transcript are combined, then your AI picks the best clips."
        >
          <Prog label="Download" pct={100} done />
          <Prog label="Highlights" pct={100} done />
          <Prog label="Editing clip 3 of 5" pct={55} />
        </Step>
        <Step
          n="03"
          title="Download and post"
          text="Up to 5 vertical 1080×1920 shorts per video, each with a title, description, hashtags and a LinkedIn post."
        >
          <div className="flex justify-center gap-2">
            {thumbs.map((n) => (
              <img
                key={n}
                src={`/media/clip-${n}.jpg`}
                alt=""
                loading="lazy"
                className="aspect-[9/16] w-11 rounded-md border border-line-strong object-cover"
              />
            ))}
          </div>
        </Step>
      </div>
      <AppWindow />
    </Container>
  );
}

const pipeline = [
  "Download",
  "Chat replay",
  "Audio & motion",
  "Highlights",
  "Transcription",
  "Picking clips",
];

function Pipe({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {pipeline.map((s) => (
        <span
          key={s}
          className="rounded-full border border-ok/30 bg-ok/6 px-2.5 py-1 text-[11.5px] text-ok"
        >
          {s}
        </span>
      ))}
      <span
        className={
          active
            ? "rounded-full border border-brand/40 bg-brand/8 px-2.5 py-1 text-[11.5px] text-brand"
            : "rounded-full border border-ok/30 bg-ok/6 px-2.5 py-1 text-[11.5px] text-ok"
        }
      >
        {active ?? "Editing"}
      </span>
    </div>
  );
}

// Metadata Kliprix generated for the "Stealth gunfight in GTA 6" clip (clip-6), copied as is.
const meta = [
  { k: "On-video title", v: "Stealth gunfight in GTA 6" },
  { k: "YouTube title", v: "Intense Stealth Gunfight in GTA 6 Gameplay" },
  { k: "Hashtags", v: "#gtavi #gta6 #gaming #action #play", tags: true },
];

/** A drawing of the batch page, built from real clips and real generated metadata. */
function AppWindow() {
  return (
    <div className="reveal mt-16 overflow-hidden rounded-[18px] border border-line-strong bg-linear-to-b from-[#121218] to-[#0b0b0f] shadow-[0_60px_120px_-40px_rgb(255_210_63/0.18),0_30px_80px_-20px_rgb(0_0_0/0.9)]">
      <div className="flex h-10 items-center gap-[7px] border-b border-line px-4">
        <i className="size-[11px] rounded-full bg-[#2a2a31]" />
        <i className="size-[11px] rounded-full bg-[#2a2a31]" />
        <i className="size-[11px] rounded-full bg-[#2a2a31]" />
        <span className="ml-3.5 font-mono text-xs text-dim">127.0.0.1:3000 · Kliprix</span>
      </div>
      <div className="grid min-h-[470px] lg:grid-cols-[220px_1fr_300px]">
        <aside className="hidden border-r border-line px-3.5 py-4.5 text-[13px] text-muted-foreground lg:block">
          <b className="text-foreground">Kliprix</b>
          <div className="my-3 mb-4.5 rounded-lg border border-line-strong px-2.5 py-2 text-foreground">
            + New clips
          </div>
          <div className="rounded-md bg-white/6 px-2.5 py-1.5 text-foreground">
            GTA 6 · first day
          </div>
          <div className="px-2.5 py-1.5">Jett to Rank 1</div>
          <div className="px-2.5 py-1.5">Minecraft hardcore</div>
        </aside>
        <div className="p-5 sm:p-7">
          <h4 className="text-lg font-semibold tracking-tight">Batch · 2 videos</h4>
          <p className="mt-1 mb-5.5 text-[13px] text-dim">
            Videos run one after another, clips one at a time.
          </p>
          <div className="mb-3 rounded-xl border border-line bg-white/[0.015] p-4">
            <div className="mb-3 flex justify-between text-sm font-semibold">
              My first day in Vice City <small className="font-medium text-dim">5 clips</small>
            </div>
            <Pipe />
            <div className="mt-3.5 flex gap-2.5">
              {[6, 1, 4, 3, 2].map((n) => (
                <img
                  key={n}
                  src={`/media/clip-${n}.jpg`}
                  alt=""
                  loading="lazy"
                  className="aspect-[9/16] w-[15%] max-w-[62px] rounded-lg border border-line-strong object-cover"
                />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-white/[0.015] p-4">
            <div className="mb-3 flex justify-between text-sm font-semibold">
              Jett to Rank 1 begins <small className="font-medium text-dim">3 of 5</small>
            </div>
            <Pipe active="Editing · clip 4" />
            <div className="mt-3.5 flex gap-2.5">
              {[7, 3, 5].map((n) => (
                <img
                  key={n}
                  src={`/media/clip-${n}.jpg`}
                  alt=""
                  loading="lazy"
                  className="aspect-[9/16] w-[15%] max-w-[62px] rounded-lg border border-line-strong object-cover"
                />
              ))}
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="grid aspect-[9/16] w-[15%] max-w-[62px] place-items-center rounded-lg border border-dashed border-line-strong text-[11px] text-dim"
                >
                  queued
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-line p-5 text-[13px] lg:border-t-0 lg:border-l">
          {meta.map((m) => (
            <div key={m.k}>
              <h5 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-dim uppercase">
                {m.k}
              </h5>
              <div className="mb-3.5 flex items-start justify-between gap-3 rounded-lg border border-line px-3 py-2.5 leading-snug">
                <span className={m.tags ? "text-violet" : "text-[#d8d8de]"}>{m.v}</span>
                <CopyButton text={m.v} />
              </div>
            </div>
          ))}
          <h5 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-dim uppercase">
            Why this moment
          </h5>
          <div className="rounded-lg border border-line px-3 py-2.5 leading-snug text-muted-foreground">
            The player uses stealth to take down enemies one by one in a tense gunfight before
            escaping.
          </div>
        </div>
      </div>
    </div>
  );
}
