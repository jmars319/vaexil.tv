import { Panel, Section, SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Vaexil.tv handles contact form submissions, community suggestion votes, lightweight analytics, and service providers.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
  openGraph: {
    title: "Privacy | Vaexil.tv",
    description:
      "How Vaexil.tv handles contact form submissions, community suggestion votes, lightweight analytics, and service providers.",
    url: `${siteConfig.url}/privacy`,
    siteName: "Vaexil.tv",
    type: "website",
  },
};

const sections = [
  {
    title: "Information collected",
    items: [
      "Contact form submissions can include your name, email address, organization, inquiry type, and message.",
      "Community suggestions include guide correction details and an optional source URL.",
      "Suggestion votes use a first-party cookie to reduce duplicate voting without requiring a login.",
      "Lightweight first-party analytics record public page paths and referrers. The first-party tracker respects browser Do Not Track signals.",
    ],
  },
  {
    title: "How it is used",
    items: [
      "Contact details are used to review collaborations, promotions, stream questions, and VaexCore conversations.",
      "Community suggestions and votes help prioritize guide review, but admin approval is required before anything becomes official.",
      "Analytics help identify useful pages, broken routes, and performance issues.",
    ],
  },
  {
    title: "Service providers",
    items: [
      "The site is hosted on Vercel or a comparable Git-based hosting platform.",
      "Guide data, suggestions, votes, contact records, admin settings, and lightweight analytics can be stored in Turso/libSQL.",
      "Contact notifications can be sent through SendGrid when email delivery is configured.",
    ],
  },
  {
    title: "Retention and control",
    items: [
      "Contact records and suggestions are kept as long as they are useful for review, support, records, or follow-up.",
      "You can use the contact form to ask for a correction or deletion of a prior submission.",
      "Admin access is protected and is not intended for public indexing.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Privacy and data handling"
          description="This page describes the current Vaexil.tv site behavior. Public contact, guide suggestions, votes, and analytics are intentionally lightweight for this first production version."
        />
        <p className="mt-4 text-sm text-slate-500">Last updated May 9, 2026.</p>
      </Section>

      <Section className="pt-4">
        <div className="grid gap-5">
          {sections.map((section) => (
            <Panel key={section.title} className="p-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-white">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-cyan-200">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>

        <Panel className="mt-5 p-5 sm:p-6">
          <h2 className="text-2xl font-semibold text-white">Contact path</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            For privacy questions or data requests, use the{" "}
            <Link href="/contact" className="text-cyan-200 hover:text-cyan-100">
              contact form
            </Link>
            . That keeps requests in the same reviewed intake path as the rest
            of the site.
          </p>
        </Panel>
      </Section>
    </>
  );
}
