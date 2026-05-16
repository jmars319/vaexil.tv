import { siteConfig } from "@/lib/config";
import { Code, MessageCircle, Play, Radio } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Guides", href: "/guides" },
  { label: "Recon", href: "/recon" },
  { label: "Suggest", href: "/suggest" },
  { label: "Suggestions", href: "/suggestions" },
  { label: "VaexCore", href: "/vaexcore" },
  { label: "Contact", href: "/contact" },
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
            src="/brand/vaexil-v-grid.webp"
            alt=""
            width={42}
            height={42}
            className="size-10 rounded-2xl object-cover shadow-[0_0_28px_rgba(0,213,255,0.28)]"
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
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#05070d]">
      <div className="mx-auto w-full max-w-7xl px-4 text-sm text-slate-400 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-10 lg:grid-cols-[1.2fr_0.7fr_1fr_1fr]">
          <div>
            <p className="font-medium text-slate-200">Vaexil.tv</p>
            <p className="mt-1 max-w-2xl">
              Stream references, community suggestions, and future VaexCore
              product notes. Guide entries should be treated as official only
              after admin verification and publishing.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Explore
            </p>
            <nav className="mt-3 space-y-2" aria-label="Vaexil footer navigation">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block transition hover:text-cyan-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Suite
            </p>
            <nav className="mt-3 space-y-3" aria-label="Vaexil suite links">
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
            </nav>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Connect
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Contact goes through the site form, with stream and creator links
              kept separate.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-flex text-slate-300 transition hover:text-cyan-200"
            >
              Contact Vaexil
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
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
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; {currentYear} Vaexil.tv. All rights reserved.</p>
          <nav
            className="flex flex-wrap gap-4"
            aria-label="Vaexil legal and admin links"
          >
            <Link
              href="/privacy"
              className="text-[0.72rem] text-slate-400 transition hover:text-cyan-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[0.72rem] text-slate-400 transition hover:text-cyan-200"
            >
              Terms
            </Link>
            <Link
              href="/admin"
              className="text-[0.72rem] text-slate-500 transition hover:text-cyan-200"
            >
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  );
}
