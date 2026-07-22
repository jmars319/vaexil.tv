"use client";

import { submitPublicReconMarkerSuggestion } from "@/app/actions";
import { formatCoordinate } from "@/components/recon-map-layer-data";
import type {
  ReconSuggestionContext,
  ReconSuggestionDraft,
  ReconViewerCategory,
} from "@/components/recon-map-viewer-types";
import type { ActionState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Send, X } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

const initialState: ActionState = {
  ok: false,
  message: "",
};

type ReconMapSuggestionFormProps = {
  context: ReconSuggestionContext;
  categories: ReconViewerCategory[];
  draft: ReconSuggestionDraft;
  onClose: () => void;
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
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-cyan-300 px-4 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.24)] transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Send className="size-4" aria-hidden="true" />
      {pending ? "Sending..." : "Send for review"}
    </button>
  );
}

export function ReconMapSuggestionForm({
  context,
  categories,
  draft,
  onClose,
}: ReconMapSuggestionFormProps) {
  const [state, formAction] = useActionState(
    submitPublicReconMarkerSuggestion,
    initialState,
  );
  const initialCategory = useMemo(
    () =>
      draft.targetMarker?.category ||
      categories.find((category) => category.defaultVisible)?.key ||
      categories[0]?.key ||
      "poi",
    [categories, draft.targetMarker?.category],
  );
  const [category, setCategory] = useState(initialCategory);

  const activeCategory =
    categories.find((item) => item.key === category) || categories[0];
  const title =
    draft.type === "marker_correction"
      ? "Suggest marker fix"
      : "Suggest new marker";
  const floor = context.floor || draft.targetMarker?.floor || "";
  const markerLabel = draft.targetMarker?.label || "";
  const coordinate = draft.coordinate;

  return (
    <aside
      className="rounded-2xl border border-cyan-300/20 bg-slate-950/85 p-4 shadow-[0_20px_80px_rgba(2,8,23,0.45)] backdrop-blur"
      data-recon-suggestion-form
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Recon suggestion
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{context.mapTitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-9 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-rose-300/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
          aria-label="Close suggestion form"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {state.message ? (
        <div
          className={cn(
            "mt-4 rounded-xl border px-4 py-3 text-sm",
            state.ok
              ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
              : "border-rose-300/40 bg-rose-300/10 text-rose-100",
          )}
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="mt-4 grid gap-4">
        <input type="hidden" name="suggestionType" value={draft.type} />
        <input
          type="hidden"
          name="targetMarkerId"
          value={draft.targetMarker?.id || ""}
        />
        <input type="hidden" name="gameId" value={context.gameId} />
        <input type="hidden" name="mapId" value={context.mapId} />
        <input type="hidden" name="mode" value={context.mode || "campaign"} />
        <input type="hidden" name="variant" value={context.variant || "any"} />
        <input type="hidden" name="floor" value={floor} />
        <input
          type="hidden"
          name="iconKey"
          value={activeCategory?.defaultIconKey || "poi"}
        />
        <input type="hidden" name="x" value={coordinate?.x ?? ""} />
        <input type="hidden" name="y" value={coordinate?.y ?? ""} />

        <div className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-300 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              X
            </p>
            <p className="mt-1 font-mono text-base text-white">
              {coordinate ? formatCoordinate(coordinate.x) : "--"}
            </p>
            <FieldErrors errors={state.fieldErrors?.x} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Y
            </p>
            <p className="mt-1 font-mono text-base text-white">
              {coordinate ? formatCoordinate(coordinate.y) : "--"}
            </p>
            <FieldErrors errors={state.fieldErrors?.y} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Floor
            </p>
            <p className="mt-1 truncate text-base text-white">
              {floor || "Map"}
            </p>
          </div>
        </div>

        {!coordinate ? (
          <p className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Click the map to place the suggested spot.
          </p>
        ) : null}

        {draft.type === "marker_correction" && markerLabel ? (
          <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            <span className="text-slate-500">Target marker</span>
            <span className="mt-1 flex items-center gap-2 text-white">
              <CheckCircle2 className="size-4 text-cyan-200" aria-hidden="true" />
              {markerLabel}
            </span>
          </div>
        ) : null}

        <label>
          <span className="text-sm font-medium text-slate-200">Label</span>
          <input
            name="label"
            defaultValue={markerLabel}
            placeholder="Short marker name"
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.label} />
        </label>

        <label>
          <span className="text-sm font-medium text-slate-200">Category</span>
          <select
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
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
          <span className="text-sm font-medium text-slate-200">
            What should change?
          </span>
          <textarea
            name="description"
            rows={4}
            placeholder="Add the correction, route clue, missing item context, or what needs to be verified."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.description} />
        </label>

        <label>
          <span className="text-sm font-medium text-slate-200">
            Reviewer note optional
          </span>
          <textarea
            name="submitterNote"
            rows={3}
            placeholder="Mention uncertainty, platform/version differences, or why the current marker is wrong."
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.submitterNote} />
        </label>

        <label>
          <span className="text-sm font-medium text-slate-200">
            Source URL optional
          </span>
          <input
            name="sourceUrl"
            type="url"
            placeholder="https://..."
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/20"
          />
          <FieldErrors errors={state.fieldErrors?.sourceUrl} />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-sm text-slate-400">
            {coordinate ? (
              <CheckCircle2 className="size-4 text-emerald-200" aria-hidden="true" />
            ) : (
              <Circle className="size-4 text-slate-500" aria-hidden="true" />
            )}
            Pending review
          </span>
          <SubmitButton disabled={!coordinate} />
        </div>
      </form>
    </aside>
  );
}
