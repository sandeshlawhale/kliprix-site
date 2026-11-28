/*
 * Server-only. Releases and stars from the GitHub REST API, cached for one hour, for the
 * /download table and /stats. GITHUB_TOKEN (optional, no scopes needed) raises the rate limit
 * from 60 to 5000 requests an hour; it is never sent to the browser.
 */

export const ZIP_NAME = "Kliprix.zip";

/** One published release that has a Kliprix.zip, newest first. */
export type Release = {
  /** e.g. "0.1.0" (the tag without its leading "v"). */
  version: string;
  tag: string;
  publishedAt: string | null;
  notesUrl: string;
  zipUrl: string;
  zipSize: number;
  zipDownloads: number;
};
export type RepoStats = { stars: number; releases: Release[]; zipDownloadsTotal: number };

type ApiRelease = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  html_url: string;
  assets: { name: string; size: number; download_count: number; browser_download_url: string }[];
};

async function gh<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "kliprix-site",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, {
    headers,
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`GitHub ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

function warn(err: unknown) {
  console.warn(`[github] ${err instanceof Error ? err.message : String(err)}`);
}

/** Published (not draft, not pre-release) releases with a Kliprix.zip, newest first. */
export async function getReleases(repo: string): Promise<Release[] | null> {
  try {
    const list = await gh<ApiRelease[]>(`/repos/${repo}/releases?per_page=100`);
    return list.flatMap((r) => {
      const zip = r.assets.find((a) => a.name === ZIP_NAME);
      if (r.draft || r.prerelease || !zip) return [];
      return [
        {
          version: r.tag_name.replace(/^v/, ""),
          tag: r.tag_name,
          publishedAt: r.published_at,
          notesUrl: r.html_url,
          zipUrl: zip.browser_download_url,
          zipSize: zip.size,
          zipDownloads: zip.download_count,
        },
      ];
    });
  } catch (err) {
    warn(err);
    return null;
  }
}

/** Stars and Kliprix.zip downloads per release, or null when GitHub can't be reached. */
export async function getRepoStats(repo: string): Promise<RepoStats | null> {
  try {
    const [info, releases] = await Promise.all([
      gh<{ stargazers_count: number }>(`/repos/${repo}`),
      getReleases(repo),
    ]);
    if (!releases) return null;
    return {
      stars: info.stargazers_count,
      releases,
      zipDownloadsTotal: releases.reduce((sum, r) => sum + r.zipDownloads, 0),
    };
  } catch (err) {
    warn(err);
    return null;
  }
}
