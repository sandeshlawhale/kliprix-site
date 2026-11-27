import { handleTrack } from "@/lib/analytics/core";
import { getRedis, ipHashSalt } from "@/lib/analytics/redis";

// Anonymous click counter for the browser's track() helper. See src/lib/analytics/core.ts.
export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return handleTrack(request, { redis: getRedis(), salt: ipHashSalt() });
}
