import type { ReconSourcePacket } from "@/data/recon/source-packets";
import { ExternalLink, ShieldCheck } from "lucide-react";

type ReconSourceNotesProps = {
  packet: ReconSourcePacket | null;
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
    </aside>
  );
}
