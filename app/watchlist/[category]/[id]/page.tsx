import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import {
  WATCHLIST,
  WATCH_CATEGORIES,
  watchCategoryLabel,
  getWatchItem,
  type WatchCategory,
  type WatchItem,
  type WatchStatus,
} from "@/data/watchlist";

export function generateStaticParams() {
  return WATCHLIST.map((i) => ({ category: i.category, id: i.id }));
}

export const dynamicParams = false;

function isCategory(value: string): value is WatchCategory {
  return (WATCH_CATEGORIES as string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}): Promise<Metadata> {
  const { category, id } = await params;
  if (!isCategory(category)) return { title: "Not found — Yamparala Favourites" };
  const item = getWatchItem(category, id);
  if (!item) return { title: "Not found — Yamparala Favourites" };
  return {
    title: `${item.title} · Watchlist — Yamparala Favourites`,
    description: item.synopsis || `${watchCategoryLabel(category)} on the watchlist.`,
  };
}

const CATEGORY_ACCENT: Record<WatchCategory, string> = {
  anime: "#FF4752",
  movie: "#4F9DFF",
  series: "#4ADE80",
};

const STATUS_ACCENT: Record<WatchStatus, string> = {
  Watching: "#FF4752",
  Completed: "#4ADE80",
  Planning: "#E5B84B",
  Dropped: "#666666",
};

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

function metaPills(item: WatchItem): { label: string; value: string }[] {
  const pills: { label: string; value: string }[] = [];
  if (item.year) pills.push({ label: "Year", value: String(item.year) });
  if (item.category === "anime") {
    if (item.episodes) pills.push({ label: "Episodes", value: String(item.episodes) });
    if (item.studios.length) pills.push({ label: "Studio", value: item.studios[0] });
  } else if (item.category === "movie") {
    if (item.runtime) pills.push({ label: "Runtime", value: `${item.runtime} min` });
    if (item.director) pills.push({ label: "Director", value: item.director });
  } else if (item.category === "series") {
    if (item.seasons) pills.push({ label: "Seasons", value: String(item.seasons) });
    if (item.episodes) pills.push({ label: "Episodes", value: String(item.episodes) });
  }
  if (item.rating !== null) pills.push({ label: "My rating", value: `${item.rating}/10` });
  return pills;
}

export default async function WatchDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await params;
  if (!isCategory(category)) notFound();
  const item = getWatchItem(category, id);
  if (!item) notFound();

  const accent = CATEGORY_ACCENT[item.category];
  const pills = metaPills(item);

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
            href="/watchlist"
            className="inline-flex items-center gap-1 text-[12px] mb-8 transition-colors duration-150"
            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
          >
            <ChevronLeft size={14} />
            Back to watchlist
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 items-start">
            <div
              className="relative w-full overflow-hidden"
              style={{
                aspectRatio: "2 / 3",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
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
                    {item.title.charAt(0)}
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
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                  style={{
                    background: `${accent}1F`,
                    color: accent,
                    border: `1px solid ${accent}4D`,
                    borderRadius: "6px",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {watchCategoryLabel(item.category)}
                </span>
                <span
                  className="inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: STATUS_ACCENT[item.status],
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {item.status}
                </span>
                {item.favorite && (
                  <span
                    className="inline-block px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                    style={{
                      background: "rgba(229,184,75,0.12)",
                      color: "#E5B84B",
                      border: "1px solid rgba(229,184,75,0.30)",
                      borderRadius: "6px",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  >
                    Favorite
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-heading-48" style={{ color: "#EFEFEF" }}>
                  {item.title}
                </h1>
                {item.titleEnglish && item.titleEnglish !== item.title && (
                  <p
                    className="text-label-16 mt-2"
                    style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
                  >
                    {item.titleEnglish}
                  </p>
                )}
              </div>

              {item.synopsis && (
                <p
                  className="text-label-16"
                  style={{
                    color: "#CACACA",
                    fontFamily: "var(--font-geist-sans)",
                    lineHeight: "1.7",
                  }}
                >
                  {item.synopsis}
                </p>
              )}

              {item.genres.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {item.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 text-[11px]"
                      style={{
                        border: "1px solid #252525",
                        color: "#CACACA",
                        fontFamily: "var(--font-geist-mono)",
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Meta pills */}
      {pills.length > 0 && (
        <section className="border-b" style={{ borderColor: "#252525" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <p
              className="text-label-12 uppercase tracking-widest mb-6"
              style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
            >
              At a glance
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {pills.map((p) => (
                <MetaPill key={p.label} label={p.label} value={p.value} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Notes */}
      {item.notes && (
        <section style={{ background: "#0A0A0A" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <p
              className="text-label-12 uppercase tracking-widest mb-4"
              style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
            >
              Notes
            </p>
            <p
              className="text-label-16"
              style={{
                color: "#CACACA",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
              }}
            >
              {item.notes}
            </p>
          </div>
        </section>
      )}

      {/* Source link */}
      {item.source && (
        <section className="border-t" style={{ borderColor: "#252525" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px]"
              style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
            >
              Source ↗
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
