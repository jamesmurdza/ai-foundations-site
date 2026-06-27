import "./globals.css";

import type { Metadata } from "next";
import { Inter, Schibsted_Grotesk } from "next/font/google";

import { SmoothScroll } from "@site/components/SmoothScroll";
import { cn } from "@site/lib/utils";

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
