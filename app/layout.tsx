import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Metal Fusion Codex — A Beyblade MFB Collection",
  description:
    "A curated showcase of Beyblade Metal Fusion tops — their parts, types, owners, and stats. A fan-made codex of the 2009–2010 MFB era.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 pt-[64px]">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Toasts */}
        <Toaster
          position="top-right"
          theme="dark"
          closeButton
          toastOptions={{
            style: {
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "0px",
              color: "#EFEFEF",
              fontFamily: "var(--font-geist-mono)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
