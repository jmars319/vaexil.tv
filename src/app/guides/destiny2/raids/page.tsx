import { destinyRaidGuides } from "@/data/destiny-raid-guides";
import { PrimaryLink, Section, SectionHeading, SecondaryLink } from "@/components/ui";
import { canViewDestinyGuides } from "@/lib/destiny-guide-access";
import { destinyGuideRobots } from "@/lib/destiny-guide-visibility";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Destiny 2 Raid Guides",
  description:
    "Vaexil Destiny 2 raid guide archive with Last Wish, Salvation's Edge, and The Desert Perpetual Normal and Epic encounter references.",
  robots: destinyGuideRobots(),
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Destiny2RaidGuidesPage() {
  if (!(await canViewDestinyGuides())) {
    notFound();
  }

  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Destiny 2 raid guides"
          description="Raid references, source packets, and live pull tools for Destiny 2 fireteams."
        />
      </Section>

      <Section className="pt-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {destinyRaidGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={guide.href}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              <h2 className="text-xl font-semibold text-white">{guide.shortTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{guide.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {guide.stats.slice(0, 2).map((stat) => (
                  <span
                    key={stat.label}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300"
                  >
                    {stat.value}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="pt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <PrimaryLink href={destinyRaidGuides[0].href}>Open first guide</PrimaryLink>
          <SecondaryLink href="/guides/destiny2">Destiny 2 hub</SecondaryLink>
        </div>
      </Section>
    </>
  );
}
