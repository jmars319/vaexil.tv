import { destinyRaidGuides } from "@/data/destiny-raid-guides";
import { PrimaryLink, Section, SectionHeading, SecondaryLink } from "@/components/ui";
import { canViewDestinyGuides } from "@/lib/destiny-guide-access";
import { destinyGuideRobots } from "@/lib/destiny-guide-visibility";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Destiny 2 Guides",
  description:
    "Vaexil Destiny 2 guide hub for raid references, encounter breakdowns, assignment tools, and downloadable raid-night resources.",
  robots: destinyGuideRobots(),
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function Destiny2GuidesPage() {
  if (!(await canViewDestinyGuides())) {
    notFound();
  }

  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Destiny 2 guides"
          description="Raid references, assignment tools, source downloads, and encounter notes for Destiny 2."
        />
      </Section>

      <Section className="pt-4">
        <div className="grid gap-4">
          <Link
            href="/guides/destiny2/raids"
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
          >
            <h2 className="text-2xl font-semibold text-white">Raids</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {destinyRaidGuides.length} structured raid guides with encounter
              selectors, assignment boards, checklists, and quick references.
            </p>
          </Link>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryLink href="/guides/destiny2/raids">Open raid guides</PrimaryLink>
          <SecondaryLink href="/guides">Back to guide archive</SecondaryLink>
        </div>
      </Section>
    </>
  );
}
