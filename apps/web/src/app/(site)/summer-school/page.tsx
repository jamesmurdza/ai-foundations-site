import type { Metadata } from "next";

import { Header } from "@site/components/header";
import { Footer } from "@site/components/footer";

import { HeroSection } from "@site/components/hacker-house/HeroSection";
import { IntroSection } from "@site/components/hacker-house/IntroSection";
import { TopicsSection } from "@site/components/hacker-house/TopicsSection";
import { ContactSection } from "@site/components/hacker-house/ContactSection";

const OG_IMAGE = "https://aifoundations.school/og/summer-school.png";
const PAGE_URL = "https://aifoundations.school/summer-school";
const PAGE_TITLE = "AI Summer School — AI Foundations";
const PAGE_DESCRIPTION =
  "An inclusive living and learning community. A 4-week, in-person AI Summer School in West Java, Indonesia, 27 July – 21 August 2026.";

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
        <IntroSection />
        <TopicsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
