"use client";

import { useMemo, useState } from "react";
import CardWithCornerShine from "@/components/ui/CardWithCornerShine";
import { BEYBLADES, type Beyblade, type BeybladeType } from "@/data/beyblades";


// ──────────────────────────────────────────────────────────────────────
// Type → color mapping
// ──────────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<BeybladeType, { fg: string; bg: string; border: string }> = {
  Attack: { fg: "#FF4752", bg: "rgba(255,71,82,0.12)", border: "rgba(255,71,82,0.30)" },
  Defense: { fg: "#4F9DFF", bg: "rgba(79,157,255,0.12)", border: "rgba(79,157,255,0.30)" },
  Stamina: { fg: "#4ADE80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.30)" },
  Balance: { fg: "#E5B84B", bg: "rgba(229,184,75,0.12)", border: "rgba(229,184,75,0.30)" },
};

const TYPES: ("All" | BeybladeType)[] = ["All", "Attack", "Defense", "Stamina", "Balance"];

const TYPE_DEFINITIONS: { type: BeybladeType; tagline: string; description: string }[] = [
  {
    type: "Attack",
    tagline: "Hit fast. Hit hard.",
    description:
      "Aggressive movement, flat or rubber tips. High damage output but burns through stamina quickly.",
  },
  {
    type: "Defense",
    tagline: "Outlast the impact.",
    description:
      "Heavy fusion wheels, wide tips. Absorbs attacks and keeps spinning where attackers fall.",
  },
  {
    type: "Stamina",
    tagline: "Spin them dry.",
    description:
      "Sharp or metal sharp tips with low friction. Wins by outlasting opponents in long matches.",
  },
  {
    type: "Balance",
    tagline: "All four corners.",
    description:
      "A blend of attack, defense, and stamina — adaptable across most matchups.",
  },
];

const ANATOMY_PARTS = [
  {
    name: "Face Bolt",
    short: "01",
    purpose:
      "The top sticker — the Beyblade's identity. A spirit beast logo bolted onto the energy ring.",
  },
  {
    name: "Energy Ring",
    short: "02",
    purpose:
      "Plastic ring beneath the Face Bolt. Determines spin direction and adds minor balance.",
  },
  {
    name: "Fusion Wheel",
    short: "03",
    purpose:
      "The heavy metal disc — the heart of the Beyblade. Its shape and weight define attack power.",
  },
  {
    name: "Spin Track",
    short: "04",
    purpose:
      "Sets the height of the wheel. Lower = aggressive attacks; taller = defensive coverage.",
  },
  {
    name: "Performance Tip",
    short: "05",
    purpose:
      "The contact point with the stadium. Defines movement: flat, sharp, ball, rubber, and more.",
  },
];

// ──────────────────────────────────────────────────────────────────────
// Small UI helpers
// ──────────────────────────────────────────────────────────────────────
function TypeChip({ type }: { type: BeybladeType }) {
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

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-16 text-[10px] uppercase tracking-wider"
        style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-white/5 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="w-6 text-right text-[11px] tabular-nums"
        style={{ color: "#CACACA", fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

function BeyHero({ bey, accent }: { bey: Beyblade; accent: string }) {
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
      {/* Faint accent glow */}
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
            no image · run sync
          </span>
        </div>
      )}
    </div>
  );
}

function ComponentRow({ label, value }: { label: string; value: string }) {
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

// ──────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [filter, setFilter] = useState<(typeof TYPES)[number]>("All");

  const filtered = useMemo(
    () => (filter === "All" ? BEYBLADES : BEYBLADES.filter((b) => b.type === filter)),
    [filter]
  );

  const totals = useMemo(() => {
    const counts: Record<BeybladeType, number> = {
      Attack: 0,
      Defense: 0,
      Stamina: 0,
      Balance: 0,
    };
    BEYBLADES.forEach((b) => (counts[b.type] += 1));
    return counts;
  }, []);

  const stats = [
    { label: "Tops Cataloged", value: BEYBLADES.length.toString(), unit: "" },
    { label: "Attack Types", value: totals.Attack.toString(), unit: "" },
    { label: "Defense Types", value: totals.Defense.toString(), unit: "" },
    { label: "Series Span", value: "2009–10", unit: "" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#EFEFEF" }}>
      {/* ── Hero Section ── */}
      <section className="relative border-b" style={{ borderColor: "#252525" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,71,82,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <span
            className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase mb-6"
            style={{
              background: "rgba(255,71,82,0.12)",
              color: "#FF4752",
              borderRadius: "6px",
              border: "1px solid rgba(255,71,82,0.30)",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            Metal Fight Beyblade · 2009–2010
          </span>

          <h1 className="text-heading-64 sm:text-heading-72 mb-6" style={{ color: "#EFEFEF" }}>
            Let it <span style={{ color: "#FF4752" }}>rip.</span>
          </h1>

          <p
            className="text-label-16 max-w-xl mx-auto mb-10"
            style={{
              color: "#666666",
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "1.7",
            }}
          >
            A curated showcase of <span style={{ color: "#CACACA" }}>Beyblade Metal Fusion</span> tops —
            their components, types, and stats, all in one place.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#collection"
              className="px-6 py-2.5 text-sm font-medium transition-all duration-150"
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
              Browse Collection
            </a>
            <a
              href="#anatomy"
              className="px-6 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                background: "transparent",
                color: "#CACACA",
                borderRadius: "0px",
                border: "1px solid #252525",
                fontFamily: "var(--font-geist-sans)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#555";
                (e.currentTarget as HTMLElement).style.color = "#EFEFEF";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#252525";
                (e.currentTarget as HTMLElement).style.color = "#CACACA";
              }}
            >
              Anatomy of a Bey
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="border-b" style={{ borderColor: "#252525" }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
          style={
            {
              borderColor: "#252525",
              "--tw-divide-color": "#252525",
            } as React.CSSProperties
          }
        >
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-6 flex flex-col gap-1">
              <span className="text-num-40" style={{ color: "#EFEFEF" }}>
                {stat.value}
                {stat.unit && (
                  <span className="text-label-12-mono ml-1" style={{ color: "#666666" }}>
                    {stat.unit}
                  </span>
                )}
              </span>
              <span
                className="text-label-12"
                style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Anatomy Section ── */}
      <section
        id="anatomy"
        className="border-b"
        style={{ borderColor: "#252525", background: "#0A0A0A" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10">
            <p
              className="text-label-12 uppercase tracking-widest mb-2"
              style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
            >
              Anatomy
            </p>
            <h2 className="text-heading-32" style={{ color: "#EFEFEF" }}>
              Five parts. <span style={{ color: "#666666" }}>One spinning top.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ANATOMY_PARTS.map((part) => (
              <CardWithCornerShine key={part.name} padding="md">
                <div className="flex flex-col gap-3 h-full">
                  <span
                    className="text-num-32"
                    style={{ color: "#FF4752", lineHeight: 1 }}
                  >
                    {part.short}
                  </span>
                  <h3
                    className="text-heading-16"
                    style={{ color: "#EFEFEF" }}
                  >
                    {part.name}
                  </h3>
                  <p
                    className="text-label-13"
                    style={{
                      color: "#666666",
                      fontFamily: "var(--font-geist-sans)",
                      lineHeight: "1.6",
                    }}
                  >
                    {part.purpose}
                  </p>
                </div>
              </CardWithCornerShine>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collection Section ── */}
      <section id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p
              className="text-label-12 uppercase tracking-widest mb-2"
              style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
            >
              Collection
            </p>
            <h2 className="text-heading-32" style={{ color: "#EFEFEF" }}>
              The Bey Roster
            </h2>
            <p
              className="text-label-13 mt-1"
              style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
            >
              {filtered.length} {filtered.length === 1 ? "top" : "tops"}
              {filter !== "All" && <> · filtered by {filter}</>}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {TYPES.map((t) => {
              const active = filter === t;
              const accent =
                t === "All" ? "#FF4752" : TYPE_COLORS[t as BeybladeType].fg;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className="px-3 py-1 text-[12px] font-medium transition-all duration-150"
                  style={{
                    borderRadius: "6px",
                    border: `1px solid ${active ? accent : "#252525"}`,
                    background: active ? accent : "transparent",
                    color: active ? "#0A0A0A" : "#CACACA",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filtered.map((b) => {
            const c = TYPE_COLORS[b.type];
            return (
              <CardWithCornerShine key={b.id} padding="lg">
                <div className="flex flex-col gap-5 h-full">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <TypeChip type={b.type} />
                      <span
                        className="text-[11px]"
                        style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                      >
                        {b.code}
                      </span>
                    </div>
                    <span
                      className="text-[11px] uppercase tracking-wider"
                      style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                    >
                      Debut · {b.debut}
                    </span>
                  </div>

                  {/* Name + combo */}
                  <div>
                    <h3 className="text-heading-24" style={{ color: "#EFEFEF" }}>
                      {b.name}
                    </h3>
                    <p
                      className="text-label-12-mono mt-1"
                      style={{ color: c.fg }}
                    >
                      {b.combo}
                    </p>
                  </div>

                  {/* Hero image / placeholder */}
                  <BeyHero bey={b} accent={c.fg} />

                  {/* Description */}
                  <p
                    className="text-label-13"
                    style={{
                      color: "#CACACA",
                      fontFamily: "var(--font-geist-sans)",
                      lineHeight: "1.6",
                    }}
                  >
                    {b.description}
                  </p>

                  {/* Components grid */}
                  <div className="grid grid-cols-2 gap-x-6">
                    <div>
                      <ComponentRow label="Energy Ring" value={b.energyRing} />
                      <ComponentRow label="Fusion Wheel" value={b.fusionWheel} />
                    </div>
                    <div>
                      <ComponentRow label="Spin Track" value={b.spinTrack} />
                      <ComponentRow label="Tip" value={b.performanceTip} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col gap-2 pt-1">
                    <StatBar label="Attack" value={b.stats.attack} color={TYPE_COLORS.Attack.fg} />
                    <StatBar label="Defense" value={b.stats.defense} color={TYPE_COLORS.Defense.fg} />
                    <StatBar label="Stamina" value={b.stats.stamina} color={TYPE_COLORS.Stamina.fg} />
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-4 mt-auto"
                    style={{ borderTop: "1px solid #252525" }}
                  >
                    <div>
                      <p className="text-label-12-mono" style={{ color: "#666666" }}>
                        Owner
                      </p>
                      <p
                        className="text-label-13 mt-0.5"
                        style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
                      >
                        {b.owner}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-label-12-mono" style={{ color: "#666666" }}>
                        Weight
                      </p>
                      <p
                        className="text-label-13 mt-0.5 tabular-nums"
                        style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
                      >
                        {b.weight}
                      </p>
                      {b.source && (
                        <a
                          href={b.source}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] mt-1 transition-colors duration-150"
                          style={{
                            color: "#666666",
                            fontFamily: "var(--font-geist-mono)",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.color = "#FF4752")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.color = "#666666")
                          }
                        >
                          source ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardWithCornerShine>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div
            className="mt-8 px-6 py-10 border text-center"
            style={{
              borderColor: "#252525",
              background: "rgba(255,71,82,0.04)",
            }}
          >
            <p
              className="text-label-14"
              style={{ color: "#CACACA", fontFamily: "var(--font-geist-mono)" }}
            >
              No tops match this filter — yet.
            </p>
          </div>
        )}
      </section>

      {/* ── Types Section ── */}
      <section
        id="types"
        className="border-t border-b"
        style={{ borderColor: "#252525", background: "#0A0A0A" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10">
            <p
              className="text-label-12 uppercase tracking-widest mb-2"
              style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
            >
              Types
            </p>
            <h2 className="text-heading-32" style={{ color: "#EFEFEF" }}>
              Four roles in the stadium.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TYPE_DEFINITIONS.map((t) => {
              const c = TYPE_COLORS[t.type];
              return (
                <CardWithCornerShine key={t.type} padding="lg">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <TypeChip type={t.type} />
                      <span
                        className="text-num-32"
                        style={{ color: c.fg, opacity: 0.6, lineHeight: 1 }}
                      >
                        {totals[t.type].toString().padStart(2, "0")}
                      </span>
                    </div>
                    <h3
                      className="text-heading-20"
                      style={{ color: "#EFEFEF" }}
                    >
                      {t.tagline}
                    </h3>
                    <p
                      className="text-label-14"
                      style={{
                        color: "#CACACA",
                        fontFamily: "var(--font-geist-sans)",
                        lineHeight: "1.6",
                      }}
                    >
                      {t.description}
                    </p>
                  </div>
                </CardWithCornerShine>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="border-t" style={{ borderColor: "#252525", background: "#000" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col md:flex-row items-start gap-8">
          <div className="md:w-1/3">
            <p
              className="text-label-12 uppercase tracking-widest mb-3"
              style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
            >
              About
            </p>
            <h3 className="text-heading-32" style={{ color: "#EFEFEF" }}>
              Why a <br /> codex?
            </h3>
          </div>
          <div className="md:w-2/3">
            <p
              className="text-label-16 mb-4"
              style={{
                color: "#CACACA",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: "1.8",
              }}
            >
              Metal Fusion (or <span style={{ color: "#EFEFEF" }}>Metal Fight Beyblade</span>) launched
              the modern era of Beyblade in 2009 — replacing plastic with metal-cored tops you could
              swap, mix, and fine-tune. Every top is a four-part puzzle: Energy Ring, Fusion Wheel,
              Spin Track, and Performance Tip.
            </p>
            <p
              className="text-label-16"
              style={{
                color: "#666666",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: "1.8",
              }}
            >
              This codex collects the icons of that era — the Beys you grew up with, organized by
              type, owner, and stats. A small love letter to a simpler stadium. Fan project, no
              affiliation with Takara Tomy or Hasbro.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
