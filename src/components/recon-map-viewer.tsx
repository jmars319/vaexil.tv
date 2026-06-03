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
import type {
  GestureZoomEvent,
  ReconMapViewerProps,
  ReconViewerCategory,
  ReconViewerMarker,
} from "@/components/recon-map-viewer-types";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type {
  ReconCoordinate,
  ReconMapViewerProps,
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
        scale={scale}
        offset={offset}
        selectedId={selectedId}
        selectedMarker={selectedMarker}
        selectedPopoverPosition={selectedPopoverPosition}
        capturedCoordinate={capturedCoordinate}
        viewportRef={viewportRef}
        dragRef={dragRef}
        scaleRef={scaleRef}
        offsetRef={offsetRef}
        syncViewState={syncViewState}
        resetView={resetView}
        zoomBy={zoomBy}
        focusMarker={focusMarker}
        setSelectedId={setSelectedId}
        getCoordinateFromPointer={getCoordinateFromPointer}
        onCoordinateCapture={onCoordinateCapture}
        categoryByKey={categoryByKey}
      />
    </div>
  );
}
