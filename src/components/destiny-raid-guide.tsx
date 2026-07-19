import { RaidCockpit } from "@/components/destiny-raid-cockpit";
import { VeritySolverTool } from "@/components/verity-solver-tool";
import type { RaidGuide, RaidGuideEncounter } from "@/data/destiny-raid-guides";
import Link from "next/link";

export function DestinyRaidGuide({ guide }: { guide: RaidGuide }) {
  const hasVerityTool = guide.encounters.some(
    (encounter) => encounter.interactiveTool === "verity",
  );

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-400">
            <Link href="/guides" className="transition hover:text-cyan-200">
              Guides
            </Link>
            <span>/</span>
            <Link href="/guides/destiny2" className="transition hover:text-cyan-200">
              Destiny 2
            </Link>
            <span>/</span>
            <Link href="/guides/destiny2/raids" className="transition hover:text-cyan-200">
              Raids
            </Link>
          </div>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            {guide.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {guide.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 text-lg font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <RaidDashboard guide={guide} />

      <RaidCockpit
        guideSlug={guide.slug}
        encounters={guide.encounters}
        pullChecklist={guide.pullChecklist}
        quickReferences={guide.quickReferences}
        selectedEncounterTool={hasVerityTool ? <VeritySolverTool key="verity-tool" /> : null}
      />

      <section id="encounter-library" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Encounter library
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Objectives, phase rhythm, pressure points, recoveries, and loadout intent.
            </p>
          </div>
          <div className="grid gap-4">
            {guide.encounters.map((encounter) => (
              <EncounterArticle key={encounter.slug} encounter={encounter} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function RaidDashboard({ guide }: { guide: RaidGuide }) {
  const hasVerityTool = guide.encounters.some(
    (encounter) => encounter.interactiveTool === "verity",
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Raid dashboard
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          Overview and source packet
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guide.systems.map((system) => (
          <article key={system.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <h3 className="text-xl font-semibold text-white">{system.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{system.body}</p>
          </article>
        ))}
        <article className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-6">
          <h3 className="text-xl font-semibold text-white">Source packet</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {guide.sourcePacket}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={guide.sourceDownload.href}
              download
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
            >
              {guide.sourceDownload.label}
            </a>
            {hasVerityTool ? (
              <a
                href="/tools/destiny2/verity"
                className="inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
              >
                Bungie fireteam lookup
              </a>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}

function EncounterArticle({ encounter }: { encounter: RaidGuideEncounter }) {
  return (
    <article id={encounter.slug} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
      <h3 className="text-2xl font-semibold text-white">{encounter.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{encounter.summary}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TextList title="Phase rhythm" items={encounter.rhythm} />
        <TextList title="Pressure points" items={encounter.pressure} />
        <TextList title="Recoveries" items={encounter.recoveries} />
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Loadout intent
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">{encounter.loadout}</p>
        </div>
        {encounter.externalTools?.map((tool) => (
          <div
            key={tool.href}
            className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 md:col-span-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  External helper
                </p>
                <h4 className="mt-2 text-lg font-semibold text-white">{tool.title}</h4>
              </div>
              <a
                href={tool.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
              >
                Open tool
              </a>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{tool.body}</p>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Plain English
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
                {tool.plainEnglish.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-slate-500">
              {tool.caution}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function TextList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-300" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
