/*
 * Server-only. Release download counts and stars for /stats, from the GitHub REST API,
 * cached for one hour. GITHUB_TOKEN (optional, no scopes needed) raises the rate limit from
 * 60 to 5000 requests an hour; it is never sent to the browser.
 */

export type ReleaseStat = { tag: string; publishedAt: string | null; zipDownloads: number };
export type RepoStats = { stars: number; releases: ReleaseStat[]; zipDownloadsTotal: number };

const ZIP_NAME = "Kliprix.zip";

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

/** Stars and Kliprix.zip downloads per release, or null when GitHub can't be reached. */
export async function getRepoStats(repo: string): Promise<RepoStats | null> {
  try {
    const [info, releases] = await Promise.all([
      gh<{ stargazers_count: number }>(`/repos/${repo}`),
      gh<
        {
          tag_name: string;
          published_at: string | null;
          assets: { name: string; download_count: number }[];
        }[]
      >(`/repos/${repo}/releases?per_page=100`),
    ]);
    const rows = releases.map((r) => ({
      tag: r.tag_name,
      publishedAt: r.published_at,
      zipDownloads: r.assets.find((a) => a.name === ZIP_NAME)?.download_count ?? 0,
    }));
    return {
      stars: info.stargazers_count,
      releases: rows,
      zipDownloadsTotal: rows.reduce((sum, r) => sum + r.zipDownloads, 0),
    };
  } catch (err) {
    console.warn(`[stats] ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
