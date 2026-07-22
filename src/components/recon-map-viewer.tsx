"use client";

import {
  clamp,
  collectibleLayerKeys,
  coreLayerKeys,
  layerGroups,
  toolLayerKeys,
} from "@/components/recon-map-layer-data";
import { ReconMapControls } from "@/components/recon-map-controls";
import { ReconMapSurface } from "@/components/recon-map-surface";
import {
  getProgressStorageKey,
  parseProgressSnapshot,
  readProgressSnapshot,
  subscribeToProgressStorage,
  writeProgressSnapshot,
} from "@/components/recon-progress-storage";
import type {
  GestureZoomEvent,
  ReconCoordinate,
  ReconMapViewerProps,
  ReconSuggestionDraft,
  ReconViewerCategory,
  ReconViewerMarker,
} from "@/components/recon-map-viewer-types";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  lazy,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  Suspense,
} from "react";

/* Suggestion form boundary */ const ReconMapSuggestionForm = lazy(
  () =>
    import("@/components/recon-map-suggestion-form").then(
      (mod) => ({ default: mod.ReconMapSuggestionForm }),
    ),
);

/* Viewer data contract */ export type {
  ReconCoordinate,
  ReconMapViewerProps,
  ReconSuggestionContext,
  ReconSuggestionDraft,
  ReconSuggestionKind,
  ReconViewerCategory,
  ReconViewerMarker,
  ReconViewerMarkerDetail,
  ReconViewerMarkerMedia,
} from "@/components/recon-map-viewer-types";

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
  markerSummaryLabel = "map locations",
  emptyState = "No map asset is available yet.",
  className,
  viewerMode = "admin",
  suggestionContext,
}: ReconMapViewerProps) {
  /* Viewport state boundary */ const viewportRef = useRef<HTMLDivElement | null>(null);
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
  const [hideCompleted, setHideCompleted] = useState(false);
  const [suggestionDraft, setSuggestionDraft] =
    useState<ReconSuggestionDraft | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    () =>
      new Set(
        categories
          .filter((category) => category.defaultVisible)
          .map((category) => category.key),
      ),
  );
  const publicMode = viewerMode === "public";
  const suggestionsEnabled = Boolean(suggestionContext);
  /* Public progress persistence */ const progressStorageKey = useMemo(() => getProgressStorageKey(title), [title]);
  const progressSnapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) =>
        subscribeToProgressStorage(progressStorageKey, onStoreChange),
      [progressStorageKey],
    ),
    useCallback(() => readProgressSnapshot(progressStorageKey), [progressStorageKey]),
    () => "[]",
  );
  const completedMarkerIds = useMemo(
    () => (publicMode ? parseProgressSnapshot(progressSnapshot) : new Set<string>()),
    [progressSnapshot, publicMode],
  );

  const toggleMarkerCompleted = useCallback((markerId: string) => {
    const next = new Set(completedMarkerIds);
    if (next.has(markerId)) {
      next.delete(markerId);
    } else {
      next.add(markerId);
    }
    writeProgressSnapshot(progressStorageKey, next);
  }, [completedMarkerIds, progressStorageKey]);

  const resetCompletedMarkers = useCallback(() => {
    writeProgressSnapshot(progressStorageKey, new Set());
  }, [progressStorageKey]);

  const startNewSuggestion = useCallback(() => {
    setSelectedId(null);
    setSuggestionDraft({
      type: "new_marker",
      coordinate: null,
      targetMarker: null,
    });
  }, []);

  const startMarkerCorrection = useCallback((marker: ReconViewerMarker) => {
    setSelectedId(marker.id);
    setSuggestionDraft({
      type: "marker_correction",
      coordinate: { x: marker.x, y: marker.y },
      targetMarker: marker,
    });
  }, []);

  const handleCoordinateCapture = useCallback(
    (coordinate: ReconCoordinate) => {
      setSuggestionDraft((current) =>
        current ? { ...current, coordinate } : current,
      );
      onCoordinateCapture?.(coordinate);
    },
    [onCoordinateCapture],
  );

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

  /* Viewport resize boundary */ useEffect(() => {
    resetView();
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const observer = new ResizeObserver(resetView);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [resetView]);

  /* Layer visibility surface */ const categoryByKey = useMemo(
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

  const trackableMarkers = useMemo(
    () => markers.filter((marker) => !marker.hiddenByDefault),
    [markers],
  );

  const totalTrackableMarkers = trackableMarkers.length;
  const completedCount = useMemo(
    () =>
      trackableMarkers.filter((marker) => completedMarkerIds.has(marker.id)).length,
    [completedMarkerIds, trackableMarkers],
  );

  const completedCountsByCategory = useMemo(() => {
    const counts = new Map<string, number>();

    for (const marker of trackableMarkers) {
      if (!completedMarkerIds.has(marker.id)) {
        continue;
      }
      counts.set(marker.category, (counts.get(marker.category) || 0) + 1);
    }

    return counts;
  }, [completedMarkerIds, trackableMarkers]);

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

  /* Marker filter surface */ const filteredMarkers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return markers.filter((marker) => {
      const matchesCategory =
        visibleCategories.has(marker.category) && !marker.hiddenByDefault;
      const matchesCompletion =
        !publicMode || !hideCompleted || !completedMarkerIds.has(marker.id);
      const detail = marker.detail;
      const haystack = [
        marker.label,
        marker.description || "",
        detail?.locationHint || "",
        ...(detail?.howToSteps || []),
        ...(detail?.requirements || []),
        ...(detail?.notes || []),
        categoryByKey.get(marker.category)?.label || marker.category,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        matchesCompletion &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [
    categoryByKey,
    completedMarkerIds,
    hideCompleted,
    markers,
    publicMode,
    query,
    visibleCategories,
  ]);

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
      const nextScale = clamp(nextScaleValue, minZoom ?? 0.5, maxZoom ?? 3);

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

  /* Pointer zoom boundary */ useEffect(() => {
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

      zoomToPoint(baseScale * gestureScale, getViewportPoint(gestureEvent));
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

  /* Coordinate capture boundary */ function getCoordinateFromPointer(clientX: number, clientY: number) {
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
  const activeCapturedCoordinate =
    suggestionDraft?.coordinate || capturedCoordinate || null;

  /* Viewer surface composition */ return (
    <div className={cn("grid gap-3", className)}>
      <ReconMapControls
        query={query}
        setQuery={setQuery}
        showLayers={showLayers}
        setShowLayers={setShowLayers}
        showResults={showResults}
        setShowResults={setShowResults}
        visibleCategories={visibleCategories}
        setVisibleCategories={setVisibleCategories}
        setVisibleLayerKeys={setVisibleLayerKeys}
        availableCategories={availableCategories}
        layerSections={layerSections}
        layerPresets={layerPresets}
        markerCountsByCategory={markerCountsByCategory}
        filteredMarkers={filteredMarkers}
        markers={markers}
        completedMarkerIds={completedMarkerIds}
        completedCountsByCategory={completedCountsByCategory}
        completedCount={completedCount}
        totalTrackableMarkers={totalTrackableMarkers}
        hideCompleted={hideCompleted}
        setHideCompleted={setHideCompleted}
        toggleMarkerCompleted={toggleMarkerCompleted}
        resetCompletedMarkers={resetCompletedMarkers}
        suggestionsEnabled={suggestionsEnabled}
        onStartNewSuggestion={startNewSuggestion}
        selectedId={selectedId}
        focusMarker={focusMarker}
        categoryByKey={categoryByKey}
        publicMode={publicMode}
      />
      <ReconMapSurface
        title={title}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        width={width}
        height={height}
        markers={markers}
        filteredMarkers={filteredMarkers}
        markerSummaryLabel={markerSummaryLabel}
        emptyState={emptyState}
        publicMode={publicMode}
        completedMarkerIds={completedMarkerIds}
        completedCount={completedCount}
        totalTrackableMarkers={totalTrackableMarkers}
        scale={scale}
        offset={offset}
        selectedId={selectedId}
        selectedMarker={selectedMarker}
        selectedPopoverPosition={selectedPopoverPosition}
        capturedCoordinate={activeCapturedCoordinate}
        viewportRef={viewportRef}
        dragRef={dragRef}
        scaleRef={scaleRef}
        offsetRef={offsetRef}
        syncViewState={syncViewState}
        resetView={resetView}
        zoomBy={zoomBy}
        focusMarker={focusMarker}
        toggleMarkerCompleted={toggleMarkerCompleted}
        onSuggestMarkerCorrection={
          suggestionsEnabled ? startMarkerCorrection : undefined
        }
        setSelectedId={setSelectedId}
        getCoordinateFromPointer={getCoordinateFromPointer}
        onCoordinateCapture={
          suggestionDraft || onCoordinateCapture
            ? handleCoordinateCapture
            : undefined
        }
        suggestionCaptureActive={Boolean(suggestionDraft)}
        categoryByKey={categoryByKey}
      />
      {suggestionContext && suggestionDraft ? (
        <Suspense fallback={null}>
          <ReconMapSuggestionForm
            key={`${suggestionDraft.type}-${suggestionDraft.targetMarker?.id || "new"}`}
            context={suggestionContext}
            categories={categories}
            draft={suggestionDraft}
            onClose={() => setSuggestionDraft(null)}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
