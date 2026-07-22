import { PrimaryLink, Section, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Tools Mentioned on Stream",
  description: "Tools and utilities recommended during Vaexil streams.",
};

export default function StreamToolsPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Tools mentioned on stream"
          description="There are no reviewed tool recommendations here right now."
        />
      </Section>
      <Section className="pt-4">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.035] p-8">
          <h2 className="text-xl font-semibold text-white">
            No stream tool entries yet
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            If a tool mentioned on stream would be useful to others, send its
            name and source link for consideration.
          </p>
          <div className="mt-6">
            <PrimaryLink href="/suggest">Suggest a stream tool</PrimaryLink>
          </div>
        </div>
      </Section>
    </>
  );
}
