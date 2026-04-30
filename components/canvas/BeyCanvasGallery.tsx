"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, Hand, MapPin, CalendarDays, X, BadgeInfo } from "lucide-react";
import { BEYBLADES, getCharacter } from "@/data/beyblades";

type Transform = { x: number; y: number; scale: number };

type CanvasItem = {
  id: string;
  name: string;
  combo: string;
  owner: string;
  series: string;
  debut: string;
  type: string;
  image: string | null;
  description: string;
  stats: { attack: number; defense: number; stamina: number };
  tags: string[];
};

const CELL_W = 248;
const CELL_H = 156;
const CELL_GAP = 44;
const BASE_SCALE = 1.08;
const SHOW_MINIMAP = false;
const RENDER_BUFFER_PX = 420;

const TYPE_ACCENT: Record<string, string> = {
  Attack: "#FF4752",
  Defense: "#40A2FF",
  Stamina: "#00C076",
  Balance: "#FFC857",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function modulo(value: number, base: number): number {
  return ((value % base) + base) % base;
}

function buildTags(item: CanvasItem): string[] {
  return [...new Set([item.type, item.series, item.owner, ...item.tags].filter(Boolean))];
}

export default function BeyCanvasGallery() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const activePointerIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const suppressClickRef = useRef(false);
  const suppressTimerRef = useRef<number | null>(null);
  const sheetPointerIdRef = useRef<number | null>(null);
  const sheetStartYRef = useRef(0);
  const lastMoveRef = useRef({ x: 0, y: 0, t: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const inertiaRafRef = useRef<number | null>(null);
  const centeredRef = useRef(false);

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: BASE_SCALE });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetDragY, setSheetDragY] = useState(0);

  const cols = viewport.w >= 1360 ? 5 : viewport.w >= 980 ? 4 : viewport.w >= 680 ? 3 : 2;

  const items = useMemo<CanvasItem[]>(
    () =>
      BEYBLADES.map((b) => ({
        id: b.id,
        name: b.name,
        combo: b.combo,
        owner: getCharacter(b.ownerId)?.name ?? b.owner,
        series: b.series,
        debut: b.debut,
        type: b.type,
        image: b.image,
        description: b.description,
        stats: b.stats,
        tags: [b.fusionWheel, b.energyRing, b.performanceTip].filter(Boolean),
      })),
    []
  );

  const stepX = CELL_W + CELL_GAP;
  const stepY = CELL_H + CELL_GAP;
  const patternCols = cols;
  const patternRows = Math.ceil(items.length / patternCols);
  const planeWidth = patternCols * stepX - CELL_GAP;
  const planeHeight = patternRows * stepY - CELL_GAP;

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId]
  );
  const isMobile = viewport.w > 0 && viewport.w < 768;

  const clampPosition = useCallback(
    (x: number, y: number) => {
      return {
        x,
        y,
      };
    },
    []
  );

  const stopInertia = useCallback(() => {
    if (inertiaRafRef.current !== null) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
  }, []);

  const clearSuppressTimer = useCallback(() => {
    if (suppressTimerRef.current !== null) {
      window.clearTimeout(suppressTimerRef.current);
      suppressTimerRef.current = null;
    }
  }, []);

  const startInertia = useCallback(() => {
    stopInertia();

    const tick = () => {
      const decay = 0.92;
      velocityRef.current.x *= decay;
      velocityRef.current.y *= decay;

      const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y);
      if (speed < 0.06) {
        stopInertia();
        return;
      }

      setTransform((prev) => {
        const nextX = prev.x + velocityRef.current.x * 14;
        const nextY = prev.y + velocityRef.current.y * 14;
        const clamped = clampPosition(nextX, nextY);
        return { ...prev, ...clamped };
      });

      inertiaRafRef.current = requestAnimationFrame(tick);
    };

    inertiaRafRef.current = requestAnimationFrame(tick);
  }, [clampPosition, stopInertia]);

  useEffect(() => {
    const updateViewport = () => {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      setViewport({ w: rect.width, h: rect.height });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!viewport.w || !viewport.h) return;

    let rafId: number | null = null;

    if (!centeredRef.current) {
      const centeredX = (viewport.w - planeWidth * BASE_SCALE) / 2;
      const centeredY = (viewport.h - planeHeight * BASE_SCALE) / 2;
      const clamped = clampPosition(centeredX, centeredY);
      rafId = requestAnimationFrame(() => {
        setTransform({ x: clamped.x, y: clamped.y, scale: BASE_SCALE });
      });
      centeredRef.current = true;
      return () => {
        if (rafId !== null) cancelAnimationFrame(rafId);
      };
    }
  }, [clampPosition, planeHeight, planeWidth, viewport.h, viewport.w]);

  useEffect(() => {
    return () => {
      stopInertia();
      clearSuppressTimer();
    };
  }, [clearSuppressTimer, stopInertia]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      stopInertia();

      setTransform((prev) => {
        const nextX = prev.x - event.deltaX * 0.9;
        const nextY = prev.y - event.deltaY * 0.9;
        const clamped = clampPosition(nextX, nextY);
        return { ...prev, ...clamped };
      });
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [clampPosition, stopInertia]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    stopInertia();

    activePointerIdRef.current = event.pointerId;
    isDraggingRef.current = true;
    didDragRef.current = false;
    velocityRef.current = { x: 0, y: 0 };

    dragStartRef.current = { x: transform.x, y: transform.y };
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    lastMoveRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || activePointerIdRef.current !== event.pointerId) return;

    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;

    if (!didDragRef.current && Math.hypot(dx, dy) > 5) {
      didDragRef.current = true;
    }

    const nextX = dragStartRef.current.x + dx;
    const nextY = dragStartRef.current.y + dy;

    setTransform((prev) => {
      const clamped = clampPosition(nextX, nextY, prev.scale);
      return { ...prev, ...clamped };
    });

    const now = performance.now();
    const dt = Math.max(12, now - lastMoveRef.current.t);
    velocityRef.current = {
      x: (event.clientX - lastMoveRef.current.x) / dt,
      y: (event.clientY - lastMoveRef.current.y) / dt,
    };
    lastMoveRef.current = { x: event.clientX, y: event.clientY, t: now };
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;

    // Clicking a card should still open details even though the viewport owns drag events.
    if (!didDragRef.current) {
      // Pointer capture can retarget events to the viewport itself, so resolve the element
      // currently under the cursor first.
      const hitEl = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
      const target = (hitEl ?? (event.target as HTMLElement)) as HTMLElement;
      const itemId = target.closest<HTMLButtonElement>("[data-bey-id]")?.dataset.beyId;
      if (itemId) setSelectedId(itemId);
      else setSelectedId(null);
    }

    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (didDragRef.current) {
      suppressClickRef.current = true;
      clearSuppressTimer();
      suppressTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 180);
      startInertia();
    }
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) return;
    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    stopInertia();
  };

  const onSelectItem = (id: string) => {
    if (didDragRef.current || suppressClickRef.current) return;
    setSheetDragY(0);
    setSelectedId(id);
  };

  const closeInfoPanel = useCallback(() => {
    setSheetDragY(0);
    setSelectedId(null);
  }, []);

  const onSheetPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobile || !selectedItem || event.button !== 0) return;
    sheetPointerIdRef.current = event.pointerId;
    sheetStartYRef.current = event.clientY;
    setSheetDragY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onSheetPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobile || sheetPointerIdRef.current !== event.pointerId) return;
    const delta = event.clientY - sheetStartYRef.current;
    setSheetDragY(clamp(delta, 0, 260));
  };

  const onSheetPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobile || sheetPointerIdRef.current !== event.pointerId) return;
    sheetPointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (sheetDragY > 96) {
      closeInfoPanel();
      return;
    }
    setSheetDragY(0);
  };

  const onSheetPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMobile || sheetPointerIdRef.current !== event.pointerId) return;
    sheetPointerIdRef.current = null;
    setSheetDragY(0);
  };

  const visibleCells = useMemo(() => {
    if (!viewport.w || !viewport.h || items.length === 0) return [];

    const scale = transform.scale;
    const worldLeft = -transform.x / scale;
    const worldTop = -transform.y / scale;
    const worldRight = (viewport.w - transform.x) / scale;
    const worldBottom = (viewport.h - transform.y) / scale;

    const startCol = Math.floor((worldLeft - RENDER_BUFFER_PX) / stepX);
    const endCol = Math.ceil((worldRight + RENDER_BUFFER_PX) / stepX);
    const startRow = Math.floor((worldTop - RENDER_BUFFER_PX) / stepY);
    const endRow = Math.ceil((worldBottom + RENDER_BUFFER_PX) / stepY);

    const cells: Array<{
      key: string;
      left: number;
      top: number;
      item: CanvasItem;
    }> = [];

    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        const sequenceIndex = modulo(row * patternCols + col, items.length);
        const item = items[sequenceIndex];

        cells.push({
          key: `${row}:${col}`,
          left: col * stepX,
          top: row * stepY,
          item,
        });
      }
    }

    return cells;
  }, [items, patternCols, stepX, stepY, transform.scale, transform.x, transform.y, viewport.h, viewport.w]);

  const minimap = useMemo(() => {
    if (!viewport.w || !viewport.h) {
      return { planeW: 0, planeH: 0, viewW: 0, viewH: 0, viewX: 0, viewY: 0 };
    }

    const planeW = 188;
    const planeH = Math.max(120, (planeW * planeHeight) / Math.max(1, planeWidth));
    const ratioX = planeW / planeWidth;
    const ratioY = planeH / planeHeight;

    const worldVisibleW = viewport.w / transform.scale;
    const worldVisibleH = viewport.h / transform.scale;
    const worldLeft = -transform.x / transform.scale;
    const worldTop = -transform.y / transform.scale;

    const viewW = clamp(worldVisibleW * ratioX, 18, planeW);
    const viewH = clamp(worldVisibleH * ratioY, 18, planeH);
    const viewX = clamp(worldLeft * ratioX, 0, Math.max(0, planeW - viewW));
    const viewY = clamp(worldTop * ratioY, 0, Math.max(0, planeH - viewH));

    return { planeW, planeH, viewW, viewH, viewX, viewY };
  }, [planeHeight, planeWidth, transform.scale, transform.x, transform.y, viewport.h, viewport.w]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        height: "calc(100vh - 64px)",
        background:
          "radial-gradient(circle at 18% 18%, rgba(255,71,82,0.16), transparent 38%), radial-gradient(circle at 84% 85%, rgba(64,162,255,0.10), transparent 44%), #050505",
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#2A2A2A] bg-black/60 px-3 py-2 text-xs text-[#CACACA] hover:text-white"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          <ChevronLeft size={14} />
          Back
        </Link>
        <span
          className="inline-flex items-center gap-2 rounded-md border border-[#2A2A2A] bg-black/60 px-3 py-2 text-xs text-[#CACACA]"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          <BadgeInfo size={14} />
          {items.length} beys • infinite loop
          <Hand size={14} />
          drag/pan
        </span>
      </div>

      <div
        ref={viewportRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none", userSelect: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: "1px",
            height: "1px",
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: "0 0",
            willChange: "transform",
            overflow: "visible",
          }}
        >
          {visibleCells.map(({ key, left, top, item }) => {
            const accent = TYPE_ACCENT[item.type] ?? "#FF4752";
            const isSelected = selectedItem?.id === item.id;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectItem(item.id)}
                data-bey-id={item.id}
                className="group absolute overflow-hidden text-left transition-transform duration-200 hover:z-10 hover:scale-[1.045] focus-visible:z-10 focus-visible:scale-[1.045]"
                style={{
                  left,
                  top,
                  width: `${CELL_W}px`,
                  height: `${CELL_H}px`,
                  boxShadow: isSelected
                    ? `0 0 0 2px ${accent} inset, 0 20px 36px rgba(0,0,0,0.42)`
                    : "0 12px 28px rgba(0,0,0,0.32)",
                  background: "#0D0D0D",
                  transformOrigin: "center center",
                }}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 900px) 40vw, 248px"
                    style={{ objectFit: "contain", background: "#090909" }}
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ color: accent }}>
                    <span className="text-num-40" style={{ lineHeight: 1 }}>
                      {item.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div
                  className="absolute inset-x-0 bottom-0 px-3 py-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.88) 76%, rgba(0,0,0,0.95) 100%)",
                  }}
                >
                  <p
                    className="text-[11px] font-medium"
                    style={{ color: "#EFEFEF", fontFamily: "var(--font-geist-mono)" }}
                  >
                    {item.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <aside
        className="absolute bottom-0 left-0 right-0 z-30 h-[78vh] w-full rounded-t-2xl border-t border-[#2A2A2A] bg-black/88 backdrop-blur-xl transition-transform duration-300 md:top-0 md:left-auto md:right-0 md:h-full md:max-w-[360px] md:rounded-none md:border-l md:border-t-0"
        style={{
          transform: selectedItem
            ? isMobile
              ? `translateY(${sheetDragY}px)`
              : "translateX(0)"
            : isMobile
              ? "translateY(calc(100% + 12px))"
              : "translateX(100%)",
        }}
      >
        {selectedItem && (
          <>
            <div
              className="flex h-8 cursor-grab items-center justify-center active:cursor-grabbing md:hidden"
              onPointerDown={onSheetPointerDown}
              onPointerMove={onSheetPointerMove}
              onPointerUp={onSheetPointerUp}
              onPointerCancel={onSheetPointerCancel}
            >
              <div className="h-1.5 w-12 rounded-full bg-[#3A3A3A]" />
            </div>
            <button
              type="button"
              onClick={closeInfoPanel}
              className="absolute right-3 top-3 inline-flex items-center justify-center rounded-md border border-[#2A2A2A] p-1.5 text-xs text-[#CACACA] hover:text-white"
              style={{ fontFamily: "var(--font-geist-mono)" }}
              aria-label="Close details"
            >
              <X size={14} />
            </button>

            <div className="relative h-[230px] border-b border-[#2A2A2A]">
              {selectedItem.image ? (
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  fill
                  sizes="360px"
                  style={{ objectFit: "contain", background: "#090909" }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-num-56 text-[#FF4752]">
                  {selectedItem.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="h-[calc(100%-230px)] overflow-y-auto px-5 py-5">
              <p className="text-label-12-mono uppercase tracking-widest" style={{ color: "#FF4752" }}>
                {selectedItem.type}
              </p>
              <h2 className="mt-2 text-heading-24" style={{ color: "#EFEFEF" }}>
                {selectedItem.name}
              </h2>
              <p className="mt-1 text-label-13" style={{ color: "#CACACA" }}>
                {selectedItem.combo}
              </p>
              <p className="mt-4 text-label-14" style={{ color: "#666666", lineHeight: 1.65 }}>
                {selectedItem.description}
              </p>

              <div className="mt-5 space-y-2 text-label-13" style={{ color: "#CACACA" }}>
                <p className="flex items-center gap-2">
                  <MapPin size={14} />
                  {selectedItem.owner}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  {selectedItem.series} • debut {selectedItem.debut}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {([
                  ["ATK", selectedItem.stats.attack],
                  ["DEF", selectedItem.stats.defense],
                  ["STA", selectedItem.stats.stamina],
                ] as const).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[#252525] bg-[#111111] px-2 py-2 text-center"
                  >
                    <p className="text-[10px] text-[#666666]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {label}
                    </p>
                    <p className="text-heading-16 text-[#EFEFEF]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {buildTags(selectedItem).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-[#2A2A2A] bg-black/45 px-2 py-1 text-[11px] text-[#CACACA]"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/bey/${selectedItem.id}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md border px-4 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: "#FF4752",
                  color: "#EFEFEF",
                  background: "rgba(255,71,82,0.14)",
                }}
              >
                Open Bey Detail
              </Link>
            </div>
          </>
        )}
      </aside>

      <div className="absolute bottom-4 left-4 z-20 rounded-md border border-[#2A2A2A] bg-black/68 px-3 py-2 text-xs text-[#CACACA]" style={{ fontFamily: "var(--font-geist-mono)" }}>
        Pan with drag or two-finger scroll
      </div>

      {SHOW_MINIMAP && (
        <div className="absolute bottom-4 right-4 z-20 rounded-md border border-[#2A2A2A] bg-black/72 p-2 backdrop-blur-md">
          <div
            className="relative overflow-hidden rounded-sm border border-[#303030] bg-[#090909]"
            style={{ width: minimap.planeW, height: minimap.planeH }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
            <div
              className="absolute border"
              style={{
                left: minimap.viewX,
                top: minimap.viewY,
                width: minimap.viewW,
                height: minimap.viewH,
                borderColor: "#FF4752",
                boxShadow: "0 0 0 1px rgba(255,71,82,0.35)",
                background: "rgba(255,71,82,0.16)",
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
