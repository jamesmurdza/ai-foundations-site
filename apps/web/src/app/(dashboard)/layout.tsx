import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AdminShell } from "@dashboard/components/AdminShell";
import { NavProgress } from "@dashboard/components/NavProgress";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hacker House Admin",
  description: "Application dashboard for the AI Foundations hacker house.",
};

// Set the theme before paint so there's no flash. Reads the user's saved
// preference, otherwise follows the OS. Runs once, synchronously.
const themeBootScript = `
(function () {
  try {
    var saved = localStorage.getItem("hh:theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = saved === "light" || saved === "dark"
      ? saved
      : (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = resolved;
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full bg-canvas text-ink">
        <NavProgress />
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
