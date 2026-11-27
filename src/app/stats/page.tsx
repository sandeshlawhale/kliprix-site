import type { Metadata } from "next";
import {
  ALL_EVENTS,
  readStats,
  withTimeout,
  type CountedEvent,
  type Stats,
} from "@/lib/analytics/core";
import { getRedis } from "@/lib/analytics/redis";
import { getRepoStats, type RepoStats } from "@/lib/github";
import { site } from "@/lib/site";

/*
 * Private stats. src/proxy.ts asks for STATS_PASSWORD (HTTP Basic Auth) before this renders.
 * Not linked anywhere, not in the sitemap, noindex. Rendered on every request; only the
 * GitHub numbers are cached (1 hour, src/lib/github.ts).
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kliprix stats",
  robots: { index: false, follow: false, nocache: true },
};

const labels: Record<CountedEvent, string> = {
  visit: "Visits",
  download_page_view: "Download page views",
  download: "Downloads (ZIP button)",
  download_click: "Download clicks (client)",
  github_click: "GitHub link clicks",
  copy_clone: "Clone command copied",
  copy_docker: "Docker command copied",
};

async function loadCounts(): Promise<Stats | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await withTimeout(readStats(redis, 30), 3000);
  } catch (err) {
    console.warn(`[stats] Redis: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white/[0.02] p-5 sm:p-6">
      <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Unavailable({ what }: { what: string }) {
  return (
    <p className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
      {what} data unavailable.
    </p>
  );
}

function Funnel({ stats, github }: { stats: Stats | null; github: RepoStats | null }) {
  const steps: { label: string; value: number | null }[] = [
    { label: "Visits", value: stats?.totals.visit ?? null },
    { label: "Download page views", value: stats?.totals.download_page_view ?? null },
    { label: "Downloads (via /api/download)", value: stats?.totals.download ?? null },
    { label: "GitHub release downloads (Kliprix.zip)", value: github?.zipDownloadsTotal ?? null },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value ?? 0));
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        return (
          <li key={s.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="tabular-nums">
                <b className="font-semibold">{s.value === null ? "n/a" : fmt(s.value)}</b>
                {i > 0 && s.value !== null && prev !== null && (
                  <span className="ml-2 text-xs text-dim">{pct(s.value, prev)} of previous</span>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${((s.value ?? 0) / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const series: { event: CountedEvent; color: string; label: string }[] = [
  { event: "visit", color: "var(--violet)", label: "Visits" },
  { event: "download_page_view", color: "var(--brand-2)", label: "Download page views" },
  { event: "download", color: "var(--brand)", label: "Downloads" },
];

/** A plain SVG line chart of the last 30 days. */
function DailyChart({ days }: { days: Stats["days"] }) {
  const w = 600;
  const h = 180;
  const pad = 6;
  const max = Math.max(1, ...days.flatMap((d) => series.map((s) => d.counts[s.event])));
  const x = (i: number) => pad + (i / Math.max(1, days.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  return (
    <figure>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Visits, download page views and downloads per day for the last ${days.length} days. Highest day: ${max}.`}
      >
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={pad}
            x2={w - pad}
            y1={y(max * t)}
            y2={y(max * t)}
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}
        {series.map((s) => (
          <polyline
            key={s.event}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            points={days.map((d, i) => `${x(i)},${y(d.counts[s.event])}`).join(" ")}
          />
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        {series.map((s) => (
          <span key={s.event} className="flex items-center gap-1.5">
            <i className="h-0.5 w-4 rounded" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto text-dim">
          {days[0]?.date} to {days.at(-1)?.date} (UTC) · top line = {fmt(max)}
        </span>
      </figcaption>
    </figure>
  );
}

export default async function StatsPage() {
  const [stats, github] = await Promise.all([loadCounts(), getRepoStats(site.repo)]);

  return (
    <main className="mx-auto max-w-[1100px] space-y-5 px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] leading-tight font-bold">Kliprix stats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Anonymous counts from this site. Days are UTC. GitHub numbers refresh hourly.
          </p>
        </div>
        {github && (
          <p className="text-sm text-muted-foreground">
            <b className="text-foreground tabular-nums">{fmt(github.stars)}</b> GitHub stars
          </p>
        )}
      </header>

      <Card title="Totals">
        {stats ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ALL_EVENTS.map((e) => (
              <div key={e} className="rounded-xl border border-line px-4 py-3">
                <dt className="text-xs text-muted-foreground">{labels[e]}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">{fmt(stats.totals[e])}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Unavailable what="Redis" />
        )}
      </Card>

      <Card title="Funnel">
        <Funnel stats={stats} github={github} />
      </Card>

      <Card title="Last 30 days">
        {stats ? <DailyChart days={stats.days} /> : <Unavailable what="Redis" />}
      </Card>

      {stats && (
        <Card title="Per day">
          <div className="overflow-x-auto" tabIndex={0} aria-label="Counts per day">
            <table className="w-full min-w-[720px] border-collapse text-right text-[13px] tabular-nums">
              <thead>
                <tr className="border-b border-line text-xs text-muted-foreground">
                  <th className="py-2 pr-3 text-left font-medium">Date</th>
                  {ALL_EVENTS.map((e) => (
                    <th key={e} className="px-2 py-2 font-medium">
                      {labels[e]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...stats.days].reverse().map((d) => (
                  <tr key={d.date} className="border-b border-line">
                    <td className="py-1.5 pr-3 text-left font-mono whitespace-nowrap text-muted-foreground">
                      {d.date}
                    </td>
                    {ALL_EVENTS.map((e) => (
                      <td key={e} className={d.counts[e] ? "px-2 py-1.5" : "px-2 py-1.5 text-dim"}>
                        {fmt(d.counts[e])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card title="GitHub releases (Kliprix.zip downloads)">
        {github ? (
          <table className="w-full border-collapse text-[14px] tabular-nums">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted-foreground">
                <th className="py-2 font-medium">Release</th>
                <th className="py-2 font-medium">Published</th>
                <th className="py-2 text-right font-medium">Downloads</th>
              </tr>
            </thead>
            <tbody>
              {github.releases.map((r) => (
                <tr key={r.tag} className="border-b border-line">
                  <td className="py-2 font-mono">{r.tag}</td>
                  <td className="py-2 text-muted-foreground">
                    {r.publishedAt?.slice(0, 10) ?? "draft"}
                  </td>
                  <td className="py-2 text-right">{fmt(r.zipDownloads)}</td>
                </tr>
              ))}
              <tr>
                <td className="pt-2 font-semibold" colSpan={2}>
                  Total
                </td>
                <td className="pt-2 text-right font-semibold">{fmt(github.zipDownloadsTotal)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <Unavailable what="GitHub" />
        )}
      </Card>
    </main>
  );
}
