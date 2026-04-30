import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CommandPalette from "@/components/ui/CommandPalette";
import AgentationToolbar from "@/components/ui/AgentationToolbar";

export const metadata: Metadata = {
  title: "Yamparala Favourites — A personal catalog",
  description:
    "A living catalog of the things Yamparala loves — laid out, archived, and explorable. Starting with Beyblades, with more collections on the way.",
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

        {/* Global ⌘K command palette */}
        <CommandPalette />

        {/* Visual annotation toolbar for dev feedback loops */}
        <AgentationToolbar />

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
