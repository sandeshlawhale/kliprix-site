import { cn } from "@/lib/utils";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] tracking-wide text-muted-foreground">
      <i className="size-1.5 rounded-full bg-brand shadow-[0_0_12px_var(--brand)]" />
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  lede,
  center,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  lede?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={cn("reveal", center && "text-center")}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 mb-3 text-[clamp(34px,5vw,52px)] leading-[1.04] font-semibold">
        {title}
        {sub && (
          <>
            <br />
            <span className="text-dim">{sub}</span>
          </>
        )}
      </h2>
      {lede && (
        <p
          className={cn(
            "max-w-[620px] text-lg leading-relaxed text-muted-foreground",
            center && "mx-auto",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}

export function Container({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative", className)}>
      {/* The id sits on the content, not the padded section, so nav links land on the heading. */}
      <div id={id} className="mx-auto max-w-[1200px] px-5 sm:px-8">
        {children}
      </div>
    </section>
  );
}
