"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Search, HelpCircle, User } from "lucide-react";

const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Markets", href: "/markets" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Watchlist", href: "/watchlist" },
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

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-8">
                    {/* ── SECTION 1: LEFT (Logo + Nav) ── */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group select-none flex-shrink-0">
                            <img
                                src="/YPM Logo.png"
                                alt="YPM Logo"
                                className="h-6 w-auto"
                            />
                        </Link>

                        {/* Desktop Nav Links */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-1.5 text-xs font-medium border-b-2 border-transparent transition-all duration-200 ${link.label === "Portfolio" ? "text-white border-[#FF4752]" : "text-[#CACACA]"}`}
                                    style={{
                                        fontFamily: "var(--font-geist-mono)",
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* ── SECTION 2: CENTER (Search + Help) ── */}
                    <div className="flex-1 flex justify-center items-center gap-6">
                        <button className="flex items-center gap-2 text-[#666666] hover:text-white transition-colors duration-200">
                            <Search size={18} />
                            <span className="text-xs hidden xl:inline" style={{ fontFamily: "var(--font-geist-mono)" }}>Search (⌘K)</span>
                        </button>
                        <button className="flex items-center text-[#666666] hover:text-white transition-colors duration-200">
                            <HelpCircle size={18} />
                        </button>
                    </div>

                    {/* ── SECTION 3: RIGHT (Account) ── */}
                    <div className="hidden sm:flex items-center gap-6 px-4 py-1.5 border-x border-[#252525]">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-[#666666]" style={{ fontFamily: "var(--font-geist-mono)" }}>Value</span>
                            <span className="text-xs font-medium text-[#EFEFEF] tabular-nums" style={{ fontFamily: "var(--font-geist-mono)" }}>$100K - $150K</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-[#666666]" style={{ fontFamily: "var(--font-geist-mono)" }}>Cash</span>
                            <span className="text-xs font-medium text-[#EFEFEF] tabular-nums" style={{ fontFamily: "var(--font-geist-mono)" }}>$600,000</span>
                        </div>
                    </div>

                    {/* ── SECTION 4: PROFILE ── */}
                    <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="w-8 h-8 rounded-full border border-[#252525] flex items-center justify-center bg-white/5 transition-all duration-200 group-hover:border-[#FF4752]">
                                <User size={16} className="text-[#CACACA]" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4ADE80] border-2 border-black rounded-full shadow-[0_0_8px_rgba(74,222,128,0.4)]"></span>
                        </div>

                        {/* Hamburger (mobile) */}
                        <button
                            className="lg:hidden flex items-center justify-center w-9 h-9 transition-colors duration-200"
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
                <div className="fixed inset-0 z-40 lg:hidden">
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
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ background: "#FF4752" }}
                                    />
                                    {link.label}
                                </Link>
                            ))}
                            <div className="mt-4 pt-4 border-t border-[#252525] flex flex-col gap-4 px-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#666666]">Value</span>
                                    <span className="text-xs text-[#EFEFEF] tabular-nums">$100K - $150K</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-[#666666]">Cash</span>
                                    <span className="text-xs text-[#EFEFEF] tabular-nums">$600,000</span>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
