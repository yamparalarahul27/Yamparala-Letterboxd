import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import CardWithCornerShine from "@/components/ui/CardWithCornerShine";
import { BEYBLADES, type BeybladeType } from "@/data/beyblades";

// ──────────────────────────────────────────────────────────────────────
// Static params — pre-render every detail page at build time
// ──────────────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return BEYBLADES.map((b) => ({ id: b.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bey = BEYBLADES.find((b) => b.id === id);
  if (!bey) return { title: "Not found — Metal Fusion Codex" };
  return {
    title: `${bey.combo} — Metal Fusion Codex`,
    description: bey.description,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Type → color mapping (mirrors the home page so the styling stays consistent)
// ──────────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<BeybladeType, { fg: string; bg: string; border: string }> = {
  Attack: { fg: "#FF4752", bg: "rgba(255,71,82,0.12)", border: "rgba(255,71,82,0.30)" },
  Defense: { fg: "#4F9DFF", bg: "rgba(79,157,255,0.12)", border: "rgba(79,157,255,0.30)" },
  Stamina: { fg: "#4ADE80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.30)" },
  Balance: { fg: "#E5B84B", bg: "rgba(229,184,75,0.12)", border: "rgba(229,184,75,0.30)" },
};

const PART_NOTES: Record<
  "Face Bolt" | "Energy Ring" | "Fusion Wheel" | "Spin Track" | "Performance Tip",
  string
> = {
  "Face Bolt": "Top sticker — the Beyblade's identity, bolted onto the energy ring.",
  "Energy Ring": "Plastic ring beneath the Face Bolt. Sets spin direction and minor balance.",
  "Fusion Wheel": "The heavy metal disc — defines weight, attack power, and recoil.",
  "Spin Track": "Sets ride height. Lower = aggressive, taller = defensive coverage.",
  "Performance Tip": "Stadium contact point. Defines movement: flat, sharp, ball, rubber, etc.",
};

// ──────────────────────────────────────────────────────────────────────
// UI helpers
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

function StatBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-20 text-[11px] uppercase tracking-wider"
        style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <div className="flex-1 h-2 bg-white/5 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span
        className="w-8 text-right text-[12px] tabular-nums"
        style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
      >
        {value}/10
      </span>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-4 py-3"
      style={{ border: "1px solid #252525", background: "#0A0A0A" }}
    >
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <span
        className="text-[14px]"
        style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

function PartRow({
  step,
  name,
  value,
  note,
  accent,
}: {
  step: string;
  name: string;
  value: string;
  note: string;
  accent: string;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-5 py-4"
      style={{ borderBottom: "1px solid #252525" }}
    >
      <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
        <span
          className="text-num-32"
          style={{ color: accent, lineHeight: 1, opacity: 0.7 }}
        >
          {step}
        </span>
        <div className="flex flex-col">
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
          >
            {name}
          </span>
          <span
            className="text-heading-16"
            style={{ color: "#EFEFEF" }}
          >
            {value}
          </span>
        </div>
      </div>
      <p
        className="flex-1 text-label-13"
        style={{
          color: "#999999",
          fontFamily: "var(--font-geist-sans)",
          lineHeight: "1.6",
        }}
      >
        {note}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────
export default async function BeyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bey = BEYBLADES.find((b) => b.id === id);
  if (!bey) notFound();

  const accent = TYPE_COLORS[bey.type].fg;

  // Related: same fusion wheel, same energy ring, or same owner — exclude self.
  const related = BEYBLADES.filter(
    (b) =>
      b.id !== bey.id &&
      (b.fusionWheel === bey.fusionWheel ||
        b.energyRing === bey.energyRing ||
        b.owner === bey.owner)
  ).slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#EFEFEF" }}>
      {/* ── Hero ── */}
      <section
        className="relative border-b"
        style={{ borderColor: "#252525" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${accent}1A 0%, transparent 70%)`,
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16">
          {/* Back link */}
          <Link
            href="/#collection"
            className="inline-flex items-center gap-1 text-[12px] mb-8 transition-colors duration-150"
            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
          >
            <ChevronLeft size={14} />
            Back to collection
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Image */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: "1 / 1",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 50% 60%, ${accent}26 0%, transparent 60%)`,
                }}
              />
              {bey.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bey.image}
                  alt={bey.name}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ padding: "32px" }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div
                    className="flex items-center justify-center w-32 h-32"
                    style={{
                      border: `1px solid ${accent}40`,
                      color: accent,
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "72px",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {bey.name.charAt(0)}
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

            {/* Header */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2 flex-wrap">
                <TypeChip type={bey.type} />
                <span
                  className="inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "#CACACA",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {bey.series}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                >
                  {bey.code} · debut {bey.debut}
                </span>
              </div>

              <div>
                <h1 className="text-heading-48" style={{ color: "#EFEFEF" }}>
                  {bey.name}
                </h1>
                <p
                  className="text-label-16 mt-2"
                  style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
                >
                  {bey.combo}
                </p>
              </div>

              <p
                className="text-label-16"
                style={{
                  color: "#CACACA",
                  fontFamily: "var(--font-geist-sans)",
                  lineHeight: "1.7",
                }}
              >
                {bey.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b" style={{ borderColor: "#252525" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p
            className="text-label-12 uppercase tracking-widest mb-6"
            style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
          >
            Stats
          </p>
          <div className="flex flex-col gap-4 max-w-2xl">
            <StatBar label="Attack" value={bey.stats.attack} color={TYPE_COLORS.Attack.fg} />
            <StatBar label="Defense" value={bey.stats.defense} color={TYPE_COLORS.Defense.fg} />
            <StatBar label="Stamina" value={bey.stats.stamina} color={TYPE_COLORS.Stamina.fg} />
          </div>
        </div>
      </section>

      {/* ── Anatomy / parts ── */}
      <section className="border-b" style={{ borderColor: "#252525", background: "#0A0A0A" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p
            className="text-label-12 uppercase tracking-widest mb-6"
            style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
          >
            Parts
          </p>

          <div style={{ border: "1px solid #252525", background: "#000" }}>
            {/* Face Bolt is shared with Energy Ring identity in MFB; we surface the same name. */}
            <PartRow
              step="01"
              name="Face Bolt"
              value={bey.energyRing.replace(/\s+I+$/, "")}
              note={PART_NOTES["Face Bolt"]}
              accent={accent}
            />
            <PartRow
              step="02"
              name="Energy Ring"
              value={bey.energyRing}
              note={PART_NOTES["Energy Ring"]}
              accent={accent}
            />
            <PartRow
              step="03"
              name="Fusion Wheel"
              value={bey.fusionWheel}
              note={PART_NOTES["Fusion Wheel"]}
              accent={accent}
            />
            <PartRow
              step="04"
              name="Spin Track"
              value={bey.spinTrack}
              note={PART_NOTES["Spin Track"]}
              accent={accent}
            />
            <div style={{ borderBottom: "none" }}>
              <PartRow
                step="05"
                name="Performance Tip"
                value={bey.performanceTip}
                note={PART_NOTES["Performance Tip"]}
                accent={accent}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Metadata ── */}
      <section className="border-b" style={{ borderColor: "#252525" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p
            className="text-label-12 uppercase tracking-widest mb-6"
            style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
          >
            At a glance
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetaPill label="Owner" value={bey.owner} />
            <MetaPill label="Weight" value={bey.weight} />
            <MetaPill label="Code" value={bey.code} />
            <MetaPill label="Debut" value={bey.debut} />
          </div>
        </div>
      </section>

      {/* ── Related ── */}
      {related.length > 0 && (
        <section style={{ background: "#0A0A0A" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <p
              className="text-label-12 uppercase tracking-widest mb-6"
              style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
            >
              Related
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => {
                const reason =
                  r.fusionWheel === bey.fusionWheel
                    ? `Same Fusion Wheel · ${r.fusionWheel}`
                    : r.energyRing === bey.energyRing
                    ? `Same Energy Ring · ${r.energyRing}`
                    : `Same Owner · ${r.owner}`;
                return (
                  <Link key={r.id} href={`/bey/${r.id}`}>
                    <CardWithCornerShine padding="md">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span
                            className="text-[10px] uppercase tracking-wider truncate"
                            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                          >
                            {reason}
                          </span>
                          <h3 className="text-heading-16 truncate" style={{ color: "#EFEFEF" }}>
                            {r.name}
                          </h3>
                          <span
                            className="text-[11px]"
                            style={{
                              color: TYPE_COLORS[r.type].fg,
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            {r.combo}
                          </span>
                        </div>
                        <TypeChip type={r.type} />
                      </div>
                    </CardWithCornerShine>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Mark all dynamic routes as static — no fallback.
export const dynamicParams = false;
