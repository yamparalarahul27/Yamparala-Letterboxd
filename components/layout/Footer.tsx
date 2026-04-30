"use client";

import Link from "next/link";

const footerLinks = [
    { label: "Collections", href: "/#collections" },
    { label: "Beyblades", href: "/beyblades" },
    { label: "Bladers", href: "/bladers" },
    { label: "Canvas", href: "/canvasgallery" },
    { label: "About", href: "/#about" },
];

export default function Footer() {
    return (
        <footer
            className="border-t"
            style={{
                borderColor: "#252525",
                background: "#000",
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left — brand */}
                <div className="flex flex-col items-center sm:items-start gap-0.5">
                    <span
                        className="text-label-12-mono font-bold tracking-widest uppercase"
                        style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
                    >
                        Yamparala Favourites
                    </span>
                    <span
                        className="text-label-12"
                        style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                    >
                        A personal catalog of the things I love
                    </span>
                </div>

                {/* Center — links */}
                <nav className="flex items-center gap-4 flex-wrap justify-center">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="text-label-12 transition-colors duration-150"
                            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                            onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.color = "#EFEFEF")
                            }
                            onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.color = "#666666")
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right — attribution */}
                <p
                    className="text-label-12"
                    style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                >
                    Personal project — Beyblades not affiliated with{" "}
                    <span style={{ color: "#CACACA" }}>Takara Tomy</span>
                </p>
            </div>
        </footer>
    );
}
