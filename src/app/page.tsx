import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { HowItWorks, ProviderStrip } from "@/components/site/how-it-works";
import { Features } from "@/components/site/features";
import { Compare, Privacy } from "@/components/site/privacy";
import { Community } from "@/components/site/community";
import { Faq } from "@/components/site/faq";
import { FinalCta, Footer } from "@/components/site/final-cta";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ProviderStrip />
        <HowItWorks />
        <Features />
        <Privacy />
        <Compare />
        <Community />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
