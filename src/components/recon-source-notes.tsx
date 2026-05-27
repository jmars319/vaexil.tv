import type { ReconSourceCrossCheck } from "@/data/recon/source-cross-checks";
import type { ReconSourcePacket } from "@/data/recon/source-packets";
import { ClipboardCheck, ExternalLink, ShieldCheck } from "lucide-react";

type ReconSourceNotesProps = {
  packet: ReconSourcePacket | null;
  crossCheck?: ReconSourceCrossCheck | null;
  publicMode?: boolean;
};

function SourceList({
  title,
  sources,
}: {
  title: string;
  sources: ReconSourcePacket["officialSources"];
}) {
  if (!sources.length) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-3 grid gap-3">
        {sources.map((source) => (
          <li key={`${title}:${source.label}`} className="text-sm leading-6 text-slate-400">
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-cyan-100 transition hover:text-cyan-200"
              >
                {source.label}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : (
              <span className="font-medium text-slate-200">{source.label}</span>
            )}
            <span className="block text-slate-500">{source.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={`${title}:${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ReconSourceNotes({
  packet,
  crossCheck,
  publicMode = false,
}: ReconSourceNotesProps) {
  if (!packet) {
    return null;
  }

  return (
    <aside className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-cyan-200" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-white">Recon source notes</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            {publicMode
              ? "Published Recon notes show source context and uncertainty for this map."
              : "Draft Recon notes are for admin review and coordinate capture. They do not publish markers or claim final map accuracy."}
          </p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
          {packet.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <SourceList title="Official sources" sources={packet.officialSources} />
        <SourceList title="Reference sources" sources={packet.referenceSources} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <BulletList title="Approximate areas" items={packet.approximateAreas} />
        <div>
          <h3 className="text-sm font-semibold text-white">POI candidates</h3>
          <ul className="mt-3 grid gap-3 text-sm leading-6 text-slate-400">
            {packet.poiCandidates.map((candidate) => (
              <li key={`${candidate.category}:${candidate.label}`}>
                <span className="block font-medium text-slate-200">
                  {candidate.label}
                </span>
                <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">
                  {candidate.category} / {candidate.confidence}
                </span>
                <span className="block text-slate-500">{candidate.notes}</span>
              </li>
            ))}
          </ul>
        </div>
        <BulletList title="Do not copy" items={packet.avoidCopying} />
      </div>

      <div className="mt-5">
        <BulletList title="Uncertainty notes" items={packet.uncertaintyNotes} />
      </div>

      {crossCheck ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/45 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-5 text-cyan-200" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white">
                  Source cross-check
                </h3>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                {crossCheck.summary}
              </p>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-300">
              {crossCheck.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="mt-4 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.045] p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                  Visual comparison
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {crossCheck.visualReview.summary}
                </p>
              </div>
              <span className="w-fit rounded-full border border-cyan-300/20 bg-slate-950/60 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                {crossCheck.visualReview.status.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Sources checked
              </h4>
              <ul className="mt-3 grid gap-3">
                {crossCheck.sources.map((source) => (
                  <li
                    key={`${crossCheck.mapId}:${source.label}`}
                    className="text-sm leading-6 text-slate-400"
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-cyan-100 transition hover:text-cyan-200"
                    >
                      {source.label}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                    <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">
                      {source.coverage.replaceAll("_", " ")}
                    </span>
                    <span className="block text-slate-500">{source.notes}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Checks
              </h4>
              <ul className="mt-3 grid gap-3">
                {crossCheck.checks.map((check) => (
                  <li
                    key={`${crossCheck.mapId}:${check.label}`}
                    className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-slate-400"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <span className="font-medium text-slate-200">
                        {check.label}
                      </span>
                      <span className="w-fit rounded-full border border-white/10 bg-slate-950/60 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-300">
                        {check.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Local {check.localValue} / source {check.sourceValue}
                    </p>
                    <p className="mt-1 text-slate-500">{check.notes}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <BulletList
              title="Visual findings"
              items={crossCheck.visualReview.findings}
            />
            <BulletList
              title="Manual review focus"
              items={crossCheck.visualReview.manualReviewFocus}
            />
          </div>

          {crossCheck.warnings.length > 0 ? (
            <div className="mt-4">
              <BulletList title="Cross-check warnings" items={crossCheck.warnings} />
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}
