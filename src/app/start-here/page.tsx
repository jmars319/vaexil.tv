import { PrimaryLink, Section, SectionHeading, SecondaryLink } from "@/components/ui";
import { startHereSections } from "@/data/creator";

export const metadata = {
  title: "Start Here",
  description:
    "A new-viewer starting point for Vaexil streams, Recon maps, guides, and community suggestions.",
};

export default function StartHerePage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Start here."
          description="A quick introduction for new viewers and returning visitors who want to see what Vaexil.tv offers."
        />
      </Section>
      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="grid gap-4 md:grid-cols-2">
          {startHereSections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{section.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryLink href="/recon">Open Recon</PrimaryLink>
          <SecondaryLink href="/guides">Browse guides</SecondaryLink>
        </div>
      </Section>
    </>
  );
}
