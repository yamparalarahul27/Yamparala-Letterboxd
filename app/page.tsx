import Link from "next/link";
import {
  Disc,
  Film,
  BookOpen,
  Music,
  Gamepad2,
  Tv,
  ArrowUpRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import CardWithCornerShine from "@/components/ui/CardWithCornerShine";
import { BEYBLADES, CHARACTERS, PARTS } from "@/data/beyblades";
import { WATCHLIST } from "@/data/watchlist";

type CollectionStatus = "live" | "coming-soon";

type Collection = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  status: CollectionStatus;
  count?: number;
  countLabel?: string;
};

const COLLECTIONS: Collection[] = [
  {
    id: "beyblades",
    title: "Beyblades",
    tagline: "Metal Fight tops, parts, and bladers.",
    description:
      "The full Metal Fusion / Masters / Fury roster — components, types, stats, and the bladers who wield them.",
    href: "/beyblades",
    icon: Disc,
    accent: "#FF4752",
    status: "live",
    count: BEYBLADES.length + CHARACTERS.length + PARTS.length,
    countLabel: "items",
  },
  {
    id: "watchlist",
    title: "Watchlist",
    tagline: "Anime, movies, and series tracked.",
    description:
      "From the shōnen classics to late-night rewatches — everything watched, watching, or planned, in one tracker.",
    href: "/watchlist",
    icon: Tv,
    accent: "#F472B6",
    status: "live",
    count: WATCHLIST.length,
    countLabel: "titles",
  },
  {
    id: "books",
    title: "Books",
    tagline: "Stories worth re-reading.",
    description: "Fiction, non-fiction, and the occasional manga shelf — annotated and dog-eared.",
    href: "#",
    icon: BookOpen,
    accent: "#4ADE80",
    status: "coming-soon",
  },
  {
    id: "music",
    title: "Music",
    tagline: "Albums on heavy rotation.",
    description: "The records that shaped the playlists, sorted by mood, era, and weather.",
    href: "#",
    icon: Music,
    accent: "#A78BFA",
    status: "coming-soon",
  },
  {
    id: "games",
    title: "Games",
    tagline: "Worlds I keep returning to.",
    description: "Single-player runs, co-op nights, and the comfort games that never quite leave the SSD.",
    href: "#",
    icon: Gamepad2,
    accent: "#40A2FF",
    status: "coming-soon",
  },
  {
    id: "films",
    title: "Films",
    tagline: "Movies that left a mark.",
    description: "From late-night rewatches to first-time gut-punches — a list-of-lists in progress.",
    href: "#",
    icon: Film,
    accent: "#FFC857",
    status: "coming-soon",
  },
];

export default function HomePage() {
  const liveCount = COLLECTIONS.filter((c) => c.status === "live").length;
  const totalItems = COLLECTIONS.reduce((sum, c) => sum + (c.count ?? 0), 0);

  const heroStats = [
    { label: "Collections live", value: liveCount.toString() },
    { label: "Items cataloged", value: totalItems.toString() },
    { label: "More on the way", value: (COLLECTIONS.length - liveCount).toString() },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#EFEFEF" }}>
      {/* ── Hero ── */}
      <section className="relative border-b" style={{ borderColor: "#252525" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,71,82,0.10) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold tracking-widest uppercase mb-6"
            style={{
              background: "rgba(255,71,82,0.12)",
              color: "#FF4752",
              borderRadius: "6px",
              border: "1px solid rgba(255,71,82,0.30)",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            <Sparkles size={12} />
            Personal Catalog
          </span>

          <h1 className="text-heading-64 sm:text-heading-72 mb-6" style={{ color: "#EFEFEF" }}>
            Yamparala <span style={{ color: "#FF4752" }}>Favourites.</span>
          </h1>

          <p
            className="text-label-16 max-w-2xl mx-auto mb-10"
            style={{
              color: "#666666",
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "1.7",
            }}
          >
            A living catalog of the things I love — laid out, archived, and explorable.
            Started with <span style={{ color: "#CACACA" }}>Beyblades</span>. More
            collections on the way.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#collections"
              className="px-6 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                background: "#FF4752",
                color: "#fff",
                borderRadius: "0px",
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              Browse Collections
            </a>
            <a
              href="#about"
              className="px-6 py-2.5 text-sm font-medium transition-all duration-150"
              style={{
                background: "transparent",
                color: "#CACACA",
                borderRadius: "0px",
                border: "1px solid #252525",
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              About this catalog
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b" style={{ borderColor: "#252525" }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-3 divide-x"
          style={
            {
              borderColor: "#252525",
              "--tw-divide-color": "#252525",
            } as React.CSSProperties
          }
        >
          {heroStats.map((stat) => (
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

      {/* ── Collections Hub ── */}
      <section id="collections" className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p
            className="text-label-12 uppercase tracking-widest mb-2"
            style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
          >
            Collections
          </p>
          <h2 className="text-heading-32" style={{ color: "#EFEFEF" }}>
            Pick a shelf. <span style={{ color: "#666666" }}>More open over time.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLLECTIONS.map((collection) => {
            const Icon = collection.icon;
            const isLive = collection.status === "live";
            const Wrapper = ({ children }: { children: React.ReactNode }) =>
              isLive ? (
                <Link href={collection.href} className="block group">
                  {children}
                </Link>
              ) : (
                <div className="block" aria-disabled>
                  {children}
                </div>
              );

            return (
              <Wrapper key={collection.id}>
                <CardWithCornerShine padding="lg">
                  <div
                    className="flex flex-col gap-4 h-full"
                    style={{ opacity: isLive ? 1 : 0.55 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="inline-flex items-center justify-center w-11 h-11"
                        style={{
                          background: `${collection.accent}1F`,
                          border: `1px solid ${collection.accent}55`,
                          color: collection.accent,
                          borderRadius: "8px",
                        }}
                      >
                        <Icon size={20} />
                      </span>

                      <span
                        className="text-[10px] uppercase tracking-widest px-2 py-1"
                        style={{
                          color: isLive ? collection.accent : "#666",
                          border: `1px solid ${isLive ? `${collection.accent}55` : "#252525"}`,
                          background: isLive ? `${collection.accent}14` : "transparent",
                          fontFamily: "var(--font-geist-mono)",
                          borderRadius: "4px",
                        }}
                      >
                        {isLive ? "Live" : "Coming soon"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-heading-24" style={{ color: "#EFEFEF" }}>
                        {collection.title}
                      </h3>
                      <p
                        className="text-label-13 mt-1"
                        style={{ color: collection.accent, fontFamily: "var(--font-geist-mono)" }}
                      >
                        {collection.tagline}
                      </p>
                    </div>

                    <p
                      className="text-label-14"
                      style={{
                        color: "#CACACA",
                        fontFamily: "var(--font-geist-sans)",
                        lineHeight: "1.6",
                      }}
                    >
                      {collection.description}
                    </p>

                    <div
                      className="flex items-center justify-between pt-4 mt-auto"
                      style={{ borderTop: "1px solid #252525" }}
                    >
                      <span
                        className="text-label-12-mono"
                        style={{ color: "#666666" }}
                      >
                        {isLive
                          ? `${collection.count} ${collection.countLabel}`
                          : "Catalog opening soon"}
                      </span>
                      {isLive && (
                        <span
                          className="inline-flex items-center gap-1 text-[12px] transition-transform duration-150 group-hover:translate-x-0.5"
                          style={{
                            color: "#EFEFEF",
                            fontFamily: "var(--font-geist-mono)",
                          }}
                        >
                          Enter
                          <ArrowUpRight size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                </CardWithCornerShine>
              </Wrapper>
            );
          })}
        </div>
      </section>

      {/* ── About ── */}
      <section
        id="about"
        className="border-t"
        style={{ borderColor: "#252525", background: "#0A0A0A" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col md:flex-row items-start gap-8">
          <div className="md:w-1/3">
            <p
              className="text-label-12 uppercase tracking-widest mb-3"
              style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
            >
              About
            </p>
            <h3 className="text-heading-32" style={{ color: "#EFEFEF" }}>
              A catalog,<br />not a feed.
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
              <span style={{ color: "#EFEFEF" }}>Yamparala Favourites</span> is a personal,
              long-form catalog — the things that earned a permanent spot, not whatever the
              algorithm served last week. Each shelf is hand-curated, fully cross-linked,
              and built to outlast the next platform shift.
            </p>
            <p
              className="text-label-16"
              style={{
                color: "#666666",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: "1.8",
              }}
            >
              The first shelf is <span style={{ color: "#EFEFEF" }}>Beyblade Metal Fusion</span> —
              every top, blader, and part documented. Films, books, music, games, and anime
              shelves are next. New collections land when they&apos;re actually ready, not before.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
