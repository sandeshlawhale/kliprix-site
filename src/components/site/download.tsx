"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  BoxIcon,
  CheckIcon,
  CircleCheckIcon,
  DownloadIcon,
  GitBranchIcon,
  MessageSquareIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { repoUrl, site } from "@/lib/site";
import type { TrackEvent } from "@/lib/analytics/core";
import { CopyButton } from "./copy-button";

type Os = "windows" | "macos" | "linux";
const osLabels: Record<Os, string> = { windows: "Windows", macos: "macOS", linux: "Linux" };

const subscribeNever = () => () => {};
function detectOs(): Os {
  const ua = navigator.userAgent;
  if (/Mac|iPhone|iPad/.test(ua)) return "macos";
  if (/Linux|CrOS/.test(ua) && !/Android/.test(ua)) return "linux";
  return "windows";
}
/** The visitor's OS, read once in the browser; "windows" while rendering on the server. */
function useDetectedOs(): Os {
  return useSyncExternalStore(subscribeNever, detectOs, () => "windows");
}

const cloneCmd = `git clone ${repoUrl}.git && cd Kliprix`;
const dockerCmd = `${cloneCmd} && docker compose up --build`;
const doctorCmd = "python scripts/doctor.py";
// scripts/start.sh may not be marked executable after unzipping or cloning, so it runs with sh.
const startCmds = [
  { label: "Windows", cmd: "scripts\\start.bat" },
  { label: "macOS / Linux", cmd: "sh scripts/start.sh" },
];
const appUrl = "http://localhost:3000";

/** One command with a Copy button. Long commands wrap instead of scrolling. */
function Command({ cmd, trackEvent }: { cmd: string; trackEvent?: TrackEvent }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-line bg-black/30 py-2 pr-2 pl-3">
      <code className="min-w-0 flex-1 py-0.5 font-mono text-[12.5px] leading-relaxed break-all text-[#d8d8de] sm:text-[13px]">
        {cmd}
      </code>
      <CopyButton text={cmd} trackEvent={trackEvent} className="shrink-0 px-2 py-1 text-xs" />
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <li className="relative flex gap-4">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong bg-white/[0.04] text-[13px] font-semibold text-brand tabular-nums"
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[15px] font-semibold">{title}</p>
        {children && <div className="mt-2 space-y-2 text-sm text-muted-foreground">{children}</div>}
      </div>
    </li>
  );
}

/** Check, start and open: the steps after the code is on the PC. */
function StartSteps({ unzip }: { unzip?: boolean }) {
  let n = 0;
  return (
    <ol className="space-y-5" aria-label="Next steps">
      {unzip && (
        <Step n={++n} title="Unzip Kliprix.zip">
          <p>
            You get a <b className="font-semibold text-foreground">Kliprix</b> folder. Open a
            terminal in it (on Windows: right-click the folder → Open in Terminal).
          </p>
        </Step>
      )}
      <Step n={++n} title="Check your PC">
        <Command cmd={doctorCmd} />
        <p>It lists anything missing, with a fix for each problem.</p>
      </Step>
      <Step n={++n} title="Start Kliprix">
        {startCmds.map((s) => (
          <div key={s.cmd}>
            <span className="mb-1 block text-xs text-dim">{s.label}</span>
            <Command cmd={s.cmd} />
          </div>
        ))}
        <p>
          The first start installs everything else (several minutes, about 1.5 GB). Later starts
          take seconds.
        </p>
      </Step>
      <Step n={++n} title="Open Kliprix">
        <p>
          <a
            href={appUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-foreground underline underline-offset-2 hover:text-brand"
          >
            {appUrl}
          </a>{" "}
          in your browser. Press Ctrl+C in the terminal to stop it.
        </p>
      </Step>
    </ol>
  );
}

function ZipPanel() {
  const [started, setStarted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  // Keyboard and screen reader users land on the new view instead of a removed button.
  useEffect(() => {
    if (started) heading.current?.focus();
  }, [started]);

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center sm:py-8">
        <a
          href="/api/download"
          onClick={() => setStarted(true)}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-14 gap-3 rounded-2xl px-8 text-[17px] font-semibold glow-brand",
          )}
        >
          <DownloadIcon className="size-5" />
          Download Kliprix {site.version}
        </a>
        <p className="text-[13px] text-dim">
          Kliprix.zip · Windows, macOS and Linux · free, MIT license
        </p>
        <p className="max-w-[460px] text-[13px] text-muted-foreground">
          Install Python, Node.js and FFmpeg first if you don&apos;t have them:{" "}
          <a href="#requirements" className="underline underline-offset-2 hover:text-foreground">
            see the requirements
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex items-start gap-3">
        <CircleCheckIcon className="mt-1 size-6 shrink-0 text-ok" aria-hidden="true" />
        <div>
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-[22px] leading-tight font-semibold outline-none"
          >
            Your download has started
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" role="status">
            Kliprix.zip, version {site.version}. Didn&apos;t start?{" "}
            <a
              href={site.downloadUrl}
              className="font-medium text-foreground underline underline-offset-2 hover:text-brand"
            >
              Click here
            </a>
            .
          </p>
        </div>
      </div>
      <div className="mt-7">
        <StartSteps unzip />
      </div>
    </div>
  );
}

function GitPanel() {
  return (
    <div className="space-y-6 py-2">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Needs Git. Clone the repository and go into it:
        </p>
        <Command cmd={cloneCmd} trackEvent="copy_clone" />
      </div>
      <StartSteps />
      <p className="text-[13px] text-dim">Update later with git pull, then start again.</p>
    </div>
  );
}

function DockerPanel() {
  return (
    <div className="space-y-6 py-2">
      <div>
        <p className="mb-2 text-sm text-muted-foreground">
          Needs Git and Docker Desktop (or Docker Engine with Compose). Python, Node.js and FFmpeg
          come inside the containers.
        </p>
        <Command cmd={dockerCmd} trackEvent="copy_docker" />
      </div>
      <ul className="space-y-2.5 text-sm">
        {[
          "CPU only: captions do not use an NVIDIA GPU inside Docker.",
          "Docker Desktop needs about 2 GB of RAM by itself. On a 4 GB PC, use the ZIP instead.",
        ].map((t) => (
          <li key={t} className="flex gap-2.5 text-muted-foreground">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        When it is up, open{" "}
        <a
          href={appUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-foreground underline underline-offset-2 hover:text-brand"
        >
          {appUrl}
        </a>
        . Your data is kept in the <code className="font-mono text-foreground">data</code> folder.
      </p>
    </div>
  );
}

/** ZIP (default), Git or Docker. */
export function InstallOptions() {
  return (
    <Tabs
      defaultValue="zip"
      className="rounded-3xl border border-line bg-linear-to-b from-white/[0.04] to-white/[0.01] p-4 sm:p-7"
    >
      <TabsList aria-label="How to install">
        <TabsTrigger value="zip">
          <DownloadIcon aria-hidden="true" />
          ZIP
        </TabsTrigger>
        <TabsTrigger value="git">
          <GitBranchIcon aria-hidden="true" />
          Git
        </TabsTrigger>
        <TabsTrigger value="docker">
          <BoxIcon aria-hidden="true" />
          Docker
          <Badge variant="outline" className="ml-0.5 h-4 border-line-strong px-1.5 text-[10px]">
            Advanced
          </Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="zip" className="mt-5 rounded-lg">
        <ZipPanel />
      </TabsContent>
      <TabsContent value="git" className="mt-5 rounded-lg">
        <GitPanel />
      </TabsContent>
      <TabsContent value="docker" className="mt-5 rounded-lg">
        <DockerPanel />
      </TabsContent>
    </Tabs>
  );
}

type Requirement = {
  title: string;
  detail: string;
  install?: Partial<Record<Os, string>>;
  link?: Partial<Record<Os, { href: string; label: string }>>;
};

// From the "Requirements" section of the app's README.
const requirements: Requirement[] = [
  {
    title: "Windows, macOS or Linux",
    detail: "Kliprix runs on your computer, not on a phone.",
  },
  {
    title: "Python 3.11 or 3.12",
    detail: "3.13 and newer are not supported yet by some dependencies.",
    install: {
      windows: "winget install Python.Python.3.12",
      macos: "brew install python@3.12",
      linux: "sudo apt install python3.12 python3.12-venv",
    },
  },
  {
    title: "Node.js 22 or newer",
    detail: "Also used to download videos from YouTube.",
    install: { windows: "winget install OpenJS.NodeJS.LTS", macos: "brew install node@22" },
    link: { linux: { href: "https://nodejs.org/", label: "Get the LTS from nodejs.org" } },
  },
  {
    title: "FFmpeg with libass",
    detail: "Any recent build. ffprobe comes with it.",
    install: {
      windows: "winget install Gyan.FFmpeg",
      macos: "brew install ffmpeg",
      linux: "sudo apt install ffmpeg",
    },
  },
  {
    title: "4 GB RAM and a few GB of disk",
    detail: "8 GB or more is recommended. Long streams take 1 to 3 GB each.",
  },
  {
    title: "NVIDIA GPU (optional)",
    detail: "Makes captions faster. Without one, Kliprix uses the CPU.",
  },
];

function RequirementList({ os }: { os: Os }) {
  return (
    <ul className="divide-y divide-line">
      {requirements.map((r) => {
        const cmd = r.install?.[os];
        const link = r.link?.[os];
        return (
          <li
            key={r.title}
            className="grid gap-3 py-4 first:pt-1 last:pb-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center md:gap-6"
          >
            <div className="flex gap-3">
              <CheckIcon className="mt-0.5 size-[18px] shrink-0 text-brand" aria-hidden="true" />
              <div>
                <p className="text-[15px] font-semibold">{r.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                  {r.detail}
                </p>
              </div>
            </div>
            {cmd && (
              <div className="pl-[30px] md:pl-0">
                <Command cmd={cmd} />
              </div>
            )}
            {link && (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="ml-[30px] inline-flex w-fit items-center gap-1 text-[13px] text-muted-foreground underline underline-offset-2 hover:text-foreground md:ml-0"
              >
                {link.label}
                <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The requirements checklist, with the install commands for the chosen OS. */
export function Requirements() {
  const detected = useDetectedOs();
  const [picked, setPicked] = useState<Os | null>(null);
  const os = picked ?? detected;
  return (
    <Tabs value={os} onValueChange={(v) => setPicked(v as Os)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="requirements"
            className="text-[clamp(26px,3.6vw,34px)] leading-tight font-semibold"
          >
            What you need
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Install these once. Copy the command for your system.
          </p>
        </div>
        <TabsList aria-label="Your operating system">
          {(Object.keys(osLabels) as Os[]).map((k) => (
            <TabsTrigger key={k} value={k}>
              {osLabels[k]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {(Object.keys(osLabels) as Os[]).map((k) => (
        <TabsContent
          key={k}
          value={k}
          className="mt-5 rounded-2xl border border-line bg-white/[0.02] px-4 py-3 sm:px-6"
        >
          <RequirementList os={k} />
        </TabsContent>
      ))}
      <p className="mt-4 text-[13px] text-muted-foreground">
        Not sure? After downloading, <code className="font-mono text-foreground">{doctorCmd}</code>{" "}
        checks all of it.
      </p>
    </Tabs>
  );
}

const help: { icon: LucideIcon; title: string; text: string; href: string; external: boolean }[] = [
  {
    icon: BookOpenIcon,
    title: "Troubleshooting",
    text: "FFmpeg not found, failed downloads, low memory and busy ports.",
    href: `${repoUrl}#troubleshooting`,
    external: true,
  },
  {
    icon: GitBranchIcon,
    title: "GitHub Issues",
    text: "Search known problems or report a new one.",
    href: `${repoUrl}/issues`,
    external: true,
  },
  {
    icon: MessageSquareIcon,
    title: "Send feedback",
    text: "A review, an idea or a bug, sent privately.",
    href: "/#feedback",
    external: false,
  },
];

export function Help() {
  return (
    <div>
      <h2 className="text-[clamp(26px,3.6vw,34px)] leading-tight font-semibold">Need help?</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {help.map((h) => (
          <li key={h.title}>
            <a
              href={h.href}
              {...(h.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group flex h-full flex-col rounded-2xl border border-line bg-white/[0.02] p-5 transition-colors outline-none hover:border-brand/60 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex items-center justify-between">
                <h.icon className="size-5 text-brand" aria-hidden="true" />
                <ArrowUpRightIcon
                  className="size-4 text-dim transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-4 text-[15px] font-semibold">{h.title}</span>
              <span className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {h.text}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
