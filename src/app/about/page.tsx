import { PrimaryLink, Section, SectionHeading, SecondaryLink } from "@/components/ui";

export const metadata = {
  title: "About Vaexil",
  description:
    "About Vaexil, a stream and creative project centered on reflective gaming, useful guides, Recon maps, quiet humor, and systems-minded curiosity.",
};

export default function AboutPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="About Vaexil."
          description="Vaexil is a stream and creative project built around reflective gaming, useful guide work, quiet humor, and curiosity about systems, stories, and maps."
        />
      </Section>
      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="max-w-3xl space-y-5 text-base leading-8 text-slate-300">
          <p>
            Vaexil.tv keeps useful parts of the stream easy to find: guides,
            Recon maps, community suggestions, and direct links to watch or get
            in touch.
          </p>
          <p>
            Expect thoughtful games, quiet humor, close attention to atmosphere,
            and the occasional technical side path when it helps explain how
            something works.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <PrimaryLink href="/start-here">Start here</PrimaryLink>
          <SecondaryLink href="/contact">Contact</SecondaryLink>
        </div>
      </Section>
    </>
  );
}
