import { Panel, Section, SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Practical terms for using Vaexil.tv, guide pages, public suggestions, contact forms, and VaexCore product notes.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
  openGraph: {
    title: "Terms | Vaexil.tv",
    description:
      "Practical terms for using Vaexil.tv, guide pages, public suggestions, contact forms, and VaexCore product notes.",
    url: `${siteConfig.url}/terms`,
    siteName: "Vaexil.tv",
    type: "website",
  },
};

const sections = [
  {
    title: "Website use",
    items: [
      "This site provides stream references, guide notes, public suggestion workflows, contact paths, and future VaexCore product information.",
      "You may browse public pages, submit suggestions, vote on community suggestions, and use the contact form for legitimate inquiries.",
      "Do not attempt to access admin-only areas, disrupt site operation, submit abusive content, spam forms, or manipulate votes.",
    ],
  },
  {
    title: "Guides and suggestions",
    items: [
      "Official guide entries are published only after admin review. Pending, ready-for-review, and community suggestions are not official guide data.",
      "Game data, mod information, stream notes, and tool links can change over time and should be checked against current source pages where accuracy matters.",
      "Submitting a suggestion gives Vaexil.tv permission to review, edit, reject, verify, or publish the information as site content.",
    ],
  },
  {
    title: "VaexCore and product notes",
    items: [
      "VaexCore pages may describe planned or future products and should not be treated as a guarantee of release timing, support, or availability.",
      "Any downloadable software, source code, or third-party tool remains governed by its own license, release notes, and terms.",
      "No contact exchange creates a service, sponsorship, promotion, or product agreement unless separately confirmed in writing.",
    ],
  },
  {
    title: "Reliability and limits",
    items: [
      "The site is maintained with reasonable care, but public pages, suggestions, votes, and guide entries may change, move, or become temporarily unavailable.",
      "Information on this site is not legal, security, compliance, or professional advice.",
      "To the extent allowed by law, Vaexil.tv is not responsible for indirect losses from using, relying on, or being unable to access this public website.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Website terms"
          description="These terms cover use of the public Vaexil.tv site, including guides, suggestions, contact forms, and future VaexCore product notes. Product-specific licenses or written agreements control where they apply."
        />
        <p className="mt-4 text-sm text-slate-500">Last updated May 10, 2026.</p>
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
          <h2 className="text-2xl font-semibold text-white">Questions</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            For questions about these terms, use the{" "}
            <Link href="/contact" className="text-cyan-200 hover:text-cyan-100">
              contact form
            </Link>
            . That keeps requests in the reviewed site intake path.
          </p>
        </Panel>
      </Section>
    </>
  );
}
