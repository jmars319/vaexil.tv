import { ArmorOptimizerConnection } from "@/components/armor-optimizer-connection";
import { Section, SectionHeading, SecondaryLink } from "@/components/ui";
import { destinyGuideRobots } from "@/lib/destiny-guide-visibility";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Destiny 2 Armor Optimizer",
  description:
    "Calculate exact Destiny 2 armor builds from owned gear while preserving selected Exotics and armor-set bonuses.",
  robots: destinyGuideRobots(),
  alternates: { canonical: "https://vaexil.tv/tools/destiny2/armor-optimizer" },
};

type ArmorOptimizerPageProps = {
  searchParams: Promise<{
    bungie?: string | string[];
    class?: string | string[];
    exotic?: string | string[];
    set?: string | string[];
    set2?: string | string[];
    targetWeapons?: string | string[];
    targetHealth?: string | string[];
    targetClass?: string | string[];
    targetGrenade?: string | string[];
    targetSuper?: string | string[];
    targetMelee?: string | string[];
  }>;
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
  const params = await searchParams;
  const getParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const bungie = getParam(params.bungie);
  const selection = {
    className: getParam(params.class),
    exotic: getParam(params.exotic),
    set: getParam(params.set),
    set2: getParam(params.set2),
    targets: {
      weapons: getParam(params.targetWeapons),
      health: getParam(params.targetHealth),
      class: getParam(params.targetClass),
      grenade: getParam(params.targetGrenade),
      super: getParam(params.targetSuper),
      melee: getParam(params.targetMelee),
    },
  };

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
            description="Choose armor bonuses, set minimum stat targets, and inspect the exact owned pieces behind every conditional maximum."
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <SecondaryLink href="/guides/destiny2">Destiny 2 guides</SecondaryLink>
          <SecondaryLink href="/tools/destiny2/verity">Verity tool</SecondaryLink>
        </div>
      </Section>

      <Section className="pt-4">
        <Suspense fallback={<ArmorOptimizerLoading />}>
          <ArmorOptimizerConnection
            notice={bungie ? oauthNotices[bungie] : undefined}
            selection={selection}
          />
        </Suspense>
      </Section>
    </>
  );
}

function ArmorOptimizerLoading() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <div className="h-3 w-28 animate-pulse rounded-full bg-cyan-300/20" />
      <div className="mt-5 h-8 w-64 max-w-full animate-pulse rounded-lg bg-white/10" />
      <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-white/[0.06]" />
      <p className="sr-only">Loading Bungie armor inventory</p>
    </div>
  );
}
