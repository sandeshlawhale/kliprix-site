import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { repoUrl, site } from "@/lib/site";
import { CopyButton } from "./copy-button";
import { GitHubIcon, Logo } from "./icons";

const installCmd = `git clone ${repoUrl}.git && cd Kliprix && scripts\\start.bat`;

export function FinalCta() {
  return (
    <section
      id="install"
      className="relative mt-[clamp(70px,10vw,120px)] overflow-hidden border-t border-line py-[clamp(70px,10vw,110px)] text-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_320px_at_50%_100%,rgb(255_210_63/0.18),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
        <h2 className="reveal text-[clamp(40px,7vw,72px)] leading-[1.02] font-semibold">
          Your next five shorts
          <br />
          are <span className="text-brand">one link away.</span>
        </h2>
        <div className="reveal mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={site.downloadZip}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-xl px-5 text-[15px] font-semibold glow-brand",
            )}
          >
            Download Kliprix
          </a>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 gap-2 rounded-xl border-line-strong bg-white/[0.04] px-5 text-[15px] font-semibold",
            )}
          >
            <GitHubIcon className="size-4" />
            Star on GitHub
          </a>
        </div>
        <div className="reveal mx-auto mt-8 flex w-fit max-w-full flex-col items-center gap-3">
          <div className="flex w-full items-center gap-3 rounded-xl border border-line-strong bg-white/[0.03] py-2.5 pr-2.5 pl-4 text-left">
            <span className="hidden shrink-0 text-xs text-dim sm:inline">Windows</span>
            <code className="min-w-0 flex-1 font-mono text-[12.5px] break-all text-[#d8d8de] sm:text-[13px] md:break-normal md:whitespace-nowrap">
              {installCmd}
            </code>
            <CopyButton text={installCmd} className="px-2 py-1 text-xs" />
          </div>
          <p className="text-center text-xs text-dim">
            Needs Python 3.11 or 3.12, Node.js 22+ and FFmpeg. The first start installs everything
            else.{" "}
            <a
              href={`${repoUrl}#requirements`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Full setup guide
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line py-10 text-[13px] text-dim">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-4">
          <Logo />
          <span>© 2026 Kliprix. All rights reserved.</span>
        </div>
        <nav className="flex gap-6" aria-label="Footer">
          <a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
            GitHub
          </a>
          <a
            href={`${repoUrl}#readme`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Docs
          </a>
          <a href="#feedback" className="hover:text-foreground">
            Feedback
          </a>
          <a href="#privacy" className="hover:text-foreground">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
