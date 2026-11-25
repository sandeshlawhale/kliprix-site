import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { RevealObserver } from "@/components/site/reveal";
import { MotionProvider } from "@/components/site/motion-provider";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const anton = localFont({
  src: "../fonts/Anton-Regular.ttf",
  variable: "--font-anton",
  display: "swap",
});
const montserrat = localFont({
  src: "../fonts/Montserrat-ExtraBold.ttf",
  variable: "--font-montserrat",
  display: "swap",
});

const title = "Kliprix: turn long videos into shorts, on your own PC";
const description =
  "Free, open-source app that finds the best moments in your streams and videos and renders vertical shorts with animated captions. Runs locally. No account, no watermark.";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl || "http://127.0.0.1:3100"),
  title,
  description,
  openGraph: { title, description, type: "website", images: ["/media/clip-1.jpg"] },
  twitter: { card: "summary_large_image", title, description },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#08080b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${anton.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS as available before paint, so reveal animations never hide content without JS. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
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
