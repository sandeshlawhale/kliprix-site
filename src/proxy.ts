import { requireBasicAuth } from "./lib/analytics/core.ts";

/**
 * Next.js 16 proxy (formerly middleware): HTTP Basic Auth in front of the private /stats page.
 * Any username works; the password is STATS_PASSWORD. Without that variable /stats stays locked.
 * Returning nothing lets the request continue.
 */
export function proxy(request: Request) {
  return requireBasicAuth(request, process.env.STATS_PASSWORD) ?? undefined;
}

export const config = { matcher: ["/stats", "/stats/:path*"] };
