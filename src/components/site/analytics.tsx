"use client";

import { useEffect } from "react";
import { track, trackVisitOnce } from "@/lib/track";
import type { TrackEvent } from "@/lib/analytics/core";

/**
 * Site-wide anonymous counting (no cookies): one "visit" per tab session, and a click on any
 * GitHub link. Release ZIP links are left out: /api/download counts downloads on the server.
 */
export function SiteAnalytics() {
  useEffect(() => {
    trackVisitOnce();
    function onClick(ev: MouseEvent) {
      const link = (ev.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (href.startsWith("https://github.com/") && !href.includes("/releases/latest/download/")) {
        track("github_click");
      }
    }
    // Capture, so it runs even if a component stops the click from bubbling.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

/** Counts `event` once when the page that renders it is shown. */
export function TrackView({ event }: { event: TrackEvent }) {
  useEffect(() => track(event), [event]);
  return null;
}
