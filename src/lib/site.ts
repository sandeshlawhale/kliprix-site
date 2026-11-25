import siteJson from "../../data/site.json";
import reviewsJson from "../../data/reviews.json";
import changelogJson from "../../data/changelog.json";

export type SiteConfig = {
  /** Public URL of the deployed site, e.g. "https://kliprix.app". Used for social previews. */
  siteUrl: string;
  /** GitHub "owner/name". */
  repo: string;
  /** Direct download of the source code. */
  downloadZip: string;
  /** Optional form service URL (Formspree, Getform, ...). Empty: reviews open a GitHub issue. */
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

export type ChangelogEntry = { id: string; date: string; text: string };

export const site: SiteConfig = siteJson;
export const reviews = reviewsJson as Review[];
export const changelog = changelogJson as ChangelogEntry[];

export const repoUrl = `https://github.com/${site.repo}`;
export const issuesNewUrl = `${repoUrl}/issues/new`;

export const nav = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#privacy", label: "Privacy" },
  { href: "#changelog", label: "Changelog" },
  { href: "#faq", label: "FAQ" },
];
