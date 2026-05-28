import { ExternalButton, PrimaryLink, SecondaryLink, Section } from "@/components/ui";
import { continuityRoutes, hubCards } from "@/data/creator";
import { siteConfig } from "@/lib/config";
import { MessageCircle, Play, Radio, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Vaexil",
    url: siteConfig.url,
    description: siteConfig.description,
    isPartOf: {
      "@type": "WebSite",
      url: siteConfig.url,
      name: "Vaexil.tv",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative overflow-hidden border-b border-white/10">
        <Image
          src="/brand/vaexil-signal-field.svg"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,7,13,0.99)_0%,rgba(5,7,13,0.88)_42%,rgba(5,7,13,0.62)_100%),radial-gradient(circle_at_72%_26%,rgba(217,70,239,0.18),transparent_34%),radial-gradient(circle_at_32%_70%,rgba(34,211,238,0.18),transparent_30%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
        <Section className="relative grid min-h-[calc(100vh-4rem)] items-center gap-12 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-semibold tracking-tight text-white sm:text-7xl lg:text-8xl">
              Vaexil
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Stream hub, guide archive, Recon maps, clips, schedule, suggestions, and VaexCore.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              A home base for reflective gaming, useful references, map work, and stream-adjacent systems that should survive after the live feed moves on.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/recon">Open Recon</PrimaryLink>
              <ExternalButton href={siteConfig.links.twitch}>
                <Radio className="mr-2 size-4" aria-hidden="true" />
                Watch live
              </ExternalButton>
              <SecondaryLink href="/guides">Browse guides</SecondaryLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-10 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-slate-950/72 shadow-[0_28px_110px_rgba(0,0,0,0.52)]">
              <div className="grid border-b border-white/10 md:grid-cols-[1fr_0.85fr]">
                <div className="relative min-h-72">
                  <Image
                    src="/brand/vaexil-signal-field.svg"
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 360px, 90vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/brand/vaexil-mark.svg"
                      alt="Vaexil"
                      width={180}
                      height={180}
                      className="size-44 drop-shadow-[0_0_30px_rgba(34,211,238,0.38)]"
                    />
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  {["Recon map notes", "Guide corrections", "Clip queue", "VaexCore planning"].map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-3">
                <Link href="/recon" className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4 text-sm font-semibold text-cyan-100">
                  Recon
                </Link>
                <Link href="/clips" className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-4 text-sm font-semibold text-fuchsia-100">
                  Clips
                </Link>
                <Link href="/schedule" className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm font-semibold text-slate-200">
                  Schedule
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {hubCards.map(({ title, href, description, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              <Icon className="size-6 text-cyan-200" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              The site should still work when the stream is offline.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Vaexil.tv connects the live channel to the things worth keeping: guides, maps, clips, schedule notes, suggestions, and tools that become part of the stream workflow.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {continuityRoutes.map(({ title, href, description, icon: Icon }) => (
              <Link key={title} href={href} className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 transition hover:border-fuchsia-300/40">
                <Icon className="size-6 text-fuchsia-200" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Recon is the first real expansion surface.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Maps, source notes, marker reviews, private/public asset states, and guide-friendly detail all live under Recon. The public route stays review-driven instead of copying third-party guide pages.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink href="/recon">Explore Recon</PrimaryLink>
              <SecondaryLink href="/suggest">Suggest a correction</SecondaryLink>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <div className="grid gap-3">
              {["HITMAN: WOA drafts", "Sniper Elite 5 maps", "Sniper Elite: Resistance maps", "Private review assets"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-t border-white/10 bg-white/[0.025]">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Sparkles className="size-8 text-cyan-200" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">
              VaexCore stays adjacent, not confusing.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              VaexCore is the future creator-operations family for stream tools, local controls, and review workflows. Vaexil remains the public creator home.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ExternalButton href={siteConfig.links.twitch}>
              <Play className="mr-2 size-4" aria-hidden="true" />
              Twitch
            </ExternalButton>
            <ExternalButton href={siteConfig.links.youtube}>
              <Play className="mr-2 size-4" aria-hidden="true" />
              YouTube
            </ExternalButton>
            {siteConfig.links.discord ? (
              <ExternalButton href={siteConfig.links.discord}>
                <MessageCircle className="mr-2 size-4" aria-hidden="true" />
                Discord
              </ExternalButton>
            ) : null}
            <SecondaryLink href="/contact">Contact</SecondaryLink>
          </div>
        </div>
      </Section>
    </>
  );
}
