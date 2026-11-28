"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import type { TrackEvent } from "@/lib/analytics/core";

export function CopyButton({
  text,
  label = "Copy",
  className,
  trackEvent,
}: {
  text: string;
  label?: string;
  className?: string;
  /** Counted (anonymously) after a successful copy. */
  trackEvent?: TrackEvent;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = copyWithSelection(text);
    }
    if (!ok) return; // the text stays visible and selectable
    if (trackEvent) track(trackEvent);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  // Icon only. Inside a "copy-host" element it shows on hover or keyboard focus (on devices
  // with a mouse; touch screens always show it), see globals.css.
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? "Copied" : `${label}: ${text}`}
      title={done ? "Copied" : label}
      data-done={done || undefined}
      className={cn(
        "copy-reveal grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      {done ? <CheckIcon className="size-3.5 text-ok" /> : <CopyIcon className="size-3.5" />}
    </button>
  );
}

/** Fallback for browsers or frames where the Clipboard API is blocked. */
function copyWithSelection(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}
