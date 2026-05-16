"use client";

import { cn } from "@/lib/utils";
import {
  LocateFixed,
  Minus,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ReconViewerCategory = {
  key: string;
  label: string;
  description: string;
  defaultIconKey: string;
  defaultVisible: boolean;
};

export type ReconViewerMarker = {
  id: string;
  label: string;
  description?: string | null;
  category: string;
  x: number;
  y: number;
  iconKey: string;
  iconPath?: string;
  hiddenByDefault?: boolean;
};

export type ReconCoordinate = {
  x: number;
  y: number;
};

type ReconMapViewerProps = {
  title: string;
  imageSrc?: string | null;
  imageAlt?: string;
  width: number;
  height: number;
  minZoom?: number | null;
  maxZoom?: number | null;
  markers: ReconViewerMarker[];
  categories: ReconViewerCategory[];
  onCoordinateCapture?: (coordinate: ReconCoordinate) => void;
  capturedCoordinate?: ReconCoordinate | null;
  emptyState?: string;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCoordinate(value: number) {
  return value.toFixed(2);
}

export function ReconMapViewer({
  title,
  imageSrc,
  imageAlt,
  width,
  height,
  minZoom = 0.5,
  maxZoom = 3,
  markers,
  categories,
  onCoordinateCapture,
  capturedCoordinate,
  emptyState = "No map asset is available yet.",
  className,
}: ReconMapViewerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    () =>
      new Set(
        categories
          .filter((category) => category.defaultVisible)
          .map((category) => category.key),
      ),
  );

  const resetView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const nextScale = clamp(
      Math.min(rect.width / width, rect.height / height) * 0.96,
      minZoom ?? 0.5,
      maxZoom ?? 3,
    );

    setScale(nextScale);
    setOffset({
      x: (rect.width - width * nextScale) / 2,
      y: (rect.height - height * nextScale) / 2,
    });
  }, [height, maxZoom, minZoom, width]);

  useEffect(() => {
    resetView();
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const observer = new ResizeObserver(resetView);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [resetView]);

  const categoryByKey = useMemo(
    () => new Map(categories.map((category) => [category.key, category])),
    [categories],
  );

  const filteredMarkers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return markers.filter((marker) => {
      const matchesCategory =
        visibleCategories.has(marker.category) && !marker.hiddenByDefault;
      const haystack = [
        marker.label,
        marker.description || "",
        categoryByKey.get(marker.category)?.label || marker.category,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [categoryByKey, markers, query, visibleCategories]);

  const selectedMarker =
    filteredMarkers.find((marker) => marker.id === selectedId) || null;

  function zoomBy(multiplier: number) {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const nextScale = clamp(scale * multiplier, minZoom ?? 0.5, maxZoom ?? 3);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mapX = (centerX - offset.x) / scale;
    const mapY = (centerY - offset.y) / scale;

    setScale(nextScale);
    setOffset({
      x: centerX - mapX * nextScale,
      y: centerY - mapY * nextScale,
    });
  }

  function getCoordinateFromPointer(clientX: number, clientY: number) {
    const viewport = viewportRef.current;
    if (!viewport) {
      return null;
    }

    const rect = viewport.getBoundingClientRect();
    const mapX = (clientX - rect.left - offset.x) / scale;
    const mapY = (clientY - rect.top - offset.y) / scale;

    return {
      x: clamp((mapX / width) * 100, 0, 100),
      y: clamp((mapY / height) * 100, 0, 100),
    };
  }

  return (
    <div className={cn("grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_280px]", className)}>
      <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <label className="relative block">
          <span className="sr-only">Search Recon markers</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search markers"
            className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Layers
          </p>
          <div className="mt-3 grid gap-2">
            {categories.map((category) => (
              <label
                key={category.key}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300 transition hover:border-cyan-300/30"
              >
                <input
                  type="checkbox"
                  checked={visibleCategories.has(category.key)}
                  onChange={(event) => {
                    setVisibleCategories((current) => {
                      const next = new Set(current);
                      if (event.target.checked) {
                        next.add(category.key);
                      } else {
                        next.delete(category.key);
                      }
                      return next;
                    });
                  }}
                  className="mt-1 size-4 accent-cyan-300"
                />
                <span>
                  <span className="block font-medium text-slate-100">
                    {category.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {category.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-3">
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {markers.length} published markers / {filteredMarkers.length} visible
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => zoomBy(0.82)}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              aria-label="Zoom out"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => zoomBy(1.22)}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              aria-label="Zoom in"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              aria-label="Reset view"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="relative h-[60vh] min-h-[420px] touch-none overflow-hidden bg-[#070b13]"
          onWheel={(event) => {
            event.preventDefault();
            zoomBy(event.deltaY > 0 ? 0.9 : 1.1);
          }}
          onPointerDown={(event) => {
            if ((event.target as Element).closest("[data-marker-button]")) {
              return;
            }

            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              lastX: event.clientX,
              lastY: event.clientY,
              moved: false,
            };
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) {
              return;
            }

            const deltaX = event.clientX - drag.lastX;
            const deltaY = event.clientY - drag.lastY;
            const totalDistance = Math.hypot(
              event.clientX - drag.startX,
              event.clientY - drag.startY,
            );

            if (totalDistance > 4) {
              drag.moved = true;
            }

            drag.lastX = event.clientX;
            drag.lastY = event.clientY;
            setOffset((current) => ({
              x: current.x + deltaX,
              y: current.y + deltaY,
            }));
          }}
          onPointerUp={(event) => {
            const drag = dragRef.current;
            dragRef.current = null;

            if (!drag || drag.pointerId !== event.pointerId) {
              return;
            }

            if (!drag.moved && onCoordinateCapture) {
              const coordinate = getCoordinateFromPointer(
                event.clientX,
                event.clientY,
              );
              if (coordinate) {
                onCoordinateCapture(coordinate);
              }
            }
          }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width,
              height,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "0 0",
            }}
          >
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt || ""}
                width={width}
                height={height}
                unoptimized
                draggable={false}
                className="h-full w-full select-none object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center border border-dashed border-white/15 bg-slate-950 text-center text-sm text-slate-400">
                <span className="max-w-sm leading-6">{emptyState}</span>
              </div>
            )}

            {filteredMarkers.map((marker) => (
              <button
                key={marker.id}
                type="button"
                data-marker-button
                onClick={() => setSelectedId(marker.id)}
                className={cn(
                  "absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-100/80 bg-slate-950/90 text-xs font-semibold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.35)] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100",
                  selectedId === marker.id && "scale-110 border-white bg-cyan-300 text-slate-950",
                )}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                aria-label={marker.label}
              >
                {marker.iconPath ? (
                  <Image
                    src={marker.iconPath}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    className="size-5"
                    draggable={false}
                  />
                ) : (
                  <LocateFixed className="size-4" aria-hidden="true" />
                )}
              </button>
            ))}

            {capturedCoordinate ? (
              <div
                className="pointer-events-none absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-300/20 text-emerald-100 shadow-[0_0_24px_rgba(110,231,183,0.45)]"
                style={{
                  left: `${capturedCoordinate.x}%`,
                  top: `${capturedCoordinate.y}%`,
                }}
              >
                <LocateFixed className="size-5" aria-hidden="true" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Marker detail
        </p>
        {selectedMarker ? (
          <div className="mt-4">
            <p className="text-lg font-semibold text-white">
              {selectedMarker.label}
            </p>
            <p className="mt-2 text-sm text-cyan-100">
              {categoryByKey.get(selectedMarker.category)?.label ||
                selectedMarker.category}
            </p>
            {selectedMarker.description ? (
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {selectedMarker.description}
              </p>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                No detail has been attached to this marker yet.
              </p>
            )}
            <p className="mt-5 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-400">
              x {formatCoordinate(selectedMarker.x)} / y{" "}
              {formatCoordinate(selectedMarker.y)}
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-white/15 p-4 text-sm leading-6 text-slate-400">
            Select a marker from the map or marker list. Public Recon maps only
            show admin-published markers.
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Visible markers
          </p>
          {filteredMarkers.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
              No markers match the current filters.
            </div>
          ) : (
            <div className="mt-3 grid gap-2">
              {filteredMarkers.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => setSelectedId(marker.id)}
                  className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-cyan-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                >
                  <span className="block font-medium">{marker.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {categoryByKey.get(marker.category)?.label ||
                      marker.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
