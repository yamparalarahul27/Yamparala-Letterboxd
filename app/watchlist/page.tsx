"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CardWithCornerShine from "@/components/ui/CardWithCornerShine";
import {
  WATCHLIST,
  WATCH_CATEGORIES,
  watchCategoryLabel,
  type WatchCategory,
  type WatchStatus,
  type WatchItem,
} from "@/data/watchlist";

const CATEGORY_FILTERS: ("All" | WatchCategory)[] = ["All", ...WATCH_CATEGORIES];
const STATUS_FILTERS: ("All" | WatchStatus)[] = [
  "All",
  "Watching",
  "Completed",
  "Planning",
  "Dropped",
];

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

function PosterFallback({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
      <div
        className="flex items-center justify-center w-20 h-20"
        style={{
          border: `1px solid ${accent}40`,
          color: accent,
          fontFamily: "var(--font-geist-mono)",
          fontSize: "44px",
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        {title.charAt(0)}
      </div>
      <span
        className="text-[9px] uppercase tracking-widest"
        style={{ color: "#444", fontFamily: "var(--font-geist-mono)" }}
      >
        image pending
      </span>
    </div>
  );
}

function metaLine(item: WatchItem): string {
  const bits: string[] = [];
  if (item.year) bits.push(String(item.year));
  if (item.category === "anime" && item.episodes) {
    bits.push(`${item.episodes} ep`);
  } else if (item.category === "movie" && item.runtime) {
    bits.push(`${item.runtime} min`);
  } else if (item.category === "series") {
    if (item.seasons) bits.push(`${item.seasons} season${item.seasons === 1 ? "" : "s"}`);
    if (item.episodes) bits.push(`${item.episodes} ep`);
  }
  return bits.join(" · ");
}

export default function WatchlistPage() {
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");

  const filtered = useMemo(
    () =>
      WATCHLIST.filter((item) => {
        if (category !== "All" && item.category !== category) return false;
        if (status !== "All" && item.status !== status) return false;
        return true;
      }),
    [category, status]
  );

  const totals = useMemo(() => {
    const out: Record<WatchCategory, number> = { anime: 0, movie: 0, series: 0 };
    WATCHLIST.forEach((i) => {
      out[i.category] += 1;
    });
    return out;
  }, []);

  const stats = [
    { label: "Total entries", value: WATCHLIST.length.toString() },
    { label: "Anime", value: totals.anime.toString() },
    { label: "Movies", value: totals.movie.toString() },
    { label: "Series", value: totals.series.toString() },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#EFEFEF" }}>
      {/* Hero */}
      <section className="relative border-b" style={{ borderColor: "#252525" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,71,82,0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mb-6 text-[11px] uppercase tracking-widest"
            style={{ color: "#666", fontFamily: "var(--font-geist-mono)" }}
          >
            <ChevronLeft size={12} />
            All collections
          </Link>

          <span
            className="block mx-auto w-fit px-3 py-1 text-[11px] font-bold tracking-widest uppercase mb-6"
            style={{
              background: "rgba(255,71,82,0.12)",
              color: "#FF4752",
              borderRadius: "6px",
              border: "1px solid rgba(255,71,82,0.30)",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            Personal · Watchlist
          </span>

          <h1 className="text-heading-64 sm:text-heading-72 mb-6" style={{ color: "#EFEFEF" }}>
            What I&apos;ve <span style={{ color: "#FF4752" }}>watched.</span>
          </h1>

          <p
            className="text-label-16 max-w-xl mx-auto"
            style={{
              color: "#666666",
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "1.7",
            }}
          >
            A running log across <span style={{ color: "#CACACA" }}>Anime</span>,{" "}
            <span style={{ color: "#CACACA" }}>Movies</span>, and{" "}
            <span style={{ color: "#CACACA" }}>Series</span> — with status, ratings, and notes.
          </p>
        </div>
      </section>

      {/* Stats */}
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

      {/* Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <p
              className="text-label-12 uppercase tracking-widest mb-2"
              style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
            >
              The list
            </p>
            <h2 className="text-heading-32" style={{ color: "#EFEFEF" }}>
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </h2>
            <p
              className="text-label-13 mt-1"
              style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
            >
              {category !== "All" && <>{watchCategoryLabel(category as WatchCategory)} · </>}
              {status !== "All" && <>{status}</>}
              {category === "All" && status === "All" && <>All categories · all statuses</>}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-start sm:items-end">
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORY_FILTERS.map((c) => {
                const active = category === c;
                const accent = c === "All" ? "#FF4752" : CATEGORY_ACCENT[c as WatchCategory];
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="px-3 py-1 text-[12px] font-medium transition-all duration-150"
                    style={{
                      borderRadius: "6px",
                      border: `1px solid ${active ? accent : "#252525"}`,
                      background: active ? accent : "transparent",
                      color: active ? "#0A0A0A" : "#CACACA",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  >
                    {c === "All" ? "All" : watchCategoryLabel(c as WatchCategory)}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] uppercase tracking-widest mr-1"
                style={{ color: "#444", fontFamily: "var(--font-geist-mono)" }}
              >
                Status
              </span>
              {STATUS_FILTERS.map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="px-3 py-1 text-[11px] font-medium transition-all duration-150"
                    style={{
                      borderRadius: "6px",
                      border: `1px solid ${active ? "#CACACA" : "#252525"}`,
                      background: active ? "#CACACA" : "transparent",
                      color: active ? "#0A0A0A" : "#666666",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const accent = CATEGORY_ACCENT[item.category];
            return (
              <Link
                key={`${item.category}-${item.id}`}
                href={`/watchlist/${item.category}/${item.id}`}
                className="block group"
              >
                <CardWithCornerShine padding="md">
                  <div className="flex flex-col gap-4 h-full cursor-pointer">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
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
                        className="text-[10px] uppercase tracking-wider"
                        style={{
                          color: STATUS_ACCENT[item.status],
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

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
                        <PosterFallback title={item.title} accent={accent} />
                      )}
                    </div>

                    <div>
                      <h3 className="text-heading-16" style={{ color: "#EFEFEF" }}>
                        {item.title}
                      </h3>
                      {metaLine(item) && (
                        <p
                          className="text-label-12-mono mt-1"
                          style={{ color: "#666666" }}
                        >
                          {metaLine(item)}
                        </p>
                      )}
                    </div>

                    {item.rating !== null && (
                      <div
                        className="flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid #252525" }}
                      >
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: "#666", fontFamily: "var(--font-geist-mono)" }}
                        >
                          My rating
                        </span>
                        <span
                          className="text-label-13 tabular-nums"
                          style={{ color: accent, fontFamily: "var(--font-geist-mono)" }}
                        >
                          {item.rating}/10
                        </span>
                      </div>
                    )}
                  </div>
                </CardWithCornerShine>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div
            className="mt-8 px-6 py-10 border text-center"
            style={{ borderColor: "#252525", background: "rgba(255,71,82,0.04)" }}
          >
            <p
              className="text-label-14"
              style={{ color: "#CACACA", fontFamily: "var(--font-geist-mono)" }}
            >
              Nothing here for this filter — yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
