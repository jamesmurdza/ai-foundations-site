import type { Metadata } from "next";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { HeroSection } from "@/components/hacker-house/HeroSection";
import { WhatIsItSection } from "@/components/hacker-house/WhatIsItSection";
import { VibeSection } from "@/components/hacker-house/VibeSection";
import { WhoItsForSection } from "@/components/hacker-house/WhoItsForSection";
import { HostsSection } from "@/components/hacker-house/HostsSection";
import { ApplySection } from "@/components/hacker-house/ApplySection";
import { FaqSection } from "@/components/hacker-house/FaqSection";

export const metadata: Metadata = {
  title: "Summer School — AI Foundations",
  description:
    "A 4-week, in-person summer school for builders who want to improve their portfolio. College students welcome.",
};

export default function HackerHousePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <WhatIsItSection />
        <VibeSection />
        <WhoItsForSection />
        <HostsSection />
        <ApplySection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
