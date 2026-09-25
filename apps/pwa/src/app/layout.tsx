import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaNav } from "@/components/pwa-nav";
import { PwaRegister } from "@/components/pwa-register";
import "@krowds/ui/globals.css";

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
    default: "KROWDS",
    template: "%s | KROWDS",
  },
  description: "KROWDS e-ticket, wristband, and online access presentation shell.",
  applicationName: "KROWDS",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KROWDS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-fixed sr-only z-50 m-4 rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only"
        >
          Skip to main content
        </a>
        <PwaRegister />
        <PwaNav />
        {children}
      </body>
    </html>
  );
}
