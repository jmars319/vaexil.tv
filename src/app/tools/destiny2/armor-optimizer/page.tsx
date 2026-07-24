import { ArmorOptimizerConnection } from "@/components/armor-optimizer-connection";
import { Section, SecondaryLink } from "@/components/ui";
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
      <Section className="pb-4 pt-10" style={{ maxWidth: "96rem" }}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Vaexil Gaming · Destiny 2
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Armor Optimizer
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Set bonuses and stat targets on the left. Compare exact builds
              from your owned armor on the right.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryLink href="/guides/destiny2">Destiny 2 guides</SecondaryLink>
            <SecondaryLink href="/tools/destiny2/verity">Verity tool</SecondaryLink>
          </div>
        </div>
      </Section>

      <Section className="pb-10 pt-2" style={{ maxWidth: "96rem" }}>
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
