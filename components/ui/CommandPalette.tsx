"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";
import {
  BEYBLADES,
  CHARACTERS,
  PARTS,
  partTypeLabel,
  type PartType,
} from "@/data/beyblades";
import { TYPE_COLORS } from "@/data/design-tokens";

type EntryType = "bey" | "blader" | "part";

interface Entry {
  type: EntryType;
  id: string;
  name: string;
  subtitle: string;
  href: string;
  accent: string;
  haystack: string;
}

const PART_ACCENT: Record<PartType, string> = {
  tip: "#FF4752",
  wheel: "#4F9DFF",
  ring: "#4ADE80",
  track: "#E5B84B",
};

function buildIndex(): Entry[] {
  const out: Entry[] = [];
  for (const b of BEYBLADES) {
    out.push({
      type: "bey",
      id: b.id,
      name: b.name,
      subtitle: `${b.type} · ${b.series} · ${b.owner}`,
      href: `/bey/${b.id}`,
      accent: TYPE_COLORS[b.type].fg,
      haystack: `${b.name} ${b.combo} ${b.owner} ${b.series}`.toLowerCase(),
    });
  }
  for (const c of CHARACTERS) {
    out.push({
      type: "blader",
      id: c.id,
      name: c.name,
      subtitle: c.team ? `${c.role} · ${c.team}` : c.role,
      href: `/blader/${c.id}`,
      accent: "#CACACA",
      haystack: `${c.name} ${c.team ?? ""} ${c.role}`.toLowerCase(),
    });
  }
  for (const p of PARTS) {
    out.push({
      type: "part",
      id: p.id,
      name: p.fullName ?? p.name,
      subtitle: `${partTypeLabel(p.type)} · ${p.name}`,
      href: `/part/${p.type}/${p.id}`,
      accent: PART_ACCENT[p.type],
      haystack: `${p.name} ${p.fullName ?? ""}`.toLowerCase(),
    });
  }
  return out;
}

function score(entry: Entry, q: string): number {
  if (!q) return 0;
  const name = entry.name.toLowerCase();
  if (name === q) return 1000;
  if (name.startsWith(q)) return 500;
  if (name.includes(q)) return 200;
  if (entry.haystack.includes(q)) return 50;
  // Per-word fallback (multi-word query each must match somewhere).
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => entry.haystack.includes(t))) {
    return 25;
  }
  return 0;
}

const TYPE_LABEL: Record<EntryType, string> = {
  bey: "Beyblades",
  blader: "Bladers",
  part: "Parts",
};
const TYPE_ORDER: EntryType[] = ["bey", "blader", "part"];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const index = useMemo(() => buildIndex(), []);

  // Open via ⌘K / Ctrl+K and via window event from the navbar button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", onOpenEvent);
    };
  }, []);

  // Reset state on open; lock body scroll while open.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Entry[];
    const scored: { entry: Entry; s: number }[] = [];
    for (const entry of index) {
      const s = score(entry, q);
      if (s > 0) scored.push({ entry, s });
    }
    scored.sort((a, b) => b.s - a.s || a.entry.name.localeCompare(b.entry.name));
    return scored.slice(0, 30).map((x) => x.entry);
  }, [index, query]);

  // Group results by type, in canonical order.
  const grouped = useMemo(() => {
    const map = new Map<EntryType, Entry[]>();
    for (const t of TYPE_ORDER) map.set(t, []);
    for (const r of results) map.get(r.type)?.push(r);
    return TYPE_ORDER.map((t) => ({ type: t, items: map.get(t) ?? [] })).filter(
      (g) => g.items.length > 0
    );
  }, [results]);

  // Flatten for keyboard navigation in display order.
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Reset active when results change.
  useEffect(() => {
    setActive(0);
  }, [results]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (!flat.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[active];
      if (target) {
        router.push(target.href);
        setOpen(false);
      }
    }
  }

  if (!open) return null;

  let cursor = -1;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={() => setOpen(false)}
      />
      <div
        className="relative w-full max-w-2xl"
        style={{
          background: "#0A0A0A",
          border: "1px solid #252525",
          boxShadow: "0 20px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid #1B1B1B" }}
        >
          <SearchIcon size={16} className="text-[#666]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Beyblades, bladers, parts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
          />
          <button
            onClick={() => setOpen(false)}
            className="text-[#666] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="px-5 py-10 text-center">
              <p
                className="text-[12px]"
                style={{ color: "#666", fontFamily: "var(--font-geist-mono)" }}
              >
                Start typing to search across {BEYBLADES.length} Beyblades,{" "}
                {CHARACTERS.length} bladers, and {PARTS.length} parts.
              </p>
              <p
                className="text-[10px] mt-3 uppercase tracking-widest inline-flex items-center justify-center gap-1.5"
                style={{ color: "#444", fontFamily: "var(--font-geist-mono)" }}
              >
                <ArrowUp size={10} />
                <ArrowDown size={10} />
                <span>navigate</span>
                <span aria-hidden>·</span>
                <CornerDownLeft size={10} />
                <span>open</span>
                <span aria-hidden>·</span>
                <span>esc close</span>
              </p>
            </div>
          ) : flat.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p
                className="text-[12px]"
                style={{ color: "#666", fontFamily: "var(--font-geist-mono)" }}
              >
                No matches for &quot;{query}&quot;.
              </p>
            </div>
          ) : (
            grouped.map((g) => (
              <div key={g.type}>
                <div
                  className="px-5 py-2 text-[10px] uppercase tracking-widest sticky top-0"
                  style={{
                    color: "#666",
                    background: "#0A0A0A",
                    fontFamily: "var(--font-geist-mono)",
                    borderBottom: "1px solid #1B1B1B",
                  }}
                >
                  {TYPE_LABEL[g.type]} · {g.items.length}
                </div>
                {g.items.map((item) => {
                  cursor++;
                  const isActive = cursor === active;
                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onMouseEnter={() => setActive(cursor)}
                      onClick={() => {
                        router.push(item.href);
                        setOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-4 px-5 py-3 text-left transition-colors"
                      style={{
                        background: isActive ? "rgba(255,255,255,0.05)" : "transparent",
                        borderLeft: isActive
                          ? `2px solid ${item.accent}`
                          : "2px solid transparent",
                      }}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span
                          className="text-[14px] truncate"
                          style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="text-[11px] truncate"
                          style={{ color: "#666", fontFamily: "var(--font-geist-mono)" }}
                        >
                          {item.subtitle}
                        </span>
                      </div>
                      <span
                        className="text-[10px] uppercase tracking-wider flex-shrink-0"
                        style={{ color: item.accent, fontFamily: "var(--font-geist-mono)" }}
                      >
                        {item.type === "bey"
                          ? "Bey"
                          : item.type === "blader"
                            ? "Blader"
                            : "Part"}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
