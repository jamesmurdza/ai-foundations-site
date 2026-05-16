import "./globals.css";

import type { Metadata } from "next";
import { Inter, Schibsted_Grotesk } from "next/font/google";

import { SmoothScroll } from "@/components/SmoothScroll";
import { cn } from "@/lib/utils";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Schibsted_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Foundations - Learn AI Development",
  description: "Learn the fundamentals of AI and machine learning with our comprehensive course. Master the concepts, build projects, and advance your career.",
  openGraph: {
    title: "AI Foundations - Learn AI Development",
    description: "Learn the fundamentals of AI and machine learning with our comprehensive course. Master the concepts, build projects, and advance your career.",
    images: [
      {
        url: "/og/social-preview.png",
        width: 1200,
        height: 630,
        alt: "AI Foundations Summer School",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Foundations - Learn AI Development",
    description: "Learn the fundamentals of AI and machine learning with our comprehensive course. Master the concepts, build projects, and advance your career.",
    images: ["/og/social-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
