import { formatCoordinate, type ReconLayerSection } from "@/components/recon-map-layer-data";
import type { ReconViewerCategory, ReconViewerMarker } from "@/components/recon-map-viewer-types";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Layers,
  List,
  Search,
} from "lucide-react";

type LayerPreset = {
  label: string;
  keys: string[];
};

type ReconMapControlsProps = {
  query: string;
  setQuery: (query: string) => void;
  showLayers: boolean;
  setShowLayers: (updater: (current: boolean) => boolean) => void;
  showResults: boolean;
  setShowResults: (updater: (current: boolean) => boolean) => void;
  visibleCategories: Set<string>;
  setVisibleCategories: (updater: (current: Set<string>) => Set<string>) => void;
  setVisibleLayerKeys: (keys: Iterable<string>) => void;
  availableCategories: ReconViewerCategory[];
  layerSections: ReconLayerSection[];
  layerPresets: LayerPreset[];
  markerCountsByCategory: Map<string, number>;
  filteredMarkers: ReconViewerMarker[];
  markers: ReconViewerMarker[];
  completedMarkerIds: Set<string>;
  completedCountsByCategory: Map<string, number>;
  completedCount: number;
  totalTrackableMarkers: number;
  hideCompleted: boolean;
  setHideCompleted: (hideCompleted: boolean) => void;
  toggleMarkerCompleted: (markerId: string) => void;
  resetCompletedMarkers: () => void;
  suggestionsEnabled: boolean;
  onStartNewSuggestion: () => void;
  selectedId: string | null;
  focusMarker: (marker: ReconViewerMarker) => void;
  categoryByKey: Map<string, ReconViewerCategory>;
  publicMode: boolean;
};

// Public filter contract
export function ReconMapControls({
  query,
  setQuery,
  showLayers,
  setShowLayers,
  showResults,
  setShowResults,
  visibleCategories,
  setVisibleCategories,
  setVisibleLayerKeys,
  availableCategories,
  layerSections,
  layerPresets,
  markerCountsByCategory,
  filteredMarkers,
  markers,
  completedMarkerIds,
  completedCountsByCategory,
  completedCount,
  totalTrackableMarkers,
  hideCompleted,
  setHideCompleted,
  toggleMarkerCompleted,
  resetCompletedMarkers,
  suggestionsEnabled,
  onStartNewSuggestion,
  selectedId,
  focusMarker,
  categoryByKey,
  publicMode,
}: ReconMapControlsProps) {
  // Filter summary boundary
  const visibleAvailableCategoryCount = availableCategories.filter((category) =>
    visibleCategories.has(category.key),
  ).length;

  // Control surface composition
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.035] p-3",
        publicMode && "bg-slate-950/40",
      )}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto] lg:items-center">
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
            className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-9 items-center rounded-full border border-white/10 bg-slate-950/60 px-3 text-xs font-medium text-slate-400">
            {filteredMarkers.length}/{markers.length} visible
          </span>
          {publicMode && totalTrackableMarkers > 0 ? (
            <>
              <span className="inline-flex h-9 items-center rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 text-xs font-semibold text-emerald-100">
                {completedCount}/{totalTrackableMarkers} found
              </span>
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06]">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(event) => setHideCompleted(event.target.checked)}
                  className="size-4 accent-emerald-300"
                />
                Hide found
              </label>
              {completedCount > 0 ? (
                <button
                  type="button"
                  onClick={resetCompletedMarkers}
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 transition hover:border-rose-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
                >
                  Reset found
                </button>
              ) : null}
            </>
          ) : null}
          {suggestionsEnabled ? (
            <button
              type="button"
              onClick={onStartNewSuggestion}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-3 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
            >
              <Circle className="size-4" aria-hidden="true" />
              Suggest marker
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowLayers((current) => !current)}
            aria-expanded={showLayers}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          >
            <Layers className="size-4" aria-hidden="true" />
            {publicMode ? "Filters" : "Layers"}
            <span className="text-slate-500">
              {visibleAvailableCategoryCount}/{availableCategories.length}
            </span>
            <ChevronDown
              className={cn("size-3.5 transition", showLayers && "rotate-180")}
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            onClick={() => setShowResults((current) => !current)}
            aria-expanded={showResults}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          >
            <List className="size-4" aria-hidden="true" />
            Results
            <ChevronDown
              className={cn("size-3.5 transition", showResults && "rotate-180")}
              aria-hidden="true"
            />
          </button>
          {!publicMode ? (
            <LayerPresetButtons
              layerPresets={layerPresets}
              setVisibleLayerKeys={setVisibleLayerKeys}
            />
          ) : null}
        </div>
      </div>

      {showLayers ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/45 p-3">
          {layerSections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
              No marker layers are available for this map yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {publicMode ? (
                <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
                  <LayerPresetButtons
                    layerPresets={layerPresets}
                    setVisibleLayerKeys={setVisibleLayerKeys}
                  />
                </div>
              ) : null}
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {layerSections.map((section) => (
                  <section key={section.key}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {section.label}
                      </h3>
                      <span className="text-[11px] text-slate-600">
                        {section.categories.reduce(
                          (total, category) =>
                            total + (markerCountsByCategory.get(category.key) || 0),
                          0,
                        )}
                      </span>
                    </div>
                    <div className="grid gap-1.5">
                      {section.categories.map((category) => {
                        const checked = visibleCategories.has(category.key);
                        const markerCount = markerCountsByCategory.get(category.key) || 0;
                        const foundCount =
                          completedCountsByCategory.get(category.key) || 0;

                        return (
                          <label
                            key={category.key}
                            className={cn(
                              "flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition",
                              checked
                                ? "border-cyan-300/25 bg-cyan-300/[0.06] text-slate-200"
                                : "border-white/10 bg-slate-950/40 text-slate-400 hover:border-cyan-300/30",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
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
                              className="size-4 shrink-0 accent-cyan-300"
                            />
                            <span className="min-w-0 flex-1 truncate font-medium">
                              {category.label}
                            </span>
                            <span className="sr-only">{category.description}</span>
                            <span
                              className="shrink-0 rounded-full border border-white/10 bg-slate-950/60 px-2 py-0.5 text-[11px] text-slate-400"
                              aria-hidden="true"
                            >
                              {publicMode ? `${foundCount}/${markerCount}` : markerCount}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {showResults || filteredMarkers.length === 0 || query.trim() ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/45 p-3">
          {filteredMarkers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
              No markers match the current filters.
            </div>
          ) : (
            <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className={cn(
                    "flex rounded-xl border text-sm transition",
                    selectedId === marker.id
                      ? "border-cyan-200/60 bg-cyan-300/[0.1] text-white"
                      : "border-white/10 bg-slate-950/40 text-slate-300 hover:border-cyan-300/40 hover:text-white",
                  )}
                >
                  {publicMode ? (
                    <button
                      type="button"
                      onClick={() => toggleMarkerCompleted(marker.id)}
                      className={cn(
                        "flex w-10 shrink-0 items-start justify-center rounded-l-xl py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200/70",
                        completedMarkerIds.has(marker.id)
                          ? "text-emerald-100"
                          : "text-slate-500 hover:text-cyan-100",
                      )}
                      aria-label={
                        completedMarkerIds.has(marker.id)
                          ? `Mark ${marker.label} as not found`
                          : `Mark ${marker.label} as found`
                      }
                    >
                      {completedMarkerIds.has(marker.id) ? (
                        <CheckCircle2 className="size-5" aria-hidden="true" />
                      ) : (
                        <Circle className="size-5" aria-hidden="true" />
                      )}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => focusMarker(marker)}
                    className="min-w-0 flex-1 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200/70"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "min-w-0 break-words font-medium",
                          completedMarkerIds.has(marker.id) &&
                            "text-slate-500 line-through decoration-emerald-300/70",
                        )}
                      >
                        {marker.label}
                      </span>
                      <span
                        className="shrink-0 text-[11px] text-slate-600"
                        aria-hidden="true"
                      >
                        {formatCoordinate(marker.x)}, {formatCoordinate(marker.y)}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {categoryByKey.get(marker.category)?.label || marker.category}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

// Layer preset boundary
function LayerPresetButtons({
  layerPresets,
  setVisibleLayerKeys,
}: {
  layerPresets: LayerPreset[];
  setVisibleLayerKeys: (keys: Iterable<string>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {layerPresets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => setVisibleLayerKeys(preset.keys)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-slate-950/45 px-2.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
