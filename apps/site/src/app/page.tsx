import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features-section";

import { Testimonials } from "@/components/testimonials";
import { Teachers } from "@/components/teachers";
import { Faq } from "@/components/faq";

import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Features />

      <Testimonials />
      <Teachers />
      <Faq />

      <Footer />
    </>
  );
}
