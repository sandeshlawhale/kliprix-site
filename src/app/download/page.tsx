import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/final-cta";
import { Eyebrow } from "@/components/site/section-head";
import { Help, InstallOptions, Requirements } from "@/components/site/download";
import { TrackView } from "@/components/site/analytics";
import { site } from "@/lib/site";

const title = `Download Kliprix ${site.version} for Windows, macOS and Linux`;
const description =
  "Download Kliprix, the free open-source app that turns long videos into vertical shorts on your own PC. What you need, and how to install it with a ZIP, Git or Docker.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/download" },
  openGraph: {
    type: "website",
    url: "/download",
    siteName: "Kliprix",
    title,
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Kliprix", type: "image/jpeg" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
};

const released = new Date(`${site.releaseDate}T00:00:00Z`).toLocaleDateString("en-US", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function DownloadPage() {
  return (
    <>
      <Nav />
      <main className="relative">
        <div className="hero-glow pointer-events-none absolute inset-x-0 -top-52 h-[600px] opacity-50" />
        <div className="relative mx-auto max-w-[1200px] px-5 pt-[clamp(36px,6vw,64px)] pb-[clamp(56px,8vw,96px)] sm:px-8">
          <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div>
              <Eyebrow>
                Version {site.version} · Released{" "}
                <time dateTime={site.releaseDate}>{released}</time>
              </Eyebrow>
              <h1 className="mt-3 text-[clamp(38px,6vw,56px)] leading-[1.02] font-bold">
                Download <span className="text-gradient">Kliprix</span>
              </h1>
              <p className="mt-3 max-w-[560px] text-[clamp(15px,1.8vw,17px)] leading-relaxed text-muted-foreground">
                Free and open source. Unzip it, run one command, and Kliprix opens in your browser.
              </p>
            </div>
            <a
              href={site.releaseNotesUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              What&apos;s new in {site.version}
              <ArrowUpRightIcon className="size-4" aria-hidden="true" />
            </a>
          </header>

          <section aria-label="Install options" className="mt-8 sm:mt-10">
            <InstallOptions />
          </section>

          <section
            className="mt-[clamp(48px,7vw,80px)] scroll-mt-24"
            aria-labelledby="requirements"
          >
            <Requirements />
          </section>

          <section className="mt-[clamp(48px,7vw,80px)]">
            <Help />
          </section>
        </div>
      </main>
      <Footer />
      <TrackView event="download_page_view" />
    </>
  );
}
