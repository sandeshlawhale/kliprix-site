import type { TrackEvent } from "@/lib/analytics/core";

/**
 * Counts one anonymous event: no cookies, no IDs, only the event name. Uses sendBeacon so it
 * survives a page change, with a keepalive fetch as the fallback. Never throws.
 */
export function track(event: TrackEvent) {
  try {
    const body = JSON.stringify({ event });
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Counting is best effort.
  }
}

/** Counts "visit" once per browser tab session. */
export function trackVisitOnce() {
  try {
    if (sessionStorage.getItem("kx:visit")) return;
    sessionStorage.setItem("kx:visit", "1");
  } catch {
    // Storage blocked (private mode, strict settings): count this page load anyway.
  }
  track("visit");
}
