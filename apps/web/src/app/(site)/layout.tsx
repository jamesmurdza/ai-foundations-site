import "./globals.css";

import type { Metadata } from "next";
import { Inter, Schibsted_Grotesk } from "next/font/google";

import { NavProgress } from "@site/components/NavProgress";
import { cn } from "@site/lib/utils";

const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fontHeading = Schibsted_Grotesk({
  variable: "--font-schibsted",
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
        <NavProgress />
        {children}
      </body>
    </html>
  );
}
