// Shared small UI helpers used across the home page, Bey detail, and part pages.
import type { Beyblade, BeybladeType } from "@/data/beyblades";
import { TYPE_COLORS } from "@/data/design-tokens";

export function TypeChip({ type }: { type: BeybladeType }) {
  const c = TYPE_COLORS[type];
  return (
    <span
      className="inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        borderRadius: "6px",
        fontFamily: "var(--font-geist-mono)",
      }}
    >
      {type}
    </span>
  );
}

export function StatBar({
  label,
  value,
  color,
  width = "small",
}: {
  label: string;
  value: number;
  color: string;
  width?: "small" | "large";
}) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  const labelClass = width === "large" ? "w-20" : "w-16";
  const heightClass = width === "large" ? "h-2" : "h-1.5";
  return (
    <div className="flex items-center gap-3">
      <span
        className={`${labelClass} text-[10px] uppercase tracking-wider`}
        style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <div className={`flex-1 ${heightClass} bg-white/5 overflow-hidden`}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="w-10 text-right text-[11px] tabular-nums"
        style={{ color: "#CACACA", fontFamily: "var(--font-geist-mono)" }}
      >
        {width === "large" ? `${value}/10` : value}
      </span>
    </div>
  );
}

export function ComponentRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-center justify-between py-2"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <span
        className="text-[12px]"
        style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function BeyHero({ bey, accent }: { bey: Beyblade; accent: string }) {
  const initial = bey.name.charAt(0);
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "150px",
        background:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${accent}1A 0%, transparent 60%)`,
        }}
      />
      {bey.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bey.image}
          alt={bey.name}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ padding: "12px" }}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div
            className="flex items-center justify-center w-16 h-16"
            style={{
              border: `1px solid ${accent}40`,
              color: accent,
              fontFamily: "var(--font-geist-mono)",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            {initial}
          </div>
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "#444", fontFamily: "var(--font-geist-mono)" }}
          >
            image pending
          </span>
        </div>
      )}
    </div>
  );
}
