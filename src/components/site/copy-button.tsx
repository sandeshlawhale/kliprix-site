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
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = copyWithSelection(text);
    }
    if (!ok) return; // the text stays visible and selectable
    setDone(true);
    setTimeout(() => setDone(false), 1500);
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
