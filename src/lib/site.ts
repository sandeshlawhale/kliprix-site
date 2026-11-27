import siteJson from "../../data/site.json";
import reviewsJson from "../../data/reviews.json";

export type SiteConfig = {
  /** Public URL of the deployed site, e.g. "https://kliprix.app". Used for social previews. */
  siteUrl: string;
  /** GitHub "owner/name". */
  repo: string;
  /** Version of the latest app release, e.g. "0.1.0". */
  version: string;
  /** ISO date of that release, e.g. "2026-11-27". */
  releaseDate: string;
  /** GitHub release page with the notes for that version. */
  releaseNotesUrl: string;
  /** The release ZIP. /api/download counts the click and redirects here. */
  downloadUrl: string;
  /** Form service URL (e.g. Formspree) that emails feedback to the owner. Empty: the form is off. */
  reviewFormEndpoint: string;
};

export type Review = {
  name: string;
  /** What they make, e.g. "Gaming clips". */
  role: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** ISO date, e.g. "2026-12-01". */
  date: string;
  /** Optional link to where the review was posted (GitHub issue, tweet, video). */
  url?: string;
};

export const site: SiteConfig = siteJson;
export const reviews = reviewsJson as Review[];

export const repoUrl = `https://github.com/${site.repo}`;

/** Every Download button goes here; the page explains the install and counts the click. */
export const downloadPage = "/download";

// Absolute ("/#how"), so the links also work from /download.
export const nav = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#feedback", label: "Feedback" },
];
