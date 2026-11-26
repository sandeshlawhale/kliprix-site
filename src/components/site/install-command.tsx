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

/** The one install command, with a dropdown to switch the operating system; Copy copies the shown one. */
export function InstallCommand() {
  const [os, setOs] = useState<Os>("windows");
  const cmd = commands[os].cmd;
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-line-strong bg-white/[0.03] py-2 pr-2.5 pl-2 text-left sm:gap-3">
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
      <code className="min-w-0 flex-1 font-mono text-[12.5px] break-all text-[#d8d8de] sm:text-[13px] md:break-normal md:whitespace-nowrap">
        {cmd}
      </code>
      <CopyButton text={cmd} className="shrink-0 px-2 py-1 text-xs" />
    </div>
  );
}
