import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features-section";
import { FeaturesSection } from "@/components/features-section-2";
import { Testimonials } from "@/components/testimonials";
import { Faq } from "@/components/faq";
import { Pricing } from "@/components/pricing";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <FeaturesSection />
      <Testimonials />
      <Faq />
      <Pricing />
      <CtaSection />
      <Footer />
    </>
  );
}
