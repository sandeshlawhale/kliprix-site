import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { downloadPage, nav, repoUrl } from "@/lib/site";
import { GitHubIcon, Logo } from "./icons";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-9 px-5 sm:px-8">
        <a href="/#top" aria-label="Kliprix home">
          <Logo />
        </a>
        <nav className="hidden lg:block" aria-label="Main">
          <ul className="flex gap-7 text-sm whitespace-nowrap text-muted-foreground">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="transition-colors hover:text-foreground">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 text-[13px] whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <GitHubIcon className="size-[15px]" />
            Star on GitHub
          </a>
          <a
            href={downloadPage}
            className={cn(buttonVariants({ size: "lg" }), "h-9 rounded-[10px] px-3.5 glow-brand")}
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
