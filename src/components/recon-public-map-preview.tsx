"use client";

import {
  ReconMapViewer,
  type ReconViewerCategory,
  type ReconViewerMarker,
} from "@/components/recon-map-viewer";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type ReconPublicMapView = {
  id: string;
  label: string;
  shortLabel: string;
  kind: string;
  floor: string;
  imageSrc: string | null;
  width: number;
  height: number;
  notes: string;
};

type ReconPublicMapPreviewProps = {
  title: string;
  imageSrc?: string | null;
  imageAlt?: string;
  width: number;
  height: number;
  minZoom?: number | null;
  maxZoom?: number | null;
  markers: ReconViewerMarker[];
  categories: ReconViewerCategory[];
  mapViews?: ReconPublicMapView[];
  markerSummaryLabel?: string;
  emptyState?: string;
  className?: string;
};

function matchesFloor(marker: ReconViewerMarker, floor: string) {
  const activeFloor = floor.trim().toLowerCase();

  if (!activeFloor) {
    return true;
  }

  const markerFloor = (marker.floor || "").trim().toLowerCase();
  return !markerFloor || markerFloor === activeFloor;
}

export function ReconPublicMapPreview({
  title,
  imageSrc,
  imageAlt,
  width,
  height,
  minZoom,
  maxZoom,
  markers,
  categories,
  mapViews = [],
  markerSummaryLabel = "published markers",
  emptyState,
  className,
}: ReconPublicMapPreviewProps) {
  const views =
    mapViews.length > 0
      ? mapViews
      : [
          {
            id: "default",
            label: "Default",
            shortLabel: "Map",
            kind: "overview",
            floor: "",
            imageSrc: imageSrc || null,
            width,
            height,
            notes: "",
          },
        ];
  const [activeViewId, setActiveViewId] = useState(views[0]?.id || "default");
  const activeView = views.find((view) => view.id === activeViewId) || views[0];
  const visibleMarkers = markers.filter((marker) =>
    matchesFloor(marker, activeView?.floor || ""),
  );

  return (
    <div className={cn("grid gap-3", className)}>
      {views.length > 1 ? (
        <section className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Map view
              </p>
              <p className="mt-1 truncate text-sm text-slate-300">
                {activeView?.label || "Overview"}
              </p>
              {activeView?.notes ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {activeView.notes}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={view.id === activeView?.id}
                  onClick={() => setActiveViewId(view.id)}
                  className={
                    view.id === activeView?.id
                      ? "rounded-lg bg-cyan-300 px-3 py-1.5 text-xs font-semibold text-slate-950"
                      : "rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                  }
                >
                  {view.shortLabel}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ReconMapViewer
        title={title}
        imageSrc={activeView?.imageSrc ?? imageSrc}
        imageAlt={imageAlt}
        width={activeView?.width || width}
        height={activeView?.height || height}
        minZoom={minZoom}
        maxZoom={maxZoom}
        markers={visibleMarkers}
        categories={categories}
        markerSummaryLabel={markerSummaryLabel}
        emptyState={emptyState}
        viewerMode="public"
      />
    </div>
  );
}
