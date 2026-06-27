import type { Metadata } from "next";

import { Header } from "@site/components/header";
import { Footer } from "@site/components/footer";

import { HeroSection } from "@site/components/hacker-house/HeroSection";
import { WhatIsItSection } from "@site/components/hacker-house/WhatIsItSection";
import { DetailsSection } from "@site/components/hacker-house/DetailsSection";
import { WhoItsForSection } from "@site/components/hacker-house/WhoItsForSection";
import { HostsSection } from "@site/components/hacker-house/HostsSection";
import { ApplySection } from "@site/components/hacker-house/ApplySection";
import { FaqSection } from "@site/components/hacker-house/FaqSection";

const OG_IMAGE = "https://aifoundations.school/og/summer-school.jpg";
const PAGE_URL = "https://aifoundations.school/summer-school";
const PAGE_TITLE = "Summer School — AI Foundations";
const PAGE_DESCRIPTION =
  "A 4-week, in-person summer school for builders who want to improve their portfolio. College students welcome.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    siteName: "AI Foundations",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "AI Foundations Summer School",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function HackerHousePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <WhatIsItSection />
        <DetailsSection />
        <WhoItsForSection />
        <HostsSection />
        <ApplySection />
        <FaqSection />
      </main>
      <Footer />
    </>
  );
}
