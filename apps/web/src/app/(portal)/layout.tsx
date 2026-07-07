import type { Metadata } from "next";
import { Inter, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { NavBar } from "@portal/components/NavBar";
import { Footer } from "@portal/components/Footer";
import { NavProgress } from "@portal/components/NavProgress";

const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fontHeading = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Foundations Summer School",
  description:
    "One cohort, online and in the house. Build real projects, trade stars, and leave with a portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontHeading.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <NavProgress />
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
