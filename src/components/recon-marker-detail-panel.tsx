import { formatCoordinate } from "@/components/recon-map-layer-data";
import type { ReconViewerMarker } from "@/components/recon-map-viewer-types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Target, X } from "lucide-react";
import Image from "next/image";

type MarkerDetailPanelProps = {
  marker: ReconViewerMarker;
  categoryLabel: string;
  onCenter: () => void;
  onClose: () => void;
  onToggleCompleted?: () => void;
  onSuggestCorrection?: () => void;
  completed?: boolean;
  compact?: boolean;
  publicMode?: boolean;
};

export function MarkerDetailPanel({
  marker,
  categoryLabel,
  onCenter,
  onClose,
  onToggleCompleted,
  onSuggestCorrection,
  completed = false,
  compact = false,
  publicMode = false,
}: MarkerDetailPanelProps) {
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
          More detailed instructions are not available for this marker yet.
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

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {publicMode && onToggleCompleted ? (
          <button
            type="button"
            onClick={onToggleCompleted}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70",
              completed
                ? "border-emerald-300/35 bg-emerald-300/[0.12] text-emerald-100 hover:border-emerald-200/70"
                : "border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-300/50 hover:bg-white/[0.06]",
            )}
          >
            {completed ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : (
              <Circle className="size-4" aria-hidden="true" />
            )}
            {completed ? "Found" : "Mark found"}
          </button>
        ) : null}
        {publicMode && onSuggestCorrection ? (
          <button
            type="button"
            onClick={onSuggestCorrection}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          >
            <Circle className="size-4" aria-hidden="true" />
            Suggest fix
          </button>
        ) : null}

        <button
          type="button"
          onClick={onCenter}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
        >
          <Target className="size-4" aria-hidden="true" />
          Center marker
        </button>
      </div>
    </article>
  );
}
