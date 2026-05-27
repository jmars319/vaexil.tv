import type {
  ReconViewerCategory,
  ReconViewerMarker,
} from "@/components/recon-map-viewer";
import { BookOpen, CheckCircle2, ListChecks, MapPin } from "lucide-react";

type ReconHowToGuidesProps = {
  markers: ReconViewerMarker[];
  categories: ReconViewerCategory[];
  emptyState?: boolean;
};

function getGuideMarkers(markers: ReconViewerMarker[]) {
  return markers.filter((marker) => {
    const detail = marker.detail;

    return Boolean(
      detail?.locationHint ||
        detail?.howToSteps?.length ||
        detail?.requirements?.length ||
        detail?.notes?.length,
    );
  });
}

export function ReconHowToGuides({
  markers,
  categories,
  emptyState = false,
}: ReconHowToGuidesProps) {
  const categoryByKey = new Map(
    categories.map((category) => [category.key, category]),
  );
  const guideMarkers = getGuideMarkers(markers);

  if (guideMarkers.length === 0 && !emptyState) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-cyan-200" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-white">How-to guides</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Quick route, requirement, and completion notes for selected map
            markers.
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
          {guideMarkers.length} guides
        </span>
      </div>

      {guideMarkers.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-white/15 p-4 text-sm text-slate-400">
          No how-to guides have been attached to this map yet.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {guideMarkers.map((marker) => {
            const detail = marker.detail;

            return (
              <article
                key={marker.id}
                className="rounded-xl border border-white/10 bg-slate-950/50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {marker.label}
                    </h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-cyan-100">
                      {categoryByKey.get(marker.category)?.label ||
                        marker.category}
                    </p>
                  </div>
                  {marker.floor ? (
                    <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-300">
                      {marker.floor}
                    </span>
                  ) : null}
                </div>

                {detail?.locationHint ? (
                  <div className="mt-4 flex gap-3">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-cyan-200"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-6 text-slate-300">
                      {detail.locationHint}
                    </p>
                  </div>
                ) : null}

                {detail?.howToSteps?.length ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <ListChecks
                        className="size-4 text-slate-400"
                        aria-hidden="true"
                      />
                      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Steps
                      </h4>
                    </div>
                    <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
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
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="size-4 text-slate-400"
                        aria-hidden="true"
                      />
                      <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Requirements
                      </h4>
                    </div>
                    <ul className="mt-3 grid gap-1.5 text-sm leading-6 text-slate-300">
                      {detail.requirements.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detail?.notes?.length ? (
                  <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Tips
                    </h4>
                    <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-slate-400">
                      {detail.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
