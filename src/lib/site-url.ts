import { site } from "./site";

/**
 * The public address of the site, used for absolute links in share previews, the sitemap and
 * robots.txt. Server-only (build time). Order: data/site.json "siteUrl", then the production
 * address Vercel provides during its build, then the local dev server.
 */
export const siteUrl = (
  site.siteUrl ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://127.0.0.1:3100")
).replace(/\/+$/, "");
