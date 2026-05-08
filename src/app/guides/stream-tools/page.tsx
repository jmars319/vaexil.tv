import { PrimaryLink, Section, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Tools Mentioned on Stream",
  description:
    "Placeholder area for tools and utilities mentioned on Vaexil streams.",
};

export default function StreamToolsPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Tools mentioned on stream"
          description="A future index for utilities, references, and workflow tools discussed live. The page is ready for real entries without inventing a tool list."
        />
      </Section>
      <Section className="pt-4">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.035] p-8">
          <h2 className="text-xl font-semibold text-white">
            No stream tool entries yet
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Tool entries can be added later with source links, short notes, and
            verification status. Until then, this page stays empty rather than
            presenting fake recommendations.
          </p>
          <div className="mt-6">
            <PrimaryLink href="/suggest">Suggest a stream tool</PrimaryLink>
          </div>
        </div>
      </Section>
    </>
  );
}
