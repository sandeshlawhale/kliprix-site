import { Redis } from "@upstash/redis";
import type { RedisLike } from "./core";

/*
 * Server-only. The Upstash for Redis integration on Vercel sets KV_REST_API_URL and
 * KV_REST_API_TOKEN (a plain Upstash database uses UPSTASH_REDIS_REST_URL / _TOKEN);
 * Redis.fromEnv() reads either pair. None of these are NEXT_PUBLIC_, so they never reach
 * the browser bundle.
 */
let client: Redis | null | undefined;

/** The shared client, or null when Redis is not configured (local dev without env vars). */
export function getRedis(): RedisLike | null {
  if (client === undefined) {
    const configured =
      (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
      (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN);
    client = configured
      ? Redis.fromEnv({
          // One quick try: counting must never hold up a download or a page.
          retry: { retries: 0 },
          // No SDK/platform telemetry headers (the project's no-telemetry rule).
          enableTelemetry: false,
        })
      : null;
  }
  return client;
}

/** Salt for hashing client IPs in the rate limit. Falls back to a fixed value in local dev. */
export function ipHashSalt(): string {
  return process.env.IP_HASH_SALT || "kliprix-dev-salt";
}
