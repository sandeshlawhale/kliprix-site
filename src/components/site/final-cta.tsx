import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadPage, repoUrl } from "@/lib/site";
import { InstallCommand } from "./install-command";
import { GitHubIcon, Logo } from "./icons";

export function FinalCta() {
  return (
    <section
      id="install"
      className="relative mt-[clamp(56px,8vw,96px)] overflow-hidden border-t border-line py-[clamp(70px,10vw,110px)] text-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_320px_at_50%_100%,rgb(255_210_63/0.18),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
        <h2 className="reveal text-[clamp(40px,7vw,72px)] leading-[1.02] font-semibold">
          Your next five shorts
          <br />
          are <span className="text-brand">one link away.</span>
        </h2>
        <div className="reveal mt-8 flex justify-center gap-2.5 sm:gap-3">
          <a
            href={downloadPage}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 rounded-xl px-4 text-[14px] font-semibold glow-brand sm:h-12 sm:px-5 sm:text-[15px]",
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
              "h-11 gap-2 rounded-xl border-line-strong bg-white/[0.04] px-4 text-[14px] font-semibold sm:h-12 sm:px-5 sm:text-[15px]",
            )}
          >
            <GitHubIcon className="size-4" />
            Star on GitHub
          </a>
        </div>
        <div className="reveal mx-auto mt-8 flex w-fit max-w-full flex-col items-center gap-3">
          <InstallCommand />
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
          <a href="/#feedback" className="hover:text-foreground">
            Feedback
          </a>
          <a href="/#privacy" className="hover:text-foreground">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
