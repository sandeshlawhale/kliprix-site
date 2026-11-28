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
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { ResetCounters } from "@/components/site/reset-counters";

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

/** Short names for the per-day table headers. */
const shortLabels: Record<CountedEvent, string> = {
  visit: "Visits",
  download_page_view: "DL page",
  download: "Downloads",
  download_click: "DL clicks",
  github_click: "GitHub",
  copy_clone: "Clone",
  copy_docker: "Docker",
};

/** How many recent days the per-day table lists (the chart shows 30). */
const TABLE_DAYS = 10;

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

/** One bento cell. */
function Cell({
  title,
  className,
  children,
}: {
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl border border-line bg-linear-to-b from-white/[0.035] to-white/[0.01] p-5",
        className,
      )}
    >
      {title && (
        <h2 className="mb-4 text-[13px] font-medium tracking-wide text-muted-foreground">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function Unavailable({ what }: { what: string }) {
  return (
    <p className="grid flex-1 place-items-center rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-sm text-muted-foreground">
      {what} data unavailable.
    </p>
  );
}

/** A headline number with a small 30-day trend line under it. */
function Kpi({
  label,
  value,
  sub,
  trend,
  accent,
}: {
  label: string;
  value: number | null;
  sub?: string;
  trend?: number[];
  accent?: string;
}) {
  return (
    <Cell className="col-span-1 justify-between lg:col-span-3">
      <div>
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <p className="mt-2 text-[clamp(28px,3.2vw,38px)] leading-none font-semibold tracking-tight tabular-nums">
          {value === null ? "–" : fmt(value)}
        </p>
        {sub && <p className="mt-2 text-xs text-dim">{sub}</p>}
      </div>
      {trend && <Sparkline values={trend} color={accent ?? "var(--brand)"} />}
    </Cell>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 200;
  const h = 36;
  const max = Math.max(1, ...values);
  const pts = values
    .map((v, i) => `${(i / Math.max(1, values.length - 1)) * w},${h - 2 - (v / max) * (h - 4)}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="mt-4 h-9 w-full"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        points={pts}
      />
    </svg>
  );
}

function Funnel({ stats, github }: { stats: Stats | null; github: RepoStats | null }) {
  const steps: { label: string; value: number | null }[] = [
    { label: "Visits", value: stats?.totals.visit ?? null },
    { label: "Download page views", value: stats?.totals.download_page_view ?? null },
    { label: "Downloads (/api/download)", value: stats?.totals.download ?? null },
    { label: "GitHub release downloads", value: github?.zipDownloadsTotal ?? null },
  ];
  const max = Math.max(1, ...steps.map((s) => s.value ?? 0));
  return (
    <ol className="flex flex-1 flex-col justify-between gap-4">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        return (
          <li key={s.label}>
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="whitespace-nowrap tabular-nums">
                <b className="font-semibold">{s.value === null ? "n/a" : fmt(s.value)}</b>
                {i > 0 && s.value !== null && prev !== null && (
                  <span className="ml-1.5 text-xs text-dim">{pct(s.value, prev)}</span>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-linear-to-r from-brand to-brand-2"
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
  const h = 200;
  const pad = 6;
  const max = Math.max(1, ...days.flatMap((d) => series.map((s) => d.counts[s.event])));
  const x = (i: number) => pad + (i / Math.max(1, days.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);
  return (
    <figure className="flex flex-1 flex-col">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="h-[200px] w-full flex-1 lg:h-auto lg:min-h-[200px]"
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
            vectorEffect="non-scaling-stroke"
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
          {days[0]?.date} to {days.at(-1)?.date} · top line = {fmt(max)}
        </span>
      </figcaption>
    </figure>
  );
}

function PerDayTable({ days }: { days: Stats["days"] }) {
  const recent = days.slice(-TABLE_DAYS).reverse();
  return (
    <div className="-mx-1 overflow-x-auto px-1" tabIndex={0} aria-label="Counts per day">
      <table className="w-full min-w-[560px] border-collapse text-right text-[13px] tabular-nums">
        <thead>
          <tr className="border-b border-line text-xs text-dim">
            <th className="py-2 pr-3 text-left font-medium">Date</th>
            {ALL_EVENTS.map((e) => (
              <th key={e} className="px-1.5 py-2 font-medium whitespace-nowrap">
                {shortLabels[e]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recent.map((d) => (
            <tr key={d.date} className="border-b border-line last:border-b-0">
              <td className="py-2 pr-3 text-left font-mono whitespace-nowrap text-muted-foreground">
                {d.date.slice(5)}
              </td>
              {ALL_EVENTS.map((e) => (
                <td key={e} className={cn("px-1.5 py-2", !d.counts[e] && "text-dim")}>
                  {fmt(d.counts[e])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Smaller counts that are not part of the funnel. */
const minor: { event: CountedEvent; label: string }[] = [
  { event: "github_click", label: "GitHub link clicks" },
  { event: "copy_clone", label: "Clone command copied" },
  { event: "copy_docker", label: "Docker command copied" },
  { event: "download_click", label: "Download clicks (client)" },
];

export default async function StatsPage() {
  const [stats, github] = await Promise.all([loadCounts(), getRepoStats(site.repo)]);
  const today = stats?.days.at(-1)?.counts;
  const trend = (e: CountedEvent) => stats?.days.map((d) => d.counts[e]);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[32px] leading-tight font-bold">Kliprix stats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Anonymous counts from this site. Days are UTC. GitHub numbers refresh hourly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!stats && (
            <p className="rounded-full border border-line-strong px-3 py-1 text-xs text-muted-foreground">
              Redis data unavailable
            </p>
          )}
          <ResetCounters />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">
        <Kpi
          label="Visits"
          value={stats?.totals.visit ?? null}
          sub={today ? `${fmt(today.visit)} today` : undefined}
          trend={trend("visit")}
          accent="var(--violet)"
        />
        <Kpi
          label="Download page views"
          value={stats?.totals.download_page_view ?? null}
          sub={today ? `${fmt(today.download_page_view)} today` : undefined}
          trend={trend("download_page_view")}
          accent="var(--brand-2)"
        />
        <Kpi
          label="Downloads"
          value={stats?.totals.download ?? null}
          sub={today ? `${fmt(today.download)} today` : undefined}
          trend={trend("download")}
        />
        <Kpi
          label="GitHub stars"
          value={github?.stars ?? null}
          sub={
            github
              ? `${fmt(github.zipDownloadsTotal)} release download${github.zipDownloadsTotal === 1 ? "" : "s"}`
              : "GitHub data unavailable"
          }
        />

        <Cell title="Last 30 days" className="col-span-2 lg:col-span-8">
          {stats ? <DailyChart days={stats.days} /> : <Unavailable what="Redis" />}
        </Cell>

        <Cell title="Funnel" className="col-span-2 lg:col-span-4">
          <Funnel stats={stats} github={github} />
        </Cell>

        <Cell title={`Last ${TABLE_DAYS} days`} className="col-span-2 lg:col-span-12 xl:col-span-7">
          {stats ? <PerDayTable days={stats.days} /> : <Unavailable what="Redis" />}
        </Cell>

        <div className="col-span-2 grid gap-3 sm:gap-4 lg:col-span-12 lg:grid-cols-2 xl:col-span-5 xl:grid-cols-1">
          <Cell title="Other clicks">
            {stats ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                {minor.map((m) => (
                  <div key={m.event}>
                    <dt className="text-xs text-dim">{m.label}</dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums">
                      {fmt(stats.totals[m.event])}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <Unavailable what="Redis" />
            )}
          </Cell>

          <Cell title="Releases (Kliprix.zip downloads)">
            {github ? (
              <table className="w-full border-collapse text-[13px] tabular-nums">
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
                    <td className="pt-2 text-right font-semibold">
                      {fmt(github.zipDownloadsTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <Unavailable what="GitHub" />
            )}
          </Cell>
        </div>
      </div>
    </main>
  );
}
