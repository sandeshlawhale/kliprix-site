"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions); the text stays selectable.
      setDone(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? "Copied" : `${label}: ${text}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-line-strong px-1.5 py-0.5 text-[10.5px] text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
        className,
      )}
    >
      {done ? <CheckIcon className="size-3 text-ok" /> : <CopyIcon className="size-3" />}
      {done ? "Copied" : label}
    </button>
  );
}
