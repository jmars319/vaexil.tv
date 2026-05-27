"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Info,
  Layers,
  List,
  LocateFixed,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Target,
  X,
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
  floor?: string | null;
  iconKey: string;
  iconPath?: string;
  hiddenByDefault?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  confidence?: "unverified" | "community_supported" | "verified";
  status?: string;
  mode?: string;
  variant?: string;
  detail?: ReconViewerMarkerDetail | null;
  detailStatus?: string | null;
  detailLastReviewed?: string | null;
  media?: ReconViewerMarkerMedia[];
};

export type ReconViewerMarkerDetail = {
  markerId: string;
  mapId: string;
  locationHint?: string;
  howToSteps?: string[];
  requirements?: string[];
  notes?: string[];
  mediaAssetIds?: string[];
};

export type ReconViewerMarkerMedia = {
  assetId: string;
  src: string;
  alt: string;
  caption: string;
  visibility: "private" | "public";
  status: string;
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
  markerSummaryLabel?: string;
  emptyState?: string;
  className?: string;
  viewerMode?: "admin" | "public";
};

type GestureZoomEvent = Event & {
  clientX?: number;
  clientY?: number;
  scale?: number;
};

type LayerGroupDefinition = {
  key: string;
  label: string;
  categoryKeys: string[];
};

const layerGroups: LayerGroupDefinition[] = [
  {
    key: "navigation",
    label: "Navigation",
    categoryKeys: [
      "entrance",
      "exit",
      "starting_location",
      "exfiltration",
      "passage",
      "transition",
      "shortcut",
    ],
  },
  {
    key: "objectives",
    label: "Objectives",
    categoryKeys: [
      "main_objective",
      "optional_objective",
      "target_spawn",
      "target_path_point",
      "suspect_spawn",
      "suspect_zone",
      "kill_list_target",
      "medal_related",
      "sniper",
      "officer",
      "poi",
    ],
  },
  {
    key: "collectibles",
    label: "Collectibles",
    categoryKeys: [
      "personal_letter",
      "classified_document",
      "hidden_item",
      "stone_eagle",
      "cardboard_pigeon",
      "gnome",
      "propaganda_poster",
    ],
  },
  {
    key: "tools",
    label: "Tools",
    categoryKeys: [
      "workbench",
      "rifle_workbench",
      "smg_workbench",
      "pistol_workbench",
      "weapon",
      "tool",
      "satchel_charge",
      "bolt_cutters",
      "crowbar",
      "fuse_box",
      "key",
      "key_or_code",
      "poison",
      "poison_pickup",
    ],
  },
  {
    key: "systems",
    label: "Systems",
    categoryKeys: [
      "camera_recorder",
      "security_room",
      "safe",
      "supplier",
      "courier",
      "lookout",
      "assassin",
      "alarm",
      "alarm_siren",
      "vehicle",
    ],
  },
  {
    key: "supplies",
    label: "Supplies",
    categoryKeys: [
      "ammunition",
      "medical_item",
      "supply_pouch",
      "explosives",
    ],
  },
];

const coreLayerKeys = new Set([
  "entrance",
  "exit",
  "starting_location",
  "exfiltration",
  "main_objective",
  "optional_objective",
  "target_spawn",
  "kill_list_target",
  "medal_related",
  "workbench",
  "rifle_workbench",
  "smg_workbench",
  "pistol_workbench",
  "passage",
  "transition",
]);

const collectibleLayerKeys = new Set([
  "personal_letter",
  "classified_document",
  "hidden_item",
  "stone_eagle",
  "cardboard_pigeon",
  "gnome",
  "propaganda_poster",
]);

const toolLayerKeys = new Set([
  "weapon",
  "tool",
  "satchel_charge",
  "bolt_cutters",
  "crowbar",
  "fuse_box",
  "key",
  "key_or_code",
  "poison",
  "poison_pickup",
]);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatCoordinate(value: number) {
  return value.toFixed(2);
}

function MarkerDetailPanel({
  marker,
  categoryLabel,
  onCenter,
  onClose,
  compact = false,
  publicMode = false,
}: {
  marker: ReconViewerMarker;
  categoryLabel: string;
  onCenter: () => void;
  onClose: () => void;
  compact?: boolean;
  publicMode?: boolean;
}) {
  const detail = marker.detail;
  const hasStructuredDetail = Boolean(
    detail?.locationHint ||
      detail?.howToSteps?.length ||
      detail?.requirements?.length ||
      detail?.notes?.length ||
      marker.media?.length,
  );

  return (
    <article
      className={cn(
        "max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-4 text-left shadow-[0_18px_80px_rgba(2,6,23,0.55)] backdrop-blur",
        compact ? "w-full" : "w-[21rem]",
      )}
      data-testid="recon-marker-detail"
      data-marker-detail
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-base font-semibold text-white">
            {marker.label}
          </p>
          <p className="mt-1 text-xs font-medium text-cyan-100">
            {categoryLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-cyan-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          aria-label="Close marker detail"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {detail?.locationHint ? (
        <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
            Location
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {detail.locationHint}
          </p>
        </div>
      ) : marker.description ? (
        <p className="mt-4 text-sm leading-6 text-slate-300">
          {marker.description}
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          No detail has been attached to this marker yet.
        </p>
      )}

      {detail?.locationHint && marker.description ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Marker note
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {marker.description}
          </p>
        </div>
      ) : null}

      {detail?.howToSteps?.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            How to reach or complete
          </p>
          <ol className="mt-2 grid gap-2 text-sm leading-6 text-slate-300">
            {detail.howToSteps.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-slate-200">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {detail?.requirements?.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Requirements
          </p>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-slate-300">
            {detail.requirements.map((requirement) => (
              <li key={requirement}>- {requirement}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {marker.media?.length ? (
        <div className="mt-4 grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Media
          </p>
          {marker.media.map((media) => (
            <figure
              key={media.assetId}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035]"
            >
              <Image
                src={media.src}
                alt={media.alt}
                width={640}
                height={360}
                unoptimized
                className="h-auto w-full"
              />
              {media.caption ? (
                <figcaption className="px-3 py-2 text-xs leading-5 text-slate-400">
                  {media.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      {detail?.notes?.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Notes
          </p>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-slate-400">
            {detail.notes.map((note) => (
              <li key={note}>- {note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!hasStructuredDetail && marker.description ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Structured guide detail has not been reviewed yet; showing the marker
          description as fallback.
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-400">
        {!publicMode ? (
          <p>
            x {formatCoordinate(marker.x)} / y {formatCoordinate(marker.y)}
            {marker.floor ? ` / ${marker.floor}` : ""}
          </p>
        ) : marker.floor ? (
          <p>View: {marker.floor}</p>
        ) : null}
        <p>
          Placement confidence: {marker.confidence || "unverified"}
          {!publicMode && marker.detailStatus
            ? ` / Detail: ${marker.detailStatus}`
            : ""}
        </p>
        {marker.sourceName || marker.sourceUrl ? (
          <p className="break-words">
            Source:{" "}
            {marker.sourceUrl ? (
              <a
                href={marker.sourceUrl}
                className="text-cyan-100 underline-offset-4 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {marker.sourceName || marker.sourceUrl}
              </a>
            ) : (
              marker.sourceName
            )}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onCenter}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
      >
        <Target className="size-4" aria-hidden="true" />
        Center marker
      </button>
    </article>
  );
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
  markerSummaryLabel = "published markers",
  emptyState = "No map asset is available yet.",
  className,
  viewerMode = "admin",
}: ReconMapViewerProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const gestureStartScaleRef = useRef<number | null>(null);
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
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    () =>
      new Set(
        categories
          .filter((category) => category.defaultVisible)
          .map((category) => category.key),
      ),
  );
  const publicMode = viewerMode === "public";

  const syncViewState = useCallback(
    (nextScale: number, nextOffset: { x: number; y: number }) => {
      scaleRef.current = nextScale;
      offsetRef.current = nextOffset;
      setScale(nextScale);
      setOffset(nextOffset);
    },
    [],
  );

  const resetView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    setViewportSize({ width: rect.width, height: rect.height });
    const nextScale = clamp(
      Math.min(rect.width / width, rect.height / height) * 0.96,
      minZoom ?? 0.5,
      maxZoom ?? 3,
    );

    syncViewState(nextScale, {
      x: (rect.width - width * nextScale) / 2,
      y: (rect.height - height * nextScale) / 2,
    });
  }, [height, maxZoom, minZoom, syncViewState, width]);

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

  const markerCountsByCategory = useMemo(() => {
    const counts = new Map<string, number>();

    for (const marker of markers) {
      if (marker.hiddenByDefault) {
        continue;
      }
      counts.set(marker.category, (counts.get(marker.category) || 0) + 1);
    }

    return counts;
  }, [markers]);

  const availableCategories = useMemo(() => {
    const withMarkers = categories.filter(
      (category) => (markerCountsByCategory.get(category.key) || 0) > 0,
    );

    return withMarkers.length > 0 ? withMarkers : categories;
  }, [categories, markerCountsByCategory]);

  const defaultVisibleCategoryKeys = useMemo(
    () =>
      availableCategories
        .filter((category) => category.defaultVisible)
        .map((category) => category.key),
    [availableCategories],
  );

  const availableCategoryKeys = useMemo(
    () => availableCategories.map((category) => category.key),
    [availableCategories],
  );

  const layerSections = useMemo(() => {
    const usedCategoryKeys = new Set<string>();
    const sections = layerGroups.flatMap((group) => {
      const groupCategories = group.categoryKeys
        .map((categoryKey) =>
          availableCategories.find((category) => category.key === categoryKey),
        )
        .filter((category): category is ReconViewerCategory => Boolean(category));

      if (groupCategories.length === 0) {
        return [];
      }

      for (const category of groupCategories) {
        usedCategoryKeys.add(category.key);
      }

      return [
        {
          key: group.key,
          label: group.label,
          categories: groupCategories,
        },
      ];
    });

    const remainingCategories = availableCategories.filter(
      (category) => !usedCategoryKeys.has(category.key),
    );

    if (remainingCategories.length > 0) {
      sections.push({
        key: "other",
        label: "Other",
        categories: remainingCategories,
      });
    }

    return sections;
  }, [availableCategories]);

  const setVisibleLayerKeys = useCallback(
    (keys: Iterable<string>) => {
      const availableKeys = new Set(availableCategoryKeys);
      const next = new Set<string>();

      for (const key of keys) {
        if (availableKeys.has(key)) {
          next.add(key);
        }
      }

      setVisibleCategories(next);
    },
    [availableCategoryKeys],
  );

  const layerPresets = useMemo(
    () => [
      {
        label: "Default",
        keys: defaultVisibleCategoryKeys,
      },
      {
        label: "Core",
        keys: availableCategories
          .filter((category) => coreLayerKeys.has(category.key))
          .map((category) => category.key),
      },
      {
        label: "Collectibles",
        keys: availableCategories
          .filter((category) => collectibleLayerKeys.has(category.key))
          .map((category) => category.key),
      },
      {
        label: "Tools",
        keys: availableCategories
          .filter((category) => toolLayerKeys.has(category.key))
          .map((category) => category.key),
      },
      {
        label: "All",
        keys: availableCategoryKeys,
      },
      {
        label: "None",
        keys: [],
      },
    ],
    [availableCategories, availableCategoryKeys, defaultVisibleCategoryKeys],
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

  const focusMarker = useCallback(
    (marker: ReconViewerMarker, targetScale?: number) => {
      setSelectedId(marker.id);

      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const rect = viewport.getBoundingClientRect();
      const nextScale = clamp(
        targetScale ?? Math.max(scaleRef.current, 1.35),
        minZoom ?? 0.5,
        maxZoom ?? 3,
      );
      const mapX = (marker.x / 100) * width;
      const mapY = (marker.y / 100) * height;

      syncViewState(nextScale, {
        x: rect.width / 2 - mapX * nextScale,
        y: rect.height / 2 - mapY * nextScale,
      });
    },
    [height, maxZoom, minZoom, syncViewState, width],
  );

  const zoomToPoint = useCallback(
    (nextScaleValue: number, point: { x: number; y: number }) => {
      const currentScale = scaleRef.current;
      const currentOffset = offsetRef.current;
      const nextScale = clamp(
        nextScaleValue,
        minZoom ?? 0.5,
        maxZoom ?? 3,
      );

      if (Math.abs(nextScale - currentScale) < 0.001) {
        return;
      }

      const mapX = (point.x - currentOffset.x) / currentScale;
      const mapY = (point.y - currentOffset.y) / currentScale;

      syncViewState(nextScale, {
        x: point.x - mapX * nextScale,
        y: point.y - mapY * nextScale,
      });
    },
    [maxZoom, minZoom, syncViewState],
  );

  const zoomBy = useCallback(
    (multiplier: number, point?: { x: number; y: number }) => {
      const viewport = viewportRef.current;
      if (!viewport) {
        return;
      }

      const rect = viewport.getBoundingClientRect();
      const focalPoint = point || {
        x: rect.width / 2,
        y: rect.height / 2,
      };

      zoomToPoint(scaleRef.current * multiplier, focalPoint);
    },
    [zoomToPoint],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const activeViewport = viewport;

    function getViewportPoint(event: WheelEvent | GestureZoomEvent) {
      const rect = activeViewport.getBoundingClientRect();
      const hasClientPoint =
        typeof event.clientX === "number" && typeof event.clientY === "number";

      return hasClientPoint
        ? {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          }
        : {
            x: rect.width / 2,
            y: rect.height / 2,
          };
    }

    function normalizeWheelDelta(event: WheelEvent) {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * 16;
      }

      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * activeViewport.clientHeight;
      }

      return event.deltaY;
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const deltaY = normalizeWheelDelta(event);
      const intensity = event.ctrlKey || event.metaKey ? 0.006 : 0.0022;
      zoomBy(Math.exp(-deltaY * intensity), getViewportPoint(event));
    }

    function handleGestureStart(event: Event) {
      event.preventDefault();
      gestureStartScaleRef.current = scaleRef.current;
    }

    function handleGestureChange(event: Event) {
      event.preventDefault();
      const gestureEvent = event as GestureZoomEvent;
      const gestureScale =
        typeof gestureEvent.scale === "number" ? gestureEvent.scale : 1;
      const baseScale = gestureStartScaleRef.current ?? scaleRef.current;

      zoomToPoint(
        baseScale * gestureScale,
        getViewportPoint(gestureEvent),
      );
    }

    function handleGestureEnd(event: Event) {
      event.preventDefault();
      gestureStartScaleRef.current = null;
    }

    activeViewport.addEventListener("wheel", handleWheel, { passive: false });
    activeViewport.addEventListener("gesturestart", handleGestureStart, {
      passive: false,
    });
    activeViewport.addEventListener("gesturechange", handleGestureChange, {
      passive: false,
    });
    activeViewport.addEventListener("gestureend", handleGestureEnd, {
      passive: false,
    });

    return () => {
      activeViewport.removeEventListener("wheel", handleWheel);
      activeViewport.removeEventListener("gesturestart", handleGestureStart);
      activeViewport.removeEventListener("gesturechange", handleGestureChange);
      activeViewport.removeEventListener("gestureend", handleGestureEnd);
    };
  }, [zoomBy, zoomToPoint]);

  function getCoordinateFromPointer(clientX: number, clientY: number) {
    const viewport = viewportRef.current;
    if (!viewport) {
      return null;
    }

    const rect = viewport.getBoundingClientRect();
    const currentOffset = offsetRef.current;
    const currentScale = scaleRef.current;
    const mapX = (clientX - rect.left - currentOffset.x) / currentScale;
    const mapY = (clientY - rect.top - currentOffset.y) / currentScale;

    return {
      x: clamp((mapX / width) * 100, 0, 100),
      y: clamp((mapY / height) * 100, 0, 100),
    };
  }

  const selectedPopoverPosition = useMemo(() => {
    if (!selectedMarker) {
      return null;
    }

    const markerX = offset.x + (selectedMarker.x / 100) * width * scale;
    const markerY = offset.y + (selectedMarker.y / 100) * height * scale;

    return {
      left: clamp(markerX + 16, 16, Math.max(16, viewportSize.width - 352)),
      top: clamp(markerY + 16, 16, Math.max(16, viewportSize.height - 360)),
    };
  }, [height, offset.x, offset.y, scale, selectedMarker, viewportSize, width]);

  return (
    <div className={cn("grid gap-3", className)}>
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
            <button
              type="button"
              onClick={() => setShowLayers((current) => !current)}
              aria-expanded={showLayers}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
            >
              <Layers className="size-4" aria-hidden="true" />
              {publicMode ? "Filters" : "Layers"}
              <span className="text-slate-500">
                {visibleCategories.size}/{availableCategories.length}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 transition",
                  showLayers && "rotate-180",
                )}
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
                className={cn(
                  "size-3.5 transition",
                  showResults && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            {!publicMode ? (
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
                              total +
                              (markerCountsByCategory.get(category.key) || 0),
                            0,
                          )}
                        </span>
                      </div>
                      <div className="grid gap-1.5">
                        {section.categories.map((category) => {
                          const checked = visibleCategories.has(category.key);
                          const markerCount =
                            markerCountsByCategory.get(category.key) || 0;

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
                              <span className="sr-only">
                                {category.description}
                              </span>
                              <span
                                className="shrink-0 rounded-full border border-white/10 bg-slate-950/60 px-2 py-0.5 text-[11px] text-slate-400"
                                aria-hidden="true"
                              >
                                {markerCount}
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
                  <button
                    key={marker.id}
                    type="button"
                    onClick={() => focusMarker(marker)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70",
                      selectedId === marker.id
                        ? "border-cyan-200/60 bg-cyan-300/[0.1] text-white"
                        : "border-white/10 bg-slate-950/40 text-slate-300 hover:border-cyan-300/40 hover:text-white",
                    )}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0 break-words font-medium">
                        {marker.label}
                      </span>
                      <span
                        className="shrink-0 text-[11px] text-slate-600"
                        aria-hidden="true"
                      >
                        {formatCoordinate(marker.x)},{" "}
                        {formatCoordinate(marker.y)}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {categoryByKey.get(marker.category)?.label ||
                        marker.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-3">
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {markers.length} {markerSummaryLabel} / {filteredMarkers.length} visible /{" "}
              {Math.round(scale * 100)}% zoom
            </p>
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
                categoryLabel={
                  categoryByKey.get(selectedMarker.category)?.label ||
                  selectedMarker.category
                }
                onCenter={() => focusMarker(selectedMarker, 1.65)}
                onClose={() => setSelectedId(null)}
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
            categoryLabel={
              categoryByKey.get(selectedMarker.category)?.label ||
              selectedMarker.category
            }
            onCenter={() => focusMarker(selectedMarker, 1.65)}
            onClose={() => setSelectedId(null)}
            compact
            publicMode={publicMode}
          />
        </div>
      ) : null}
    </div>
  );
}
