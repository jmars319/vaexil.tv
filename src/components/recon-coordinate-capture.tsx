"use client";

import { submitReconMarkerSuggestion } from "@/app/actions";
import {
  ReconMapViewer,
  type ReconCoordinate,
  type ReconViewerCategory,
  type ReconViewerMarker,
} from "@/components/recon-map-viewer";
import type { ActionState, ReconMarkerSuggestion } from "@/lib/types";
import { Save } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type IconOption = {
  key: string;
  label: string;
  path: string;
};

type ReconCoordinateCaptureProps = {
  map: {
    id: string;
    gameId: string;
    gameShortTitle: string;
    title: string;
    width: number;
    height: number;
    minZoom: number | null;
    maxZoom: number | null;
  };
  imageSrc: string | null;
  categories: ReconViewerCategory[];
  icons: IconOption[];
  suggestions: ReconMarkerSuggestion[];
};

const initialState: ActionState = {
  ok: false,
  message: "",
};

function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-200">{errors[0]}</p>;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-5 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save className="mr-2 size-4" aria-hidden="true" />
      {pending ? "Saving..." : "Save pending marker"}
    </button>
  );
}

function formatCoordinate(value: number | null) {
  return value == null ? "--" : value.toFixed(2);
}

export function ReconCoordinateCapture({
  map,
  imageSrc,
  categories,
  icons,
  suggestions,
}: ReconCoordinateCaptureProps) {
  const [state, formAction] = useActionState(
    submitReconMarkerSuggestion,
    initialState,
  );
  const [coordinate, setCoordinate] = useState<ReconCoordinate | null>(null);
  const [category, setCategory] = useState(categories[0]?.key || "poi");
  const activeCategory =
    categories.find((item) => item.key === category) || categories[0];
  const [iconKey, setIconKey] = useState(activeCategory?.defaultIconKey || "poi");

  const iconByKey = useMemo(
    () => new Map(icons.map((icon) => [icon.key, icon])),
    [icons],
  );

  const suggestionMarkers: ReconViewerMarker[] = suggestions.map(
    (suggestion) => ({
      id: suggestion.id,
      label: suggestion.label,
      description: suggestion.description,
      category: suggestion.category,
      x: suggestion.x,
      y: suggestion.y,
      iconKey: suggestion.iconKey,
      iconPath: iconByKey.get(suggestion.iconKey)?.path,
    }),
  );

  return (
    <div className="grid gap-5">
      <ReconMapViewer
        title={`${map.title} coordinate capture`}
        imageSrc={imageSrc}
        imageAlt={`${map.title} draft Recon map`}
        width={map.width}
        height={map.height}
        minZoom={map.minZoom}
        maxZoom={map.maxZoom}
        markers={suggestionMarkers}
        categories={categories}
        onCoordinateCapture={setCoordinate}
        capturedCoordinate={coordinate}
        emptyState="No private draft asset is available for this map yet."
      />

      <form
        action={formAction}
        className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
      >
        <input type="hidden" name="gameId" value={map.gameId} />
        <input type="hidden" name="mapId" value={map.id} />
        <input type="hidden" name="x" value={coordinate?.x ?? ""} />
        <input type="hidden" name="y" value={coordinate?.y ?? ""} />
        <input type="hidden" name="iconKey" value={iconKey} />

        {state.message ? (
          <div
            className={
              state.ok
                ? "mb-5 rounded-xl border border-emerald-300/40 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"
                : "mb-5 rounded-xl border border-rose-300/40 bg-rose-300/10 px-4 py-3 text-sm text-rose-100"
            }
            role="status"
          >
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1fr_160px_160px]">
          <label>
            <span className="text-sm font-medium text-slate-200">Label</span>
            <input
              name="label"
              placeholder="Short marker label"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            />
            <FieldErrors errors={state.fieldErrors?.label} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-200">Mode</span>
            <select
              name="mode"
              defaultValue="campaign"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            >
              <option value="campaign">Campaign</option>
              {map.gameId === "hitman-woa" ? (
                <option value="freelancer">Freelancer</option>
              ) : null}
            </select>
            <FieldErrors errors={state.fieldErrors?.mode} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-200">Variant</span>
            <select
              name="variant"
              defaultValue="any"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            >
              <option value="any">Any</option>
              {map.gameId === "hitman-woa" ? (
                <>
                  <option value="normal">Normal</option>
                  <option value="alerted">Alerted</option>
                </>
              ) : null}
            </select>
            <FieldErrors errors={state.fieldErrors?.variant} />
          </label>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px_180px]">
          <label>
            <span className="text-sm font-medium text-slate-200">
              Description optional
            </span>
            <textarea
              name="description"
              rows={5}
              placeholder="Keep this factual. Mark uncertainty in the description instead of inventing certainty."
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            />
            <FieldErrors errors={state.fieldErrors?.description} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-200">Category</span>
            <select
              name="category"
              value={category}
              onChange={(event) => {
                const nextCategory = event.target.value;
                setCategory(nextCategory);
                setIconKey(
                  categories.find((item) => item.key === nextCategory)
                    ?.defaultIconKey || "poi",
                );
              }}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            >
              {categories.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <FieldErrors errors={state.fieldErrors?.category} />
          </label>
          <label>
            <span className="text-sm font-medium text-slate-200">Floor</span>
            <input
              name="floor"
              placeholder="Optional"
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            />
            <FieldErrors errors={state.fieldErrors?.floor} />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-200">
            Source URL optional
          </span>
          <input
            name="sourceUrl"
            type="url"
            placeholder="Use only first-hand or permitted references"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.sourceUrl} />
        </label>

        <div className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Captured X
            </p>
            <p className="mt-1 font-mono text-lg text-white">
              {formatCoordinate(coordinate?.x ?? null)}
            </p>
            <FieldErrors errors={state.fieldErrors?.x} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Captured Y
            </p>
            <p className="mt-1 font-mono text-lg text-white">
              {formatCoordinate(coordinate?.y ?? null)}
            </p>
            <FieldErrors errors={state.fieldErrors?.y} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Icon
            </p>
            <select
              value={iconKey}
              onChange={(event) => setIconKey(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
            >
              {icons.map((icon) => (
                <option key={icon.key} value={icon.key}>
                  {icon.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-slate-400">
            Click the private draft map to capture normalized coordinates.
            Saved markers stay pending and are not published by this tool.
          </p>
          <SubmitButton disabled={!coordinate} />
        </div>
      </form>
    </div>
  );
}
