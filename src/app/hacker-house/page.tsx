import type { Metadata } from "next";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import { HeroSection } from "@/components/hacker-house/HeroSection";
import { WhatIsItSection } from "@/components/hacker-house/WhatIsItSection";
import { VibeSection } from "@/components/hacker-house/VibeSection";
import { WhoItsForSection } from "@/components/hacker-house/WhoItsForSection";
import { OutcomesSection } from "@/components/hacker-house/OutcomesSection";
import { ScheduleSection } from "@/components/hacker-house/ScheduleSection";
import { HostsSection } from "@/components/hacker-house/HostsSection";
import { ApplySection } from "@/components/hacker-house/ApplySection";
import { FaqSection } from "@/components/hacker-house/FaqSection";

export const metadata: Metadata = {
  title: "Hacker House — AI Foundations",
  description:
    "A 4-week, in-person hacker house for six builders — college students especially welcome. Build a real portfolio with James Murdza and Burhan Khatri.",
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
        <OutcomesSection />
        <ScheduleSection />
        <HostsSection />
        <ApplySection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
