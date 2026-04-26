import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import CardWithCornerShine from "@/components/ui/CardWithCornerShine";
import {
  CHARACTERS,
  getBeysOwnedBy,
  type BeybladeType,
} from "@/data/beyblades";
import { ROLE_COLORS } from "@/data/design-tokens";

// ──────────────────────────────────────────────────────────────────────
// Static params — pre-render every blader page at build time
// ──────────────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return CHARACTERS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = CHARACTERS.find((x) => x.id === id);
  if (!c) return { title: "Not found — Beyblade Metal Fusion" };
  return {
    title: `${c.name} — Beyblade Metal Fusion`,
    description: c.bio,
  };
}

const TYPE_COLORS: Record<BeybladeType, string> = {
  Attack: "#FF4752",
  Defense: "#4F9DFF",
  Stamina: "#4ADE80",
  Balance: "#E5B84B",
};

function Pill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
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
        style={{ color: color ?? "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default async function BladerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const character = CHARACTERS.find((c) => c.id === id);
  if (!character) notFound();

  const beys = getBeysOwnedBy(character.id);
  const roleColor = ROLE_COLORS[character.role];

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#EFEFEF" }}>
      {/* ── Hero ── */}
      <section className="relative border-b" style={{ borderColor: "#252525" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${roleColor}1A 0%, transparent 70%)`,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16">
          <Link
            href="/#collection"
            className="inline-flex items-center gap-1 text-[12px] mb-8 transition-colors duration-150"
            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
          >
            <ChevronLeft size={14} />
            Back to collection
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-start">
            {/* Avatar */}
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
                  background: `radial-gradient(circle at 50% 60%, ${roleColor}26 0%, transparent 60%)`,
                }}
              />
              {character.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={character.image}
                  alt={character.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div
                    className="flex items-center justify-center w-20 h-20"
                    style={{
                      border: `1px solid ${roleColor}40`,
                      color: roleColor,
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "44px",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {character.name.charAt(0)}
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
                <span
                  className="inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                  style={{
                    background: `${roleColor}1F`,
                    color: roleColor,
                    border: `1px solid ${roleColor}4D`,
                    borderRadius: "6px",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {character.role}
                </span>
                {character.team && (
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
                    {character.team}
                  </span>
                )}
              </div>

              <h1 className="text-heading-48" style={{ color: "#EFEFEF" }}>
                {character.name}
              </h1>

              <p
                className="text-label-16"
                style={{
                  color: "#CACACA",
                  fontFamily: "var(--font-geist-sans)",
                  lineHeight: "1.7",
                }}
              >
                {character.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pills ── */}
      <section className="border-b" style={{ borderColor: "#252525" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Pill label="Role" value={character.role} color={roleColor} />
            <Pill label="Team" value={character.team ?? "—"} />
            <Pill label="Beyblades" value={beys.length.toString()} />
          </div>
        </div>
      </section>

      {/* ── Beyblades owned ── */}
      <section style={{ background: "#0A0A0A" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p
            className="text-label-12 uppercase tracking-widest mb-6"
            style={{ color: roleColor, fontFamily: "var(--font-geist-mono)" }}
          >
            Beyblades
          </p>

          {beys.length === 0 ? (
            <p
              className="text-label-14"
              style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
            >
              No Beyblades catalogued for this blader yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {beys.map((b) => {
                const accent = TYPE_COLORS[b.type];
                return (
                  <Link key={b.id} href={`/bey/${b.id}`}>
                    <CardWithCornerShine padding="md">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                          <span
                            className="text-[10px] uppercase tracking-wider"
                            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
                          >
                            {b.series} · {b.code}
                          </span>
                          <h3 className="text-heading-16 truncate" style={{ color: "#EFEFEF" }}>
                            {b.name}
                          </h3>
                          <span
                            className="text-[11px]"
                            style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
                          >
                            {b.combo}
                          </span>
                        </div>
                        <span
                          className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider flex-shrink-0"
                          style={{
                            background: `${accent}1F`,
                            color: accent,
                            border: `1px solid ${accent}4D`,
                            borderRadius: "6px",
                            fontFamily: "var(--font-geist-mono)",
                          }}
                        >
                          {b.type}
                        </span>
                      </div>
                    </CardWithCornerShine>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export const dynamicParams = false;
