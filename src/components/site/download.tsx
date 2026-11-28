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
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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

const released = new Date(`${site.releaseDate}T00:00:00Z`).toLocaleDateString("en-US", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** One command; its copy button shows on hover. Long commands wrap instead of scrolling. */
function Command({ cmd, trackEvent }: { cmd: string; trackEvent?: TrackEvent }) {
  return (
    <div className="copy-host flex items-center gap-2 rounded-lg border border-line bg-black/30 py-1 pr-1 pl-3">
      <code className="min-w-0 flex-1 py-1 font-mono text-[12.5px] leading-relaxed [overflow-wrap:anywhere] text-[#d8d8de] sm:text-[13px]">
        {cmd}
      </code>
      <CopyButton text={cmd} trackEvent={trackEvent} />
    </div>
  );
}

type Detail = { label: string; value: React.ReactNode };

/**
 * Details as a one-row table: labels on top, values below, one column each (two per row on
 * phones). `action` sits at the end of the row; `footer` spans the full width below it.
 */
function DetailsTable({
  items,
  action,
  footer,
}: {
  items: Detail[];
  action?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-line">
      <div className="grid gap-px md:flex">
        <dl className="grid flex-1 grid-cols-2 gap-px md:auto-cols-fr md:grid-flow-col md:grid-cols-none [&>div:last-child:nth-child(odd)]:col-span-2 md:[&>div:last-child:nth-child(odd)]:col-span-1">
          {items.map((i) => (
            <div key={i.label} className="flex flex-col bg-panel">
              <dt className="bg-white/[0.025] px-4 py-2 text-[11px] font-medium tracking-wider text-dim uppercase">
                {i.label}
              </dt>
              <dd className="flex-1 px-4 py-3 text-[14px] font-medium">{i.value}</dd>
            </div>
          ))}
        </dl>
        {action && (
          <div className="flex items-center justify-center bg-panel p-4 md:px-5">{action}</div>
        )}
      </div>
      {footer && <div className="mt-px bg-panel p-3 sm:p-4">{footer}</div>}
    </div>
  );
}

type StepItem = { title: string; body: React.ReactNode };

/** Numbered steps as a row of cards (stacked on phones). */
function Steps({ steps }: { steps: StepItem[] }) {
  return (
    <ol
      aria-label="Next steps"
      className={cn(
        "grid gap-3 md:grid-cols-2",
        steps.length === 4 ? "xl:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {steps.map((s, i) => (
        <li key={s.title} className="flex flex-col rounded-2xl border border-line bg-panel p-4">
          <span className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-brand/15 text-[12px] font-semibold text-brand tabular-nums"
            >
              {i + 1}
            </span>
            <span className="text-[15px] font-semibold">{s.title}</span>
          </span>
          <div className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
            {s.body}
          </div>
        </li>
      ))}
    </ol>
  );
}

function AppLink() {
  return (
    <a
      href={appUrl}
      target="_blank"
      rel="noreferrer"
      className="font-mono text-foreground underline underline-offset-2 hover:text-brand"
    >
      {appUrl}
    </a>
  );
}

/** Check, start and open: the steps once the code is on the PC. */
function startSteps(unzip: boolean): StepItem[] {
  const unzipStep: StepItem = {
    title: "Unzip",
    body: (
      <p>
        You get a <b className="font-semibold text-foreground">Kliprix</b> folder. Open a terminal
        in it (Windows: right-click the folder → Open in Terminal).
      </p>
    ),
  };
  return [
    ...(unzip ? [unzipStep] : []),
    {
      title: "Check your PC",
      body: (
        <>
          <Command cmd={doctorCmd} />
          <p>Lists anything missing, with a fix for each.</p>
        </>
      ),
    },
    {
      title: "Start",
      body: (
        <>
          {startCmds.map((c) => (
            <div key={c.cmd}>
              <span className="mb-1 block text-[11px] text-dim">{c.label}</span>
              <Command cmd={c.cmd} />
            </div>
          ))}
          <p>The first start installs the rest (several minutes, about 1.5 GB).</p>
        </>
      ),
    },
    {
      title: "Open",
      body: (
        <p>
          <AppLink /> in your browser. Ctrl+C in the terminal stops it.
        </p>
      ),
    },
  ];
}

function ZipPanel() {
  const [started, setStarted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  // Keyboard and screen reader users land on the new view instead of a removed button.
  useEffect(() => {
    if (started) heading.current?.focus();
  }, [started]);

  if (started) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-ok" aria-hidden="true" />
          <div>
            <h2
              ref={heading}
              tabIndex={-1}
              className="text-[20px] leading-tight font-semibold outline-none"
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
        <Steps steps={startSteps(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DetailsTable
        items={[
          { label: "Version", value: site.version },
          { label: "Released", value: <time dateTime={site.releaseDate}>{released}</time> },
          { label: "File", value: <span className="font-mono text-[13px]">Kliprix.zip</span> },
          { label: "Works on", value: "Windows, macOS, Linux" },
          { label: "License", value: "MIT, free" },
        ]}
        action={
          <a
            href="/api/download"
            onClick={() => setStarted(true)}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full gap-2 rounded-xl px-5 text-[15px] font-semibold glow-brand md:w-auto",
            )}
          >
            <DownloadIcon className="size-[18px]" />
            Download
          </a>
        }
      />
      <p className="text-[13px] text-muted-foreground">
        Needs Python, Node.js and FFmpeg.{" "}
        <a href="#requirements" className="underline underline-offset-2 hover:text-foreground">
          See what you need
        </a>
        .
      </p>
    </div>
  );
}

function GitPanel() {
  return (
    <div className="space-y-5">
      <DetailsTable
        items={[
          { label: "Source", value: "GitHub" },
          { label: "Branch", value: <span className="font-mono text-[13px]">main</span> },
          { label: "Needs", value: "Git" },
          { label: "Update", value: <span className="font-mono text-[13px]">git pull</span> },
        ]}
        footer={<Command cmd={cloneCmd} trackEvent="copy_clone" />}
      />
      <Steps steps={startSteps(false)} />
    </div>
  );
}

function DockerPanel() {
  return (
    <div className="space-y-3">
      <DetailsTable
        items={[
          { label: "Needs", value: "Git, Docker" },
          { label: "GPU", value: "CPU only" },
          { label: "Memory", value: "Docker Desktop needs ~2 GB RAM" },
          { label: "Opens at", value: <AppLink /> },
        ]}
        footer={<Command cmd={dockerCmd} trackEvent="copy_docker" />}
      />
      <p className="text-[13px] text-muted-foreground">
        Python, Node.js and FFmpeg come inside the containers. On a 4 GB PC, use the ZIP instead.
      </p>
    </div>
  );
}

/** ZIP (default), Git or Docker. */
export function InstallOptions() {
  return (
    <Tabs defaultValue="zip">
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
        </TabsTrigger>
      </TabsList>
      <TabsContent value="zip" className="mt-4 rounded-2xl">
        <ZipPanel />
      </TabsContent>
      <TabsContent value="git" className="mt-4 rounded-2xl">
        <GitPanel />
      </TabsContent>
      <TabsContent value="docker" className="mt-4 rounded-2xl">
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
            className="grid gap-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-8"
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
          <h2 id="requirements" className="text-[clamp(24px,3vw,30px)] leading-tight font-semibold">
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
          className="mt-5 overflow-hidden rounded-2xl border border-line bg-panel"
        >
          <RequirementList os={k} />
        </TabsContent>
      ))}
      <p className="mt-3 text-[13px] text-muted-foreground">
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
      <h2 className="text-[clamp(24px,3vw,30px)] leading-tight font-semibold">Need help?</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {help.map((h) => (
          <li key={h.title}>
            <a
              href={h.href}
              {...(h.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group flex h-full flex-col rounded-2xl border border-line bg-panel p-5 transition-colors outline-none hover:border-brand/60 focus-visible:ring-3 focus-visible:ring-ring/50"
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
