import { StarIcon } from "lucide-react";
import { changelog, repoUrl, reviews, type Review } from "@/lib/site";
import { Container, SectionHead } from "./section-head";
import { ReviewForm } from "./review-form";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5 text-brand" aria-label={`${n} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} className="size-3.5" fill={i <= n ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const body = (
    <>
      <Stars n={r.rating} />
      <p className="mt-3 text-[15px] leading-relaxed text-[#d8d8de]">“{r.text}”</p>
      <p className="mt-4 text-[13px]">
        <b className="font-semibold">{r.name}</b>
        <span className="text-dim"> · {r.role}</span>
      </p>
    </>
  );
  const cls = "reveal block rounded-2xl border border-line bg-white/[0.02] p-6";
  return r.url ? (
    <a href={r.url} target="_blank" rel="noreferrer" className={`${cls} hover:border-line-strong`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Community() {
  return (
    <Container id="changelog" className="pt-[clamp(70px,10vw,110px)] pb-10">
      <SectionHead
        eyebrow="Built in the open"
        title="Shipping every week."
        sub="Tell us what to build next."
      />

      {reviews.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard key={`${r.name}-${r.date}`} r={r} />
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <div className="reveal rounded-[20px] border border-line bg-linear-to-b from-white/[0.03] to-white/[0.01] p-7">
          <h3 className="text-[22px] font-semibold">Recently shipped</h3>
          <ul className="mt-2">
            {changelog.map((c) => (
              <li
                key={c.id}
                className="grid grid-cols-[64px_1fr] gap-4 border-b border-line py-3.5 text-[14.5px]"
              >
                <code className="font-mono text-xs leading-6 text-brand">{c.id}</code>
                <span className="text-[#d8d8de]">{c.text}</span>
              </li>
            ))}
          </ul>
          <a
            href={`${repoUrl}/commits`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-[13px] text-muted-foreground hover:text-foreground"
          >
            Every change on GitHub →
          </a>
        </div>

        <div className="reveal rounded-[20px] border border-line bg-linear-to-b from-white/[0.03] to-white/[0.01] p-7">
          <h3 className="text-[22px] font-semibold">Tried Kliprix? Leave a review</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Reviews are shown here once we&apos;ve checked them. Nothing is made up.
          </p>
          <ReviewForm />
          {reviews.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-line-strong p-4 text-[13.5px] text-muted-foreground">
              No reviews yet. Yours could be the first one here.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
