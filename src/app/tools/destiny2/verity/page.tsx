/* eslint-disable @next/next/no-img-element */

import {
  getDestinyFashionPayload,
  type DestinyFashionItem,
  type DestinyFashionMember,
  type DestinyFashionPayload,
} from "@/lib/bungie-client";
import { canViewDestinyGuides } from "@/lib/destiny-guide-access";
import { destinyGuideRobots } from "@/lib/destiny-guide-visibility";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Verity Fireteam Lookup",
  description:
    "Vaexil Verity fireteam lookup for class, subclass, power, and ghost-phase identity cards.",
  robots: destinyGuideRobots(),
  alternates: { canonical: "https://vaexil.tv/tools/destiny2/verity" },
};

type VerityToolPageProps = {
  searchParams: Promise<{
    bungieName?: string;
    platform?: string;
  }>;
};

export default async function VerityToolPage({ searchParams }: VerityToolPageProps) {
  if (!(await canViewDestinyGuides())) {
    notFound();
  }

  const params = await searchParams;
  const bungieName = params.bungieName?.trim() ?? "";
  const platform = params.platform ? Number(params.platform) : undefined;
  let payload: DestinyFashionPayload | null = null;
  let error = "";

  if (bungieName) {
    try {
      payload = await getDestinyFashionPayload(
        bungieName,
        Number.isInteger(platform) ? platform : undefined,
      );
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Failed to load Bungie fireteam data.";
    }
  }

  return (
    <main className="min-h-screen bg-[#05070d] text-slate-100">
      <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <Link href="/guides/destiny2/raids/salvations-edge#verity" className="text-sm text-cyan-200 hover:text-cyan-100">
          Back to Salvation&apos;s Edge / Verity
        </Link>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Verity fireteam lookup
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
          Enter a Bungie ID to show the selected Guardian and current fireteam with
          class, subclass, power, and Verity identity items.
        </p>

        <form action="/tools/destiny2/verity" className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Bungie ID
            </span>
            <input
              name="bungieName"
              defaultValue={bungieName}
              placeholder="Grandeur#6967"
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50"
            />
          </label>
          <button
            type="submit"
            className="mt-4 inline-flex rounded-full border border-cyan-300/30 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
          >
            Load fireteam
          </button>
        </form>

        {error ? (
          <p className="mt-6 rounded-xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        {payload ? <FashionResults payload={payload} bungieName={bungieName} /> : null}
      </section>
    </main>
  );
}

function FashionResults({
  payload,
  bungieName,
}: {
  payload: DestinyFashionPayload;
  bungieName: string;
}) {
  return (
    <section className="mt-8 space-y-6">
      <GuardianCard member={payload.selected} label="Selected player" />
      {payload.platforms.length > 1 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Platform
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {payload.platforms.map((platform) => (
              <Link
                key={`${platform.membershipType}-${platform.membershipId}`}
                href={`/tools/destiny2/verity?bungieName=${encodeURIComponent(bungieName)}&platform=${platform.membershipType}`}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
              >
                {platform.iconPath ? (
                  <img src={platform.iconPath} alt="" width={18} height={18} className="mr-2 rounded-full" />
                ) : null}
                {platform.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Current fireteam
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {payload.fireteam.map((member) => (
            <GuardianCard key={`${member.membershipType}-${member.membershipId}`} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GuardianCard({
  member,
  label,
}: {
  member: DestinyFashionMember;
  label?: string;
}) {
  const visibleItems = member.items.filter(isVisibleIdentityItem);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      {label ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>
      ) : null}
      <div className="relative min-h-20 overflow-hidden rounded-xl bg-slate-900">
        {member.emblemBackgroundPath ? (
          <img src={member.emblemBackgroundPath} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="relative bg-gradient-to-r from-black/75 to-black/5 p-4">
          <p className="text-sm font-semibold text-white">{member.displayName}</p>
          <p className="mt-1 text-xs font-medium text-cyan-100">
            {member.className} / {member.subclassName}
            {member.power ? ` / ${member.power}` : ""}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {visibleItems.map((item) => (
          <div key={`${item.slot}-${item.name}`} className="rounded-xl border border-white/10 bg-slate-950/60 p-2">
            <img src={item.icon} alt={item.name} width={96} height={96} className="mx-auto aspect-square rounded object-cover" />
            <p className="mt-2 truncate text-center text-[0.68rem] font-medium text-slate-300" title={item.name}>
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

function isVisibleIdentityItem(item: DestinyFashionItem) {
  return item.slot === "helmet" || item.slot === "classItem" || item.slot === "ghost" || item.isExotic;
}
