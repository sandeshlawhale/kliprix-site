"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** Live star count from the public GitHub API. Shows nothing extra if the request fails. */
export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`https://api.github.com/repos/${site.repo}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { stargazers_count?: number } | null) => {
        if (d && typeof d.stargazers_count === "number") setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  if (stars === null) return null;
  return (
    <span className="rounded-md bg-white/6 px-1.5 py-0.5 font-mono text-[11px] text-foreground tabular-nums">
      {stars.toLocaleString("en")}
    </span>
  );
}
