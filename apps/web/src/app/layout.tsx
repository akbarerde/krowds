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
    default: "KROWDS — One clear operating system for every event",
    template: "%s | KROWDS",
  },
  description:
    "KROWDS helps event operators organize commerce, ticketing, fulfillment, and visitor access with accountable handoffs.",
  applicationName: "KROWDS",
  keywords: ["event operations", "ticketing", "fulfillment", "visitor access", "KROWDS"],
  openGraph: {
    title: "KROWDS — One clear operating system for every event",
    description:
      "A calm, accountable operating model for the teams behind every event and the visitors they serve.",
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
