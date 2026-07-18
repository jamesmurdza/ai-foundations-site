import { Header } from "@site/components/header";
import { Hero } from "@site/components/hero";
import { PopupSchools } from "@site/components/popup-schools-section";
import { Features } from "@site/components/features-section";

import { Testimonials } from "@site/components/testimonials";
import { Teachers } from "@site/components/teachers";
import { Faq } from "@site/components/faq";

import { Footer } from "@site/components/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <PopupSchools />

      <Testimonials />
      <Teachers />
      <Faq />

      <Footer />
    </>
  );
}
