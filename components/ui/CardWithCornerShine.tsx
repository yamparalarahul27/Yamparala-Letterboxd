"use client";

import { ReactNode } from "react";

interface CardWithCornerShineProps {
    children: ReactNode;
    className?: string;
    minHeight?: string;
    padding?: "xs" | "sm" | "md" | "lg";
    onClick?: () => void;
}

const CornerAccents = () => (
    <>
        {/* Top-Left */}
        <div className="absolute top-4 left-4 w-4 h-4">
            <div className="absolute top-0 left-0 w-2 h-px bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
            <div className="absolute top-0 left-0 w-px h-2 bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
        </div>
        {/* Top-Right */}
        <div className="absolute top-4 right-4 w-4 h-4">
            <div className="absolute top-0 right-0 w-2 h-px bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
            <div className="absolute top-0 right-0 w-px h-2 bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
        </div>
        {/* Bottom-Left */}
        <div className="absolute bottom-4 left-4 w-4 h-4">
            <div className="absolute bottom-0 left-0 w-2 h-px bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-px h-2 bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
        </div>
        {/* Bottom-Right */}
        <div className="absolute bottom-4 right-4 w-4 h-4">
            <div className="absolute bottom-0 right-0 w-2 h-px bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
            <div className="absolute bottom-0 right-0 w-px h-2 bg-white/20 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300" />
        </div>
    </>
);

const PADDING = {
    xs: "p-4",
    sm: "p-5",
    md: "p-6",
    lg: "p-8",
} as const;

export default function CardWithCornerShine({
    children,
    className = "",
    minHeight = "",
    padding = "md",
    onClick,
}: CardWithCornerShineProps) {
    return (
        <div
            onClick={onClick}
            className={[
                "group relative",
                "bg-[#111]/80",
                "border border-white/10",
                "hover:border-white/20",
                "hover:shadow-lg hover:shadow-white/5",
                "transition-all duration-300",
                onClick ? "cursor-pointer" : "",
                minHeight,
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <CornerAccents />
            <div className={`relative z-10 ${PADDING[padding]}`}>{children}</div>
        </div>
    );
}
