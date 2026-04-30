import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import CardWithCornerShine from "@/components/ui/CardWithCornerShine";
import { TypeChip } from "@/components/ui/bey-bits";
import {
  PARTS,
  getPart,
  getBeysUsingPart,
  partTypeLabel,
  type PartType,
} from "@/data/beyblades";
import { TYPE_COLORS } from "@/data/design-tokens";

const TYPE_ACCENT: Record<PartType, string> = {
  tip: "#FF4752",
  wheel: "#4F9DFF",
  ring: "#4ADE80",
  track: "#E5B84B",
};

const VALID_TYPES: PartType[] = ["tip", "wheel", "ring", "track"];

export function generateStaticParams() {
  return PARTS.map((p) => ({ type: p.type, id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}): Promise<Metadata> {
  const { type, id } = await params;
  if (!VALID_TYPES.includes(type as PartType)) {
    return { title: "Not found — Yamparala Favourites" };
  }
  const part = getPart(type as PartType, id);
  if (!part) return { title: "Not found — Yamparala Favourites" };
  return {
    title: `${part.fullName ?? part.name} · Beyblades — Yamparala Favourites`,
    description: part.info,
  };
}

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  if (!VALID_TYPES.includes(type as PartType)) notFound();
  const partType = type as PartType;
  const part = getPart(partType, id);
  if (!part) notFound();

  const accent = TYPE_ACCENT[partType];
  const beys = getBeysUsingPart(partType, part.name);

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#EFEFEF" }}>
      {/* Hero */}
      <section className="relative border-b" style={{ borderColor: "#252525" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${accent}1A 0%, transparent 70%)`,
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
            {/* Image / placeholder */}
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
              {part.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={part.image}
                  alt={part.name}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ padding: "20px" }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div
                    className="flex items-center justify-center w-20 h-20"
                    style={{
                      border: `1px solid ${accent}40`,
                      color: accent,
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: part.name.length > 4 ? "20px" : "32px",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      padding: "0 8px",
                      textAlign: "center",
                    }}
                  >
                    {part.name}
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

            <div className="flex flex-col gap-5">
              <span
                className="inline-block self-start px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                style={{
                  background: `${accent}1F`,
                  color: accent,
                  border: `1px solid ${accent}4D`,
                  borderRadius: "6px",
                  fontFamily: "var(--font-geist-mono)",
                }}
              >
                {partTypeLabel(partType)}
              </span>

              <div>
                <h1 className="text-heading-48" style={{ color: "#EFEFEF" }}>
                  {part.name}
                </h1>
                {part.fullName && part.fullName !== part.name && (
                  <p
                    className="text-label-16 mt-2"
                    style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
                  >
                    {part.fullName}
                  </p>
                )}
              </div>

              <p
                className="text-label-16"
                style={{
                  color: "#CACACA",
                  fontFamily: "var(--font-geist-sans)",
                  lineHeight: "1.7",
                }}
              >
                {part.info}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beys using this part */}
      <section style={{ background: "#0A0A0A" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <p
            className="text-label-12 uppercase tracking-widest mb-6"
            style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
          >
            Beys using this {partTypeLabel(partType).toLowerCase()}
          </p>

          {beys.length === 0 ? (
            <p
              className="text-label-14"
              style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
            >
              No catalogued Beys use this part yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {beys.map((b) => {
                const beyAccent = TYPE_COLORS[b.type].fg;
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
                            style={{ color: beyAccent, fontFamily: "var(--font-geist-mono)" }}
                          >
                            {b.combo}
                          </span>
                        </div>
                        <TypeChip type={b.type} />
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
