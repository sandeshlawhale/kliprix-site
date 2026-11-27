// Run with `npm test` (node --test; Node 22.18+ runs TypeScript directly).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RATE_LIMIT,
  TRACK_EVENTS,
  handleDownload,
  handleTrack,
  isBot,
  isTrackEvent,
  readStats,
  type PipelineLike,
  type RedisLike,
} from "../src/lib/analytics/core.ts";
import { proxy, config as proxyConfig } from "../src/proxy.ts";

const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36";
const ZIP = "https://github.com/sandeshlawhale/Kliprix/releases/latest/download/Kliprix.zip";
const NOW = () => new Date("2026-11-27T10:00:00Z");

/** In-memory Redis with INCR, EXPIRE NX and MGET; counts the round trips. */
function memoryRedis() {
  const data = new Map<string, number>();
  const ttl = new Map<string, number>();
  let requests = 0;
  const redis: RedisLike = {
    pipeline() {
      const ops: (() => unknown)[] = [];
      const p: PipelineLike = {
        incr(key) {
          ops.push(() => {
            data.set(key, (data.get(key) ?? 0) + 1);
            return data.get(key);
          });
          return p;
        },
        expire(key, seconds, option) {
          ops.push(() => {
            if (option === "NX" && ttl.has(key)) return 0;
            ttl.set(key, seconds);
            return 1;
          });
          return p;
        },
        async exec() {
          requests++;
          return ops.map((op) => op());
        },
      };
      return p;
    },
    async mget(...keys) {
      requests++;
      return keys.map((k) => data.get(k) ?? null);
    },
  };
  return { redis, data, ttl, requests: () => requests };
}

/** Redis whose every request fails, or never answers. */
function brokenRedis(mode: "error" | "hang"): RedisLike {
  const run = () =>
    mode === "error" ? Promise.reject(new Error("ECONNREFUSED")) : new Promise<never>(() => {});
  const p: PipelineLike = { incr: () => p, expire: () => p, exec: run };
  return { pipeline: () => p, mget: run };
}

function trackRequest(body: unknown, { ip = "203.0.113.7", ua = BROWSER } = {}) {
  return new Request("https://kliprix.test/api/track", {
    method: "POST",
    headers: { "user-agent": ua, "x-forwarded-for": `${ip}, 10.0.0.1` },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

// --- event allowlist --------------------------------------------------------------------

test("allowlist accepts exactly the six track events", () => {
  assert.deepEqual([...TRACK_EVENTS].sort(), [
    "copy_clone",
    "copy_docker",
    "download_click",
    "download_page_view",
    "github_click",
    "visit",
  ]);
  for (const e of TRACK_EVENTS) assert.equal(isTrackEvent(e), true);
  for (const e of ["download", "Visit", "visit ", "", "__proto__", 1, null, undefined, {}]) {
    assert.equal(isTrackEvent(e), false, `should reject ${JSON.stringify(e)}`);
  }
});

test("POST /api/track: allowlisted event -> 204 and counted (total + UTC day)", async () => {
  const m = memoryRedis();
  const res = await handleTrack(trackRequest({ event: "visit" }), {
    redis: m.redis,
    salt: "s",
    now: NOW,
  });
  assert.equal(res.status, 204);
  assert.equal(m.data.get("count:visit:total"), 1);
  assert.equal(m.data.get("count:visit:2026-11-27"), 1);
});

test("POST /api/track: unknown or malformed event -> 400, nothing counted", async () => {
  for (const body of [{ event: "download" }, { event: "drop_table" }, {}, "not json", "null"]) {
    const m = memoryRedis();
    const res = await handleTrack(trackRequest(body), { redis: m.redis, salt: "s" });
    assert.equal(res.status, 400, `body ${JSON.stringify(body)}`);
    assert.equal(m.requests(), 0);
  }
});

test("POST /api/track: bots get 204 but are not counted", async () => {
  for (const ua of ["Googlebot/2.1", "curl/8.4.0", "facebookexternalhit/1.1", ""]) {
    const m = memoryRedis();
    const res = await handleTrack(trackRequest({ event: "visit" }, { ua }), {
      redis: m.redis,
      salt: "s",
    });
    assert.equal(res.status, 204);
    assert.equal(m.requests(), 0, `ua ${ua}`);
  }
  assert.equal(isBot(BROWSER), false);
});

test("POST /api/track: Redis down or slow -> still 204, never throws", async () => {
  for (const mode of ["error", "hang"] as const) {
    const res = await handleTrack(trackRequest({ event: "visit" }), {
      redis: brokenRedis(mode),
      salt: "s",
      timeoutMs: 50,
    });
    assert.equal(res.status, 204);
  }
});

// --- rate limit -------------------------------------------------------------------------

test("rate limit: 30 per minute per client, then ignored; other clients unaffected", async () => {
  const m = memoryRedis();
  const send = (ip: string) =>
    handleTrack(trackRequest({ event: "github_click" }, { ip }), {
      redis: m.redis,
      salt: "pepper",
    });

  for (let i = 0; i < RATE_LIMIT + 10; i++) assert.equal((await send("198.51.100.1")).status, 204);
  assert.equal(m.data.get("count:github_click:total"), RATE_LIMIT);

  await send("198.51.100.2");
  assert.equal(m.data.get("count:github_click:total"), RATE_LIMIT + 1);
});

test("rate limit: keys are salted SHA-256 hashes with a 60 s TTL, never raw IPs", async () => {
  const m = memoryRedis();
  await handleTrack(trackRequest({ event: "visit" }, { ip: "198.51.100.9" }), {
    redis: m.redis,
    salt: "pepper",
  });
  const rlKeys = [...m.data.keys()].filter((k) => k.startsWith("rl:"));
  assert.equal(rlKeys.length, 1);
  assert.match(rlKeys[0], /^rl:[0-9a-f]{64}$/);
  assert.equal(m.ttl.get(rlKeys[0]), 60);
  for (const k of m.data.keys()) assert.equal(k.includes("198.51.100.9"), false);
});

// --- /api/download ----------------------------------------------------------------------

const downloadRequest = (method = "GET", ua = BROWSER) =>
  new Request("https://kliprix.test/api/download", { method, headers: { "user-agent": ua } });

test("GET /api/download: counts and 302-redirects to the release ZIP", async () => {
  const m = memoryRedis();
  const res = await handleDownload(downloadRequest(), {
    redis: m.redis,
    downloadUrl: ZIP,
    now: NOW,
  });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), ZIP);
  assert.equal(m.data.get("count:download:total"), 1);
  assert.equal(m.data.get("count:download:2026-11-27"), 1);
  assert.equal(m.requests(), 1, "one pipelined request per event");
});

test("GET /api/download: still redirects when Redis errors", async () => {
  const res = await handleDownload(downloadRequest(), {
    redis: brokenRedis("error"),
    downloadUrl: ZIP,
  });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), ZIP);
});

test("GET /api/download: still redirects, within the timeout, when Redis hangs", async () => {
  const started = Date.now();
  const res = await handleDownload(downloadRequest(), {
    redis: brokenRedis("hang"),
    downloadUrl: ZIP,
    timeoutMs: 100,
  });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), ZIP);
  assert.ok(Date.now() - started < 1000, "did not wait on Redis");
});

test("GET /api/download: redirects without Redis configured", async () => {
  const res = await handleDownload(downloadRequest(), { redis: null, downloadUrl: ZIP });
  assert.equal(res.status, 302);
});

test("HEAD and bot requests to /api/download redirect but are not counted", async () => {
  for (const req of [downloadRequest("HEAD"), downloadRequest("GET", "Wget/1.21")]) {
    const m = memoryRedis();
    const res = await handleDownload(req, { redis: m.redis, downloadUrl: ZIP });
    assert.equal(res.status, 302);
    assert.equal(m.requests(), 0);
  }
});

// --- /stats -----------------------------------------------------------------------------

const statsRequest = (auth?: string) =>
  new Request("https://kliprix.test/stats", auth ? { headers: { authorization: auth } } : {});
const basic = (user: string, pass: string) => `Basic ${btoa(`${user}:${pass}`)}`;

test("/stats: 401 without the password, with a wrong one, or with none configured", () => {
  const saved = process.env.STATS_PASSWORD;
  try {
    process.env.STATS_PASSWORD = "correct horse";
    for (const auth of [undefined, basic("admin", "wrong"), "Bearer correct horse", "Basic %%%"]) {
      const res = proxy(statsRequest(auth));
      assert.ok(res, `auth ${auth}`);
      assert.equal(res.status, 401);
      assert.match(res.headers.get("www-authenticate") ?? "", /^Basic /);
    }
    delete process.env.STATS_PASSWORD;
    assert.equal(proxy(statsRequest(basic("x", "")))?.status, 401);
  } finally {
    if (saved === undefined) delete process.env.STATS_PASSWORD;
    else process.env.STATS_PASSWORD = saved;
  }
});

test("/stats: any username with the right password passes", () => {
  const saved = process.env.STATS_PASSWORD;
  try {
    process.env.STATS_PASSWORD = "correct horse";
    assert.equal(proxy(statsRequest(basic("anyone", "correct horse"))), undefined);
    assert.equal(proxy(statsRequest(basic("", "correct horse"))), undefined);
  } finally {
    if (saved === undefined) delete process.env.STATS_PASSWORD;
    else process.env.STATS_PASSWORD = saved;
  }
  assert.deepEqual(proxyConfig.matcher, ["/stats", "/stats/:path*"]);
});

test("readStats: totals and the last 30 UTC days in one request", async () => {
  const m = memoryRedis();
  m.data.set("count:visit:total", 12);
  m.data.set("count:visit:2026-11-27", 5);
  m.data.set("count:download:2026-10-29", 2);
  m.data.set("count:download:2026-10-28", 9); // 31 days back: outside the window
  const stats = await readStats(m.redis, 30, NOW());
  assert.equal(m.requests(), 1);
  assert.equal(stats.days.length, 30);
  assert.equal(stats.days[0].date, "2026-10-29");
  assert.equal(stats.days[29].date, "2026-11-27");
  assert.equal(stats.totals.visit, 12);
  assert.equal(stats.totals.copy_docker, 0);
  assert.equal(stats.days[29].counts.visit, 5);
  assert.equal(stats.days[0].counts.download, 2);
});
