import { handleReset } from "@/lib/analytics/core";
import { getRedis, ipHashSalt } from "@/lib/analytics/redis";

// Clears the anonymous counters for the /stats Reset button. Checks STATS_PASSWORD itself
// (the request body), limited to a few tries a minute per client.
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleReset(request, {
    redis: getRedis(),
    password: process.env.STATS_PASSWORD,
    salt: ipHashSalt(),
  });
}
