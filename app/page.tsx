"use client";

import CardWithCornerShine from "@/components/ui/CardWithCornerShine";

// Placeholder stat data
const stats = [
  { label: "Markets Open", value: "—", unit: "" },
  { label: "Total Volume", value: "—", unit: "USD" },
  { label: "Active Traders", value: "—", unit: "" },
  { label: "Resolved Today", value: "—", unit: "" },
];

// Placeholder markets
const placeholderMarkets = [
  {
    id: 1,
    question: "Will Bitcoin hit $100,000 by end of 2025?",
    tags: ["Crypto", "Trending"],
    price: "—",
    volume: "—",
    expiry: "Dec 31, 2025",
  },
  {
    id: 2,
    question: "Will India win the 2025 ICC World Cup?",
    tags: ["Sports"],
    price: "—",
    volume: "—",
    expiry: "Nov 15, 2025",
  },
  {
    id: 3,
    question: "Will GPT-5 be released before June 2025?",
    tags: ["Tech", "AI"],
    price: "—",
    volume: "—",
    expiry: "Jun 1, 2025",
  },
  {
    id: 4,
    question: "Will Ethereum ETF get US SEC approval in 2025?",
    tags: ["Crypto", "Finance"],
    price: "—",
    volume: "—",
    expiry: "Dec 31, 2025",
  },
];

// Small color-coded tag chip
function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 text-[11px] font-medium"
      style={{
        background: "rgba(255,71,82,0.12)",
        color: "#FF4752",
        borderRadius: "6px",
        fontFamily: "var(--font-geist-mono)",
        border: "1px solid rgba(255,71,82,0.25)",
      }}
    >
      {label}
    </span>
  );
}

export default function HomePage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#000", color: "#EFEFEF" }}
    >
      {/* ── Hero Section ── */}
      <section className="relative border-b" style={{ borderColor: "#252525" }}>
        {/* Background radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,71,82,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          {/* Beta badge */}
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
            Experimental · Early Access
          </span>

          {/* Headline */}
          <h1
            className="text-heading-64 sm:text-heading-72 mb-6"
            style={{ color: "#EFEFEF" }}
          >
            Predict.{" "}
            <span style={{ color: "#FF4752" }}>Trade.</span>
            {" "}Win.
          </h1>

          {/* Sub */}
          <p
            className="text-label-16 max-w-xl mx-auto mb-10"
            style={{
              color: "#666666",
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "1.7",
            }}
          >
            YPM is an experimental prediction market platform by{" "}
            <span style={{ color: "#CACACA" }}>Yamparala Rahul</span> — making
            prediction markets simple, interesting, and accessible.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
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
              Explore Markets
            </button>
            <button
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
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="border-b" style={{ borderColor: "#252525" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{ borderColor: "#252525", "--tw-divide-color": "#252525" } as React.CSSProperties}>
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-6 flex flex-col gap-1">
              <span
                className="text-num-40"
                style={{ color: "#EFEFEF" }}
              >
                {stat.value}
                {stat.unit && (
                  <span
                    className="text-label-12-mono ml-1"
                    style={{ color: "#666666" }}
                  >
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

      {/* ── Placeholder Markets Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-heading-20"
              style={{ color: "#EFEFEF" }}
            >
              Trending Markets
              <span
                className="ml-3 text-label-12 uppercase tracking-wider"
                style={{ color: "#666666" }}
              >
                — Placeholder
              </span>
            </h2>
            <p
              className="text-label-13 mt-1"
              style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
            >
              Markets will appear here once the platform is live.
            </p>
          </div>
          {/* Filter chips */}
          <div className="hidden sm:flex items-center gap-2">
            {["All", "Crypto", "Sports", "Tech", "Politics"].map(
              (chip, i) => (
                <button
                  key={chip}
                  className="px-3 py-1 text-[12px] font-medium transition-all duration-150"
                  style={{
                    borderRadius: "6px",
                    border: "1px solid #252525",
                    background: i === 0 ? "#FF4752" : "transparent",
                    color: i === 0 ? "#fff" : "#666666",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {chip}
                </button>
              )
            )}
          </div>
        </div>

        {/* Markets grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {placeholderMarkets.map((market) => (
            <CardWithCornerShine key={market.id} padding="lg">
              <div className="flex flex-col gap-4 h-full">
                {/* Tags */}
                <div className="flex items-center gap-2">
                  {market.tags.map((t) => (
                    <Tag key={t} label={t} />
                  ))}
                </div>
                {/* Question */}
                <p
                  className="text-heading-16 flex-1"
                  style={{ color: "#EFEFEF", lineHeight: "1.5" }}
                >
                  {market.question}
                </p>
                {/* Bottom row */}
                <div
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: "1px solid #252525" }}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-label-12-mono" style={{ color: "#666666" }}>
                        Price
                      </p>
                      <p className="text-num-32 mt-0.5" style={{ color: "#EFEFEF" }}>
                        {market.price}
                      </p>
                    </div>
                    <div>
                      <p className="text-label-12-mono" style={{ color: "#666666" }}>
                        Volume
                      </p>
                      <p
                        className="text-heading-16 mt-0.5"
                        style={{ color: "#CACACA" }}
                      >
                        {market.volume}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-label-12-mono" style={{ color: "#666666" }}>
                      Expires
                    </p>
                    <p
                      className="text-label-12-mono mt-0.5"
                      style={{ color: "#CACACA" }}
                    >
                      {market.expiry}
                    </p>
                  </div>
                </div>
              </div>
            </CardWithCornerShine>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <div
          className="mt-8 px-6 py-5 border text-center"
          style={{
            borderColor: "#252525",
            background: "rgba(255,71,82,0.04)",
          }}
        >
          <p
            className="text-label-14"
            style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
          >
            🚧{" "}
            <span style={{ color: "#CACACA" }}>
              Full market data, live prices, and trading is coming soon.
            </span>{" "}
            This is an early-stage experimental build.
          </p>
        </div>
      </section>

      {/* ── About strip ── */}
      <section
        className="border-t"
        style={{ borderColor: "#252525", background: "#0A0A0A" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col md:flex-row items-start gap-8">
          <div className="md:w-1/3">
            <p
              className="text-label-12 uppercase tracking-widest mb-3"
              style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
            >
              About YPM
            </p>
            <h3 className="text-heading-32" style={{ color: "#EFEFEF" }}>
              Markets, <br />Simplified.
            </h3>
          </div>
          <div className="md:w-2/3">
            <p
              className="text-label-16 mb-4"
              style={{
                color: "#666666",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: "1.8",
              }}
            >
              YPM is an experimental project by{" "}
              <span style={{ color: "#EFEFEF" }}>Yamparala Rahul</span> exploring
              what prediction markets could look like when designed from first
              principles — focused on simplicity, clarity, and interesting market
              structures.
            </p>
            <p
              className="text-label-16"
              style={{
                color: "#666666",
                fontFamily: "var(--font-geist-sans)",
                lineHeight: "1.8",
              }}
            >
              This is an early, rough build. Features, data, and UI are all
              subject to change. The goal is to make prediction markets feel
              natural — not intimidating.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
