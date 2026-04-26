"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Github, Search as SearchIcon } from "lucide-react";
import { BEYBLADES } from "@/data/beyblades";

const navLinks = [
    { label: "Collection", href: "#collection" },
    { label: "Anatomy", href: "#anatomy" },
    { label: "Types", href: "#types" },
    { label: "About", href: "#about" },
];

function openPalette() {
    window.dispatchEvent(new Event("palette:open"));
}

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mobileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [menuOpen]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-[#252525]" : ""}`}
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
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group select-none flex-shrink-0">
                        <span
                            className="flex items-center justify-center w-7 h-7 text-[13px] font-bold"
                            style={{
                                background: "#FF4752",
                                color: "#0A0A0A",
                                fontFamily: "var(--font-geist-mono)",
                                letterSpacing: "-0.04em",
                            }}
                        >
                            BX
                        </span>
                        <div className="flex flex-col leading-none">
                            <span
                                className="text-[9px] uppercase tracking-[0.2em] mb-0.5"
                                style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                            >
                                Beyblade
                            </span>
                            <span
                                className="text-[13px] font-bold tracking-wider"
                                style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
                            >
                                METAL FUSION
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden lg:flex items-center gap-1 ml-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-3 py-1.5 text-xs font-medium text-[#CACACA] hover:text-white transition-colors duration-200"
                                style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Search trigger */}
                    <button
                        type="button"
                        onClick={openPalette}
                        className="flex items-center gap-2 px-3 py-1.5 transition-colors duration-200"
                        style={{
                            border: "1px solid #252525",
                            color: "#CACACA",
                            fontFamily: "var(--font-geist-mono)",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "#FF4752";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "#252525";
                        }}
                        aria-label="Open search"
                    >
                        <SearchIcon size={14} />
                        <span className="hidden md:inline text-[11px]">Search</span>
                        <span
                            className="hidden md:inline text-[10px] px-1 ml-1"
                            style={{ color: "#666", border: "1px solid #252525", borderRadius: "3px" }}
                        >
                            ⌘K
                        </span>
                    </button>

                    {/* Counter (desktop only) */}
                    <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 border-x border-[#252525]">
                        <div className="flex flex-col">
                            <span
                                className="text-[10px] uppercase tracking-wider text-[#666666]"
                                style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                                Tops cataloged
                            </span>
                            <span
                                className="text-xs font-medium text-[#EFEFEF] tabular-nums"
                                style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                                {BEYBLADES.length}
                            </span>
                        </div>
                    </div>

                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:flex items-center justify-center w-8 h-8 border border-[#252525] hover:border-[#FF4752] transition-colors duration-200"
                        aria-label="GitHub"
                    >
                        <Github size={14} className="text-[#CACACA]" />
                    </a>

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
            </header>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0"
                        style={{ background: "rgba(0,0,0,0.7)" }}
                        onClick={() => setMenuOpen(false)}
                    />
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
                            <div className="mt-4 pt-4 border-t border-[#252525] flex justify-between items-center px-4">
                                <span className="text-xs text-[#666666]">Tops cataloged</span>
                                <span className="text-xs text-[#EFEFEF] tabular-nums">{BEYBLADES.length}</span>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}
