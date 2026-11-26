import { AppScreens } from "./app-screens";
import { Container, SectionHead } from "./section-head";
import { HowSteps } from "./how-steps";
import { providerLogos } from "./provider-logos";

export function ProviderStrip() {
  return (
    <div className="relative z-10 border-y border-line py-7">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-5 sm:px-8 lg:flex-row lg:justify-between">
        <small className="text-[13px] whitespace-nowrap text-dim">
          Use the AI you already have
        </small>
        <ul className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 sm:gap-x-12 lg:flex lg:gap-x-9">
          {providerLogos.map((p) => (
            <li
              key={p.name}
              className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-[#c9c9d1] sm:text-[16px] opacity-70 transition-opacity hover:opacity-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                fillRule="evenodd"
                aria-hidden="true"
                className="size-5"
                dangerouslySetInnerHTML={{ __html: p.svg }}
              />
              {p.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <Container id="how" className="pt-[clamp(56px,8vw,96px)] pb-6">
      <SectionHead
        eyebrow="How it works"
        title="From link to posted"
        sub="in three steps."
        lede="No timeline to learn. Paste, press Start, and come back to finished clips."
      />
      <HowSteps />
      <AppScreens />
    </Container>
  );
}
