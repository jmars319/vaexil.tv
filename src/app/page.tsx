import { ExternalButton, PrimaryLink, SecondaryLink, Section } from "@/components/ui";
import { siteConfig } from "@/lib/config";
import {
  BookOpenText,
  Boxes,
  CalendarDays,
  Clapperboard,
  Code,
  MessageCircle,
  Play,
  Radio,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const featureCards = [
    {
      title: "Guides",
      href: "/guides",
      description:
        "A clean archive for verified notes, setup references, and stream knowledge that should be easy to revisit later.",
      icon: BookOpenText,
    },
    {
      title: "VaexCore",
      href: "/vaexcore",
      description:
        "The future product family lives here without replacing Vaexil as the main stream identity.",
      icon: Boxes,
    },
    {
      title: "Clips",
      href: "#clips",
      description:
        "A reserved surface for curated highlights, stream moments, and short-form references when real media is ready.",
      icon: Clapperboard,
    },
    {
      title: "Schedule",
      href: "#schedule",
      description:
        "A simple placeholder for future stream timing, update windows, and event notes.",
      icon: CalendarDays,
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <Image
          src="/brand/vaexil-v-grid.webp"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_78%_24%,rgba(217,70,239,0.2),transparent_30%),linear-gradient(90deg,rgba(5,7,13,0.98)_0%,rgba(5,7,13,0.9)_38%,rgba(5,7,13,0.62)_100%),linear-gradient(180deg,rgba(8,11,20,0.78)_0%,#05070d_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <Section className="relative grid min-h-[calc(100vh-4rem)] items-center gap-12 py-20 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Vaexil.tv
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              A stable home base for the stream: guide archives, viewer
              suggestions, tool references, and the future VaexCore product
              surface.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/guides">Browse guides</PrimaryLink>
              <SecondaryLink href="/suggest">Suggest an update</SecondaryLink>
              <SecondaryLink href="/contact">Contact</SecondaryLink>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <ExternalButton href={siteConfig.links.twitch}>
                <Radio className="mr-2 size-4" aria-hidden="true" />
                Twitch
              </ExternalButton>
              <ExternalButton href={siteConfig.links.youtube}>
                <Play className="mr-2 size-4" aria-hidden="true" />
                YouTube
              </ExternalButton>
              <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-slate-500">
                <MessageCircle className="mr-2 size-4" aria-hidden="true" />
                Discord
              </span>
              <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-slate-500">
                <Code className="mr-2 size-4" aria-hidden="true" />
                GitHub
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-8 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/[0.12] bg-slate-950/60 p-6 shadow-[0_28px_100px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/brand/vaexil-v-grid.webp"
                    alt="Vaexil V mark"
                    width={56}
                    height={56}
                    className="size-14 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">Stream hub</p>
                    <p className="text-sm text-slate-400">Guides stay verified.</p>
                  </div>
                </div>
                <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                  v0.1
                </span>
              </div>
              <div className="space-y-3 pt-5">
                {[
                  "Submitted",
                  "Pending",
                  "Ready for review",
                  "Verified",
                  "Published",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-white/[0.08] text-sm font-semibold text-cyan-100">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-200">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map(({ title, href, description, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              <Icon className="size-6 text-cyan-200" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="clips" className="border-y border-white/10 bg-white/[0.025]">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Clips and stream references
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              This area is ready for curated clips later. For now it stays
              intentionally empty instead of inventing media or fake community
              activity.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/45 p-8 text-sm text-slate-400">
            No clips have been published yet.
          </div>
        </div>
      </Section>

      <Section id="schedule">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Schedule surface
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              A lightweight schedule block is reserved for future live plans,
              event notes, and updates once there is real schedule data to show.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <p className="text-sm font-medium text-slate-200">Current state</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              No public schedule has been configured.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
