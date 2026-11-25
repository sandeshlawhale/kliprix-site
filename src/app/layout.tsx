import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RevealObserver } from "@/components/site/reveal";
import { MotionProvider } from "@/components/site/motion-provider";
import { repoUrl } from "@/lib/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// Only the caption demos (below the fold) use it, so it is not preloaded.
const montserrat = Montserrat({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});

const title = "Kliprix: turn long videos into shorts, on your own PC";
const description =
  "Free, open-source app that finds the best moments in your streams and videos and renders vertical shorts with animated captions. Runs locally. No account, no watermark.";
const shareImage = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "Kliprix: one long video in, five scroll-stopping shorts out",
  type: "image/jpeg",
};

// Share previews (WhatsApp, LinkedIn, X, Facebook, Slack, Discord, Telegram, iMessage) read
// these Open Graph and Twitter tags. Every URL is made absolute with metadataBase.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Kliprix",
  keywords: [
    "YouTube to shorts",
    "AI clipping",
    "stream highlights",
    "vertical video",
    "Hinglish captions",
    "open source",
    "local",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Kliprix",
    locale: "en_US",
    title,
    description,
    images: [shareImage],
  },
  twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#08080b", colorScheme: "dark" };

// Lets search engines show Kliprix as a free app (structured data).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kliprix",
  description,
  url: siteUrl,
  image: `${siteUrl}/og.jpg`,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Windows, macOS, Linux",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://opensource.org/licenses/MIT",
  codeRepository: repoUrl,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS as available before paint, so reveal animations never hide content without JS. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <RevealObserver />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
