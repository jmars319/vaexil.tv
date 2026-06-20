import { MarkerDetailPanel } from "@/components/recon-marker-detail-panel";
import type {
  ReconCoordinate,
  ReconViewerCategory,
  ReconViewerMarker,
} from "@/components/recon-map-viewer-types";
import { cn } from "@/lib/utils";
import { Info, LocateFixed, Minus, Plus, RotateCcw } from "lucide-react";
import Image from "next/image";
import type { RefObject } from "react";

type ReconMapSurfaceProps = {
  title: string;
  imageSrc?: string | null;
  imageAlt?: string;
  width: number;
  height: number;
  markers: ReconViewerMarker[];
  filteredMarkers: ReconViewerMarker[];
  markerSummaryLabel: string;
  emptyState: string;
  publicMode: boolean;
  completedMarkerIds: Set<string>;
  completedCount: number;
  totalTrackableMarkers: number;
  scale: number;
  offset: { x: number; y: number };
  selectedId: string | null;
  selectedMarker: ReconViewerMarker | null;
  selectedPopoverPosition: { left: number; top: number } | null;
  capturedCoordinate?: ReconCoordinate | null;
  viewportRef: RefObject<HTMLDivElement | null>;
  dragRef: RefObject<{
    pointerId: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null>;
  scaleRef: RefObject<number>;
  offsetRef: RefObject<{ x: number; y: number }>;
  syncViewState: (nextScale: number, nextOffset: { x: number; y: number }) => void;
  resetView: () => void;
  zoomBy: (multiplier: number, point?: { x: number; y: number }) => void;
  focusMarker: (marker: ReconViewerMarker, targetScale?: number) => void;
  toggleMarkerCompleted: (markerId: string) => void;
  setSelectedId: (id: string | null) => void;
  getCoordinateFromPointer: (clientX: number, clientY: number) => ReconCoordinate | null;
  onCoordinateCapture?: (coordinate: ReconCoordinate) => void;
  categoryByKey: Map<string, ReconViewerCategory>;
};

export function ReconMapSurface({
  title,
  imageSrc,
  imageAlt,
  width,
  height,
  markers,
  filteredMarkers,
  markerSummaryLabel,
  emptyState,
  publicMode,
  completedMarkerIds,
  completedCount,
  totalTrackableMarkers,
  scale,
  offset,
  selectedId,
  selectedMarker,
  selectedPopoverPosition,
  capturedCoordinate,
  viewportRef,
  dragRef,
  scaleRef,
  offsetRef,
  syncViewState,
  resetView,
  zoomBy,
  focusMarker,
  toggleMarkerCompleted,
  setSelectedId,
  getCoordinateFromPointer,
  onCoordinateCapture,
  categoryByKey,
}: ReconMapSurfaceProps) {
  const selectedCategoryLabel =
    selectedMarker
      ? categoryByKey.get(selectedMarker.category)?.label || selectedMarker.category
      : "";

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {markers.length} {markerSummaryLabel} / {filteredMarkers.length} visible /{" "}
              {Math.round(scale * 100)}% zoom
            </p>
            {publicMode && totalTrackableMarkers > 0 ? (
              <div className="mt-2 flex max-w-sm items-center gap-2">
                <div className="h-1.5 min-w-28 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-300 transition-[width]"
                    style={{
                      width: `${Math.round(
                        (completedCount / totalTrackableMarkers) * 100,
                      )}%`,
                    }}
                  />
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-emerald-100">
                  {completedCount}/{totalTrackableMarkers} found
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1 text-xs text-slate-500 sm:inline-flex">
              <Info className="size-3.5" aria-hidden="true" />
              Click markers for details
            </span>
            <button
              type="button"
              onClick={() => zoomBy(0.82)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              aria-label="Zoom out"
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => zoomBy(1.22)}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              aria-label="Zoom in"
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
              aria-label="Reset view"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className={cn(
            "relative touch-none overflow-hidden overscroll-contain bg-[#070b13]",
            publicMode
              ? "h-[clamp(560px,76vh,960px)]"
              : "h-[clamp(520px,72vh,900px)]",
          )}
          data-testid="recon-map-viewport"
          data-scale={scale.toFixed(4)}
          onPointerDown={(event) => {
            if (
              (event.target as Element).closest(
                "[data-marker-button],[data-marker-detail]",
              )
            ) {
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
            const currentOffset = offsetRef.current;
            syncViewState(scaleRef.current, {
              x: currentOffset.x + deltaX,
              y: currentOffset.y + deltaY,
            });
          }}
          onPointerUp={(event) => {
            const drag = dragRef.current;
            dragRef.current = null;

            if (!drag || drag.pointerId !== event.pointerId) {
              return;
            }

            if (!drag.moved && onCoordinateCapture) {
              const coordinate = getCoordinateFromPointer(event.clientX, event.clientY);
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
                priority
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
                onClick={() => focusMarker(marker)}
                className={cn(
                  "group/marker absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-100/80 bg-slate-950/90 text-xs font-semibold text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.32)] transition after:absolute after:-inset-2 after:content-[''] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100",
                  completedMarkerIds.has(marker.id) &&
                    "border-emerald-200/80 bg-emerald-300 text-slate-950 shadow-[0_0_16px_rgba(110,231,183,0.36)] opacity-80",
                  selectedId === marker.id &&
                    "z-20 scale-110 border-white bg-cyan-300 text-slate-950",
                )}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                aria-label={marker.label}
                title={marker.label}
              >
                {marker.iconPath ? (
                  <Image
                    src={marker.iconPath}
                    alt=""
                    width={16}
                    height={16}
                    unoptimized
                    className="size-4"
                    draggable={false}
                  />
                ) : (
                  <LocateFixed className="size-3.5" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] z-30 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950/95 px-2 py-1 text-[11px] font-semibold text-white shadow-xl group-hover/marker:block group-focus-visible/marker:block",
                    selectedId === marker.id && "block",
                  )}
                  aria-hidden="true"
                >
                  {marker.label}
                </span>
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

          {selectedMarker && selectedPopoverPosition ? (
            <div
              className="absolute z-40 hidden md:block"
              style={{
                left: selectedPopoverPosition.left,
                top: selectedPopoverPosition.top,
              }}
            >
              <MarkerDetailPanel
                marker={selectedMarker}
                categoryLabel={selectedCategoryLabel}
                onCenter={() => focusMarker(selectedMarker, 1.65)}
                onClose={() => setSelectedId(null)}
                onToggleCompleted={() => toggleMarkerCompleted(selectedMarker.id)}
                completed={completedMarkerIds.has(selectedMarker.id)}
                publicMode={publicMode}
              />
            </div>
          ) : null}
        </div>
      </section>

      {selectedMarker ? (
        <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
          <MarkerDetailPanel
            marker={selectedMarker}
            categoryLabel={selectedCategoryLabel}
            onCenter={() => focusMarker(selectedMarker, 1.65)}
            onClose={() => setSelectedId(null)}
            onToggleCompleted={() => toggleMarkerCompleted(selectedMarker.id)}
            completed={completedMarkerIds.has(selectedMarker.id)}
            compact
            publicMode={publicMode}
          />
        </div>
      ) : null}
    </>
  );
}
