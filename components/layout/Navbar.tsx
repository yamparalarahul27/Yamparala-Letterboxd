"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
    { label: "Discover", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "About", href: "/about" },
];

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mobileRef = useRef<HTMLDivElement>(null);

    // Enhance glass on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close mobile menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    // Prevent scroll when mobile open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    return (
        <>
            {/* ── Fixed Navbar ── */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-[#252525]" : ""
                    }`}
                style={{
                    background: "rgba(0,0,0,0.85)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
            >
                {/* Accent glow beam at top */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent 0%, #FF4752 30%, #FF4752 70%, transparent 100%)",
                        opacity: 0.6,
                    }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group select-none">
                        <span
                            className="text-label-12-mono font-bold tracking-widest uppercase"
                            style={{ color: "#FF4752" }}
                        >
                            YPM
                        </span>
                        <span
                            className="text-label-12 text-[#666666] hidden sm:inline"
                            style={{ fontFamily: "var(--font-geist-sans)" }}
                        >
                            Prediction Markets
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-0.5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-1.5 text-sm font-medium border-b-2 border-transparent transition-all duration-200"
                                style={{
                                    color: "#CACACA",
                                    fontFamily: "var(--font-geist-mono)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.color = "#EFEFEF";
                                    (e.currentTarget as HTMLElement).style.borderBottomColor = "#FF4752";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.color = "#CACACA";
                                    (e.currentTarget as HTMLElement).style.borderBottomColor = "transparent";
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: CTA + Hamburger */}
                    <div className="flex items-center gap-3">
                        <button
                            className="hidden md:flex items-center gap-2 px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer"
                            style={{
                                background: "#FF4752",
                                color: "#fff",
                                borderRadius: "0px",
                                fontFamily: "var(--font-geist-sans)",
                            }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.background = "#FF2030")
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.background = "#FF4752")
                            }
                        >
                            Sign In
                        </button>

                        {/* Hamburger (mobile) */}
                        <button
                            className="md:hidden flex items-center justify-center w-9 h-9 transition-colors duration-200"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                            style={{ color: "#CACACA" }}
                        >
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Mobile Menu Overlay ── */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0"
                        style={{ background: "rgba(0,0,0,0.7)" }}
                        onClick={() => setMenuOpen(false)}
                    />
                    {/* Panel */}
                    <div
                        ref={mobileRef}
                        className="absolute top-16 left-0 right-0 border-b border-[#252525]"
                        style={{
                            background: "rgba(0,0,0,0.95)",
                            backdropFilter: "blur(24px)",
                        }}
                    >
                        <nav className="flex flex-col p-4 gap-1">
                            <p
                                className="text-label-12 uppercase tracking-wider mb-2"
                                style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                            >
                                Navigation
                            </p>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 transition-all duration-150"
                                    style={{
                                        color: "#CACACA",
                                        fontFamily: "var(--font-geist-mono)",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.background =
                                            "rgba(255,255,255,0.04)";
                                        (e.currentTarget as HTMLElement).style.color = "#EFEFEF";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.background = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = "#CACACA";
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: "#FF4752" }}
                                    />
                                    {link.label}
                                </Link>
                            ))}
                            <div className="mt-4 pt-4 border-t border-[#252525]">
                                <button
                                    className="w-full py-2.5 text-sm font-medium"
                                    style={{
                                        background: "#FF4752",
                                        color: "#fff",
                                        borderRadius: "0px",
                                        fontFamily: "var(--font-geist-sans)",
                                    }}
                                >
                                    Sign In
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
