import { handleDownload } from "@/lib/analytics/core";
import { getRedis } from "@/lib/analytics/redis";
import { site } from "@/lib/site";

// Counts the download, then redirects to the release ZIP on GitHub. Never cached: every
// click must reach this handler to be counted.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return handleDownload(request, { redis: getRedis(), downloadUrl: site.downloadUrl });
}

// Link checkers and download managers send HEAD first; those are redirected, not counted.
export function HEAD(request: Request) {
  return handleDownload(request, { redis: getRedis(), downloadUrl: site.downloadUrl });
}
