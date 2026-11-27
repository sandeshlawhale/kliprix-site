/*
 * Anonymous click counting, shared by the route handlers, the /stats page and the tests.
 *
 * Plain Web APIs only (Request, Response, node:crypto) and no "@/" imports, so the tests can
 * load this file directly with `node --test`. Redis is passed in, so a test can hand over a
 * fake one that fails or hangs.
 *
 * Key scheme: count:<event>:total and count:<event>:<YYYY-MM-DD> (UTC). Rate limit keys are
 * rl:<sha256(ip + salt)> and expire after 60 s. No raw IPs, cookies or personal data are stored.
 */
import { createHash } from "node:crypto";

/** Events the browser may send to POST /api/track. */
export const TRACK_EVENTS = [
  "visit",
  "download_page_view",
  "download_click",
  "github_click",
  "copy_clone",
  "copy_docker",
] as const;
export type TrackEvent = (typeof TRACK_EVENTS)[number];

/** Counted by GET /api/download on the server, never sent by the browser. */
export const DOWNLOAD_EVENT = "download";
export type CountedEvent = TrackEvent | typeof DOWNLOAD_EVENT;
export const ALL_EVENTS: readonly CountedEvent[] = [DOWNLOAD_EVENT, ...TRACK_EVENTS];

export const RATE_LIMIT = 30;
export const RATE_WINDOW_SECONDS = 60;
/** Redis gets this long per request; after that the request goes on without it. */
export const REDIS_TIMEOUT_MS = 1000;

/** The small part of the Upstash client this file uses. */
export interface PipelineLike {
  incr(key: string): PipelineLike;
  expire(key: string, seconds: number, option?: "NX"): PipelineLike;
  exec(): Promise<unknown[]>;
}
export interface RedisLike {
  pipeline(): PipelineLike;
  mget(...keys: string[]): Promise<unknown[]>;
}

export function isTrackEvent(value: unknown): value is TrackEvent {
  return typeof value === "string" && (TRACK_EVENTS as readonly string[]).includes(value);
}

// Crawlers, link previews, uptime checks and command-line tools. A missing user agent counts
// as a bot too: every real browser sends one.
const BOT_PATTERN =
  /bot|crawl|spider|slurp|scrape|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|linkedin|headless|lighthouse|pagespeed|pingdom|uptime|monitor|curl|wget|python|httpie|axios|node-fetch|undici|go-http|java\/|okhttp|libwww|postman/i;

export function isBot(userAgent: string | null | undefined): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

/** UTC calendar day, e.g. "2026-11-27". */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function countKeys(event: CountedEvent, date: Date): [total: string, day: string] {
  return [`count:${event}:total`, `count:${event}:${dayKey(date)}`];
}

/** Resolves with the promise, or rejects once `ms` have passed. */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Adds one to the event's total and today's count, in one request. */
export async function countEvent(redis: RedisLike, event: CountedEvent, now = new Date()) {
  const [total, day] = countKeys(event, now);
  await redis.pipeline().incr(total).incr(day).exec();
}

/** SHA-256 of ip + salt, so the rate limit never stores a raw IP. */
export function hashClient(ip: string, salt: string): string {
  return createHash("sha256")
    .update(ip + salt)
    .digest("hex");
}

/** The client IP from the proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Fixed 60-second window per client. The first request in a window sets the expiry (NX), so
 * the window does not slide on every request. True while the client is under the limit.
 */
export async function underRateLimit(redis: RedisLike, clientHash: string): Promise<boolean> {
  const key = `rl:${clientHash}`;
  const [count] = await redis.pipeline().incr(key).expire(key, RATE_WINDOW_SECONDS, "NX").exec();
  return Number(count) <= RATE_LIMIT;
}

type Deps = { redis: RedisLike | null; timeoutMs?: number; now?: () => Date };

function warn(where: string, err: unknown) {
  console.warn(`[analytics] ${where}: ${err instanceof Error ? err.message : String(err)}`);
}

const noStore = { "Cache-Control": "no-store" };

/**
 * GET/HEAD /api/download: counts real browser downloads, then always redirects to the ZIP.
 * Counting waits at most `timeoutMs` and any Redis error is swallowed, so it never blocks
 * the download. HEAD requests and bots are not counted.
 */
export async function handleDownload(
  request: Request,
  deps: Deps & { downloadUrl: string },
): Promise<Response> {
  const { redis, downloadUrl, timeoutMs = REDIS_TIMEOUT_MS, now = () => new Date() } = deps;
  if (redis && request.method === "GET" && !isBot(request.headers.get("user-agent"))) {
    try {
      await withTimeout(countEvent(redis, DOWNLOAD_EVENT, now()), timeoutMs);
    } catch (err) {
      warn("download count failed", err);
    }
  }
  return new Response(null, { status: 302, headers: { Location: downloadUrl, ...noStore } });
}

const noContent = () => new Response(null, { status: 204, headers: noStore });
const badRequest = () =>
  new Response(JSON.stringify({ error: "unknown event" }), {
    status: 400,
    headers: { "Content-Type": "application/json", ...noStore },
  });

/**
 * POST /api/track { "event": "<allowlisted name>" }. 400 for anything outside the allowlist,
 * otherwise 204: bots, rate-limited clients and Redis failures are ignored quietly.
 */
export async function handleTrack(
  request: Request,
  deps: Deps & { salt: string },
): Promise<Response> {
  const { redis, salt, timeoutMs = REDIS_TIMEOUT_MS, now = () => new Date() } = deps;

  let event: unknown;
  try {
    const body: unknown = JSON.parse(await request.text());
    event = typeof body === "object" && body !== null ? (body as { event?: unknown }).event : null;
  } catch {
    return badRequest();
  }
  if (!isTrackEvent(event)) return badRequest();
  if (!redis || isBot(request.headers.get("user-agent"))) return noContent();

  try {
    const id = hashClient(clientIp(request.headers), salt);
    await withTimeout(
      (async () => {
        if (await underRateLimit(redis, id)) await countEvent(redis, event, now());
      })(),
      timeoutMs,
    );
  } catch (err) {
    warn("track failed", err);
  }
  return noContent();
}

/**
 * HTTP Basic Auth for /stats: any username, the password must equal `password`. With no
 * password configured nobody gets in. Returns a 401 Response when access is refused, or
 * null when the request may continue.
 */
export function requireBasicAuth(request: Request, password: string | undefined): Response | null {
  if (password && basicAuthPassword(request.headers.get("authorization")) === password) {
    return null;
  }
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Kliprix stats", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow",
      ...noStore,
    },
  });
}

function basicAuthPassword(header: string | null): string | null {
  const match = header?.match(/^Basic\s+(.+)$/i);
  if (!match) return null;
  try {
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(match[1].trim()), (c) => c.charCodeAt(0)),
    );
    const colon = decoded.indexOf(":");
    return colon === -1 ? null : decoded.slice(colon + 1);
  } catch {
    return null;
  }
}

export type Counts = Record<CountedEvent, number>;
export type Stats = {
  totals: Counts;
  /** Oldest first. */
  days: { date: string; counts: Counts }[];
};

/** UTC days ending today, oldest first. */
export function lastDays(count: number, now = new Date()): string[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Array.from({ length: count }, (_, i) =>
    dayKey(new Date(today - (count - 1 - i) * 86_400_000)),
  );
}

/** Totals and per-day counts for every event, in one MGET. */
export async function readStats(redis: RedisLike, dayCount = 30, now = new Date()): Promise<Stats> {
  const dates = lastDays(dayCount, now);
  const keys = ALL_EVENTS.flatMap((e) => [
    `count:${e}:total`,
    ...dates.map((d) => `count:${e}:${d}`),
  ]);
  const values = (await redis.mget(...keys)).map((v) => Number(v) || 0);

  const per = dates.length + 1;
  const totals = {} as Counts;
  const days: Stats["days"] = dates.map((date) => ({ date, counts: {} as Counts }));
  ALL_EVENTS.forEach((e, i) => {
    totals[e] = values[i * per];
    dates.forEach((_, d) => (days[d].counts[e] = values[i * per + 1 + d]));
  });
  return { totals, days };
}
