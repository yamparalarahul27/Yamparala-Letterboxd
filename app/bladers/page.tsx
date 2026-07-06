"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CardWithCornerShine from "@/components/ui/CardWithCornerShine";
import {
  CHARACTERS,
  getBeysOwnedBy,
  type CharacterRole,
} from "@/data/beyblades";
import { ROLE_COLORS } from "@/data/design-tokens";

const ROLES: ("All" | CharacterRole)[] = [
  "All",
  "Protagonist",
  "Rival",
  "Antagonist",
  "Supporting",
];

export default function BladersIndexPage() {
  const [role, setRole] = useState<(typeof ROLES)[number]>("All");
  const [team, setTeam] = useState<string | "All">("All");

  // Sorted unique team list, filtered by current role.
  const teams = useMemo(() => {
    const set = new Set<string>();
    for (const c of CHARACTERS) {
      if (role !== "All" && c.role !== role) continue;
      if (c.team) set.add(c.team);
    }
    return ["All", ...Array.from(set).sort()];
  }, [role]);

  // If the stored team isn't valid for the current role, treat it as All.
  const activeTeam = team !== "All" && !teams.includes(team) ? "All" : team;

  const filtered = useMemo(() => {
    return CHARACTERS.filter((c) => {
      if (role !== "All" && c.role !== role) return false;
      if (activeTeam !== "All" && c.team !== activeTeam) return false;
      return true;
    });
  }, [role, activeTeam]);

  // Per-role counts for the chips.
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { All: CHARACTERS.length };
    for (const c of CHARACTERS) {
      counts[c.role] = (counts[c.role] ?? 0) + 1;
    }
    return counts;
  }, []);

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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <p
            className="text-label-12 uppercase tracking-widest mb-3"
            style={{ color: "#FF4752", fontFamily: "var(--font-geist-mono)" }}
          >
            Bladers
          </p>
          <h1 className="text-heading-48 sm:text-heading-64" style={{ color: "#EFEFEF" }}>
            The cast.
          </h1>
          <p
            className="text-label-16 mt-4 max-w-xl"
            style={{
              color: "#666666",
              fontFamily: "var(--font-geist-sans)",
              lineHeight: "1.7",
            }}
          >
            Every named blader across the Metal Fight trilogy — protagonists, rivals,
            antagonists, and the supporting cast that made them fight harder.{" "}
            <span style={{ color: "#CACACA" }}>{CHARACTERS.length} cataloged.</span>
          </p>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-4 mb-8">
          {/* Role filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-widest mr-2"
              style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
            >
              Role
            </span>
            {ROLES.map((r) => {
              const active = role === r;
              const accent =
                r === "All" ? "#FF4752" : ROLE_COLORS[r as CharacterRole];
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className="px-3 py-1 text-[12px] font-medium transition-all duration-150"
                  style={{
                    borderRadius: "6px",
                    border: `1px solid ${active ? accent : "#252525"}`,
                    background: active ? accent : "transparent",
                    color: active ? "#0A0A0A" : "#CACACA",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {r}
                  <span
                    className="ml-1.5 opacity-70"
                    style={{ fontSize: "10px" }}
                  >
                    {roleCounts[r] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Team filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] uppercase tracking-widest mr-2"
              style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
            >
              Team
            </span>
            {teams.map((t) => {
              const active = activeTeam === t;
              return (
                <button
                  key={t}
                  onClick={() => setTeam(t)}
                  className="px-3 py-1 text-[11px] font-medium transition-all duration-150"
                  style={{
                    borderRadius: "6px",
                    border: `1px solid ${active ? "#CACACA" : "#252525"}`,
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    color: active ? "#EFEFEF" : "#666666",
                    fontFamily: "var(--font-geist-mono)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <p
          className="text-label-13 mb-6"
          style={{ color: "#666666", fontFamily: "var(--font-geist-mono)" }}
        >
          {filtered.length} {filtered.length === 1 ? "blader" : "bladers"}
          {role !== "All" && <> · {role}</>}
          {activeTeam !== "All" && <> · {activeTeam}</>}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            className="px-6 py-10 border text-center"
            style={{ borderColor: "#252525", background: "rgba(255,71,82,0.04)" }}
          >
            <p
              className="text-label-14"
              style={{ color: "#CACACA", fontFamily: "var(--font-geist-mono)" }}
            >
              No bladers match this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((c) => {
              const accent = ROLE_COLORS[c.role];
              const beyCount = getBeysOwnedBy(c.id).length;
              return (
                <Link key={c.id} href={`/blader/${c.id}`} className="block group">
                  <CardWithCornerShine padding="md">
                    <div className="flex flex-col gap-3">
                      {/* Avatar */}
                      <div
                        className="relative w-full overflow-hidden"
                        style={{
                          aspectRatio: "1 / 1",
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
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.image}
                            alt={c.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="flex items-center justify-center w-12 h-12"
                              style={{
                                border: `1px solid ${accent}40`,
                                color: accent,
                                fontFamily: "var(--font-geist-mono)",
                                fontSize: "22px",
                                fontWeight: 700,
                                letterSpacing: "-0.04em",
                              }}
                            >
                              {c.name.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Identity */}
                      <div className="flex flex-col gap-1">
                        <h3
                          className="text-heading-16 truncate"
                          style={{ color: "#EFEFEF" }}
                        >
                          {c.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-wider"
                            style={{
                              background: `${accent}1F`,
                              color: accent,
                              border: `1px solid ${accent}4D`,
                              borderRadius: "4px",
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            {c.role}
                          </span>
                          {c.team && (
                            <span
                              className="text-[10px] truncate"
                              style={{
                                color: "#666666",
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {c.team}
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] mt-1"
                          style={{ color: "#444", fontFamily: "var(--font-geist-mono)" }}
                        >
                          {beyCount} {beyCount === 1 ? "Bey" : "Beys"}
                        </span>
                      </div>
                    </div>
                  </CardWithCornerShine>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
