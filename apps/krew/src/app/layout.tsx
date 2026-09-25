import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@krowds/ui/globals.css";

import { WorkspaceShell } from "@/components/workspace-shell";
import { currentPrincipal } from "@/lib/krew-fixtures";

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
    default: "KROWDS Krew",
    template: "%s · KROWDS Krew",
  },
  description: "Internal KROWDS operations workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <WorkspaceShell principal={currentPrincipal}>
          {children}
        </WorkspaceShell>
      </body>
    </html>
  );
}
