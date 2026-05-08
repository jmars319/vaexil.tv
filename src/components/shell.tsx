import { siteConfig } from "@/lib/config";
import { Code, MessageCircle, Play, Radio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Guides", href: "/guides" },
  { label: "Suggestions", href: "/suggestions" },
  { label: "VaexCore", href: "/vaexcore" },
];

const suiteLinks = [
  {
    label: "JAMARQ Digital",
    href: "https://jamarq.digital",
    description: "Websites, rebuilds, online presence, and web systems.",
  },
  {
    label: "Tenra.dev",
    href: "https://tenra.dev",
    description: "Software products, internal tools, and local-first systems.",
  },
];

const social = [
  {
    label: "Twitch",
    href: siteConfig.links.twitch,
    icon: Radio,
  },
  {
    label: "YouTube",
    href: siteConfig.links.youtube,
    icon: Play,
  },
  {
    label: "Discord",
    href: siteConfig.links.discord,
    icon: MessageCircle,
  },
  {
    label: "GitHub",
    href: siteConfig.links.github,
    icon: Code,
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070d]/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          className="flex w-fit items-center gap-3 rounded-full outline-none ring-cyan-300/60 transition focus-visible:ring-2"
        >
          <Image
            src="/brand/vaexil-v.png"
            alt=""
            width={42}
            height={42}
            className="size-10 rounded-2xl shadow-[0_0_28px_rgba(0,213,255,0.28)]"
            priority
          />
          <span className="text-base font-semibold tracking-[0.18em] text-white">
            VAEXIL.TV
          </span>
        </Link>
        <nav
          className="flex flex-wrap items-center gap-1 text-sm text-slate-300"
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#05070d]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-slate-400 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_1fr] lg:px-8">
        <div>
          <p className="font-medium text-slate-200">Vaexil.tv</p>
          <p className="mt-1 max-w-2xl">
            Stream references, community suggestions, and future VaexCore
            product notes. Guide entries should be treated as official only
            after admin verification and publishing.
          </p>
          <Link
            href="/admin"
            className="mt-3 inline-flex text-[0.7rem] text-slate-500 transition hover:text-cyan-200"
          >
            Admin
          </Link>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Suite
          </p>
          <div className="mt-3 space-y-3">
            {suiteLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:text-cyan-200"
              >
                <span className="block font-medium text-slate-300">
                  {item.label}
                </span>
                <span className="block max-w-xs text-xs leading-5 text-slate-500">
                  {item.description}
                </span>
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {social.map(({ label, href, icon: Icon }) =>
            href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-slate-300 transition hover:border-cyan-300/50 hover:text-white"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </a>
            ) : (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-3 py-2 text-slate-500"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </span>
            ),
          )}
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
