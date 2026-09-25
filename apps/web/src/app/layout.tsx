import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@krowds/ui/globals.css";
import { SiteShell } from "@/components/site-shell";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KROWDS — Find your next good day out",
    template: "%s | KROWDS",
  },
  description:
    "Discover events, keep your tickets close, and follow payment status with KROWDS.",
  applicationName: "KROWDS",
  keywords: ["events", "tickets", "Jakarta", "KROWDS"],
  openGraph: {
    title: "KROWDS — Find your next good day out",
    description:
      "A calm, transparent path from event discovery to your ticket wallet.",
    type: "website",
    siteName: "KROWDS",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
