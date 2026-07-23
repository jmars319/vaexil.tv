import { ArmorOptimizerConnection } from "@/components/armor-optimizer-connection";
import { Section, SectionHeading, SecondaryLink } from "@/components/ui";
import { destinyGuideRobots } from "@/lib/destiny-guide-visibility";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Destiny 2 Armor Optimizer",
  description:
    "Connect a Bungie account to import Destiny 2 armor and prepare exact peak-stat optimization on Vaexil.tv.",
  robots: destinyGuideRobots(),
  alternates: { canonical: "https://vaexil.tv/tools/destiny2/armor-optimizer" },
};

type ArmorOptimizerPageProps = {
  searchParams: Promise<{ bungie?: string }>;
};

const oauthNotices: Record<string, string> = {
  denied: "Bungie authorization was canceled. Nothing was connected.",
  expired: "Your Bungie connection expired. Connect again to continue.",
  "invalid-state": "The Bungie sign-in expired or could not be verified. Please try again.",
  "exchange-failed": "Bungie could not finish the connection. Please try again.",
};

export default async function ArmorOptimizerPage({
  searchParams,
}: ArmorOptimizerPageProps) {
  const { bungie } = await searchParams;

  return (
    <>
      <Section className="pb-8 pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Vaexil Gaming · Destiny 2
        </p>
        <div className="mt-4">
          <SectionHeading
            level={1}
            title="Armor Optimizer"
            description="Import your live inventory first. Then Vaexil can rank the true highest stat peaks around the exotic and armor set bonuses you choose."
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <SecondaryLink href="/guides/destiny2">Destiny 2 guides</SecondaryLink>
          <SecondaryLink href="/tools/destiny2/verity">Verity tool</SecondaryLink>
        </div>
      </Section>

      <Section className="pt-4">
        <ArmorOptimizerConnection notice={bungie ? oauthNotices[bungie] : undefined} />
      </Section>

      <Section className="pt-2">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Choose constraints",
              body: "Select class, exotic, armor set bonuses, and any pieces that must stay in the build.",
            },
            {
              step: "02",
              title: "See real peaks",
              body: "Calculate the absolute maximum for every stat before you spend time tuning target bars.",
            },
            {
              step: "03",
              title: "Allocate mods",
              body: "Keep base armor stats visible and add or accept a suggested stat mod for each valid slot.",
            },
          ].map((item) => (
            <article key={item.step} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="font-mono text-xs text-cyan-200">{item.step}</p>
              <h2 className="mt-3 text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
