"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { repoUrl } from "@/lib/site";
import { CopyButton } from "./copy-button";

// scripts/start.sh is not marked executable in git, so it is run with `sh`, which works on
// a fresh clone on both macOS and Linux.
const clone = `git clone ${repoUrl}.git && cd Kliprix`;
const commands = {
  windows: { label: "Windows", cmd: `${clone} && scripts\\start.bat` },
  macos: { label: "macOS", cmd: `${clone} && sh scripts/start.sh` },
  linux: { label: "Linux", cmd: `${clone} && sh scripts/start.sh` },
} as const;
type Os = keyof typeof commands;

/**
 * The one install command, with a dropdown to switch the operating system; Copy copies the
 * shown one. Below 768 px the dropdown and Copy share the top row and the command gets the
 * full width underneath.
 */
export function InstallCommand() {
  const [os, setOs] = useState<Os>("windows");
  const cmd = commands[os].cmd;
  return (
    <div className="copy-host flex w-full flex-wrap items-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] p-2 text-left md:flex-nowrap md:gap-3 md:pr-2.5">
      <Select value={os} onValueChange={(v) => setOs(v as Os)}>
        <SelectTrigger
          size="sm"
          aria-label="Operating system"
          className="shrink-0 border-line-strong bg-transparent text-xs text-muted-foreground hover:text-foreground dark:bg-transparent"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(commands) as Os[]).map((k) => (
            <SelectItem key={k} value={k} className="text-xs">
              {commands[k].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <code className="order-last w-full rounded-lg bg-black/30 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed break-all text-[#d8d8de] md:order-none md:w-auto md:min-w-0 md:flex-1 md:bg-transparent md:px-0 md:py-0 md:text-[13px] md:break-normal md:whitespace-nowrap">
        {cmd}
      </code>
      <CopyButton text={cmd} trackEvent="copy_clone" className="ml-auto md:ml-0" />
    </div>
  );
}
