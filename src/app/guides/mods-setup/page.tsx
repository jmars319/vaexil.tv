import {
  activeHitmanMods,
  modFramework,
  problematicHitmanMods,
  type HitmanModEntry,
  type HitmanLoadOrderEntry,
} from "@/data/hitman-mods";
import { Section, SectionHeading } from "@/components/ui";
import { ArrowUpRight, ListOrdered, ShieldAlert, Wrench } from "lucide-react";

export const metadata = {
  title: "Mods / Setup",
  description:
    "Vaexil Hitman World of Assassination mod setup, SMF requirement, load order, and known-bad mods.",
};

export default function ModsSetupPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Mods / Setup"
          description="Current Hitman World of Assassination mod stack used for the stream. Install with Simple Mod Framework, keep the load order intact, and avoid the confirmed problematic pistol-sound mods until they are re-tested."
        />
      </Section>
      <Section className="pt-4">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
            <Wrench className="size-7 text-cyan-200" aria-hidden="true" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Required first
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {modFramework.title}
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-100/75">
              By {modFramework.creator}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {modFramework.summary}
            </p>
            {modFramework.note ? (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {modFramework.note}
              </p>
            ) : null}
            <div className="mt-6">
              <ExternalModLink mod={modFramework} label="Open SMF on NexusMods" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <ListOrdered className="size-7 text-fuchsia-200" aria-hidden="true" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-fuchsia-100">
              Load order
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The list below is shown top to bottom exactly as used. Short
              summaries are condensed from the NexusMods source text so the
              page stays usable during setup.
            </p>
          </div>
        </div>
      </Section>

      <Section className="pt-4">
        <div className="grid gap-3">
          {activeHitmanMods.map((mod) => (
            <LoadOrderCard key={`${mod.loadOrder}-${mod.title}`} mod={mod} />
          ))}
        </div>
      </Section>

      <Section className="pt-4">
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/[0.06] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <ShieldAlert className="size-7 text-rose-200" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-semibold text-white">
                Confirmed problematic
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                These are linked for reference, but they are not recommended in
                the current setup because they broke the game during testing.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {problematicHitmanMods.map((mod) => (
              <ProblematicModCard key={mod.title} mod={mod} />
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

function LoadOrderCard({ mod }: { mod: HitmanLoadOrderEntry }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
              {mod.loadOrder}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
              {mod.category}
            </span>
            {mod.status === "temporary" ? (
              <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs font-medium text-amber-100">
                Temporary
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-xl font-semibold leading-tight text-white">
            {mod.title}
          </h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            By {mod.creator}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{mod.summary}</p>
          {mod.note ? (
            <p className="mt-2 text-sm leading-6 text-amber-100/85">
              {mod.note}
            </p>
          ) : null}
        </div>
        <ExternalModLink mod={mod} label="NexusMods" />
      </div>
    </article>
  );
}

function ProblematicModCard({ mod }: { mod: HitmanModEntry }) {
  return (
    <article className="rounded-xl border border-rose-300/20 bg-slate-950/50 p-5">
      <span className="rounded-full border border-rose-300/40 bg-rose-300/10 px-2.5 py-1 text-xs font-medium text-rose-100">
        {mod.category}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-white">{mod.title}</h3>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-rose-100/60">
        By {mod.creator}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{mod.summary}</p>
      {mod.note ? (
        <p className="mt-2 text-sm leading-6 text-rose-100/85">{mod.note}</p>
      ) : null}
      <div className="mt-5">
        <ExternalModLink mod={mod} label="Reference page" />
      </div>
    </article>
  );
}

function ExternalModLink({
  mod,
  label,
}: {
  mod: HitmanModEntry;
  label: string;
}) {
  return (
    <a
      href={mod.sourceUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/[0.12] px-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/70"
    >
      {label}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}
