import { Section, SectionHeading } from "@/components/ui";
import { clipCategories } from "@/data/creator";

export const metadata = {
  title: "Vaexil Clips and Highlights",
  description:
    "Selected Vaexil clips and highlights surface for memorable stream moments, guide-worthy finds, and future curated video references.",
};

export default function ClipsPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Clips and highlights."
          description="A curated place for stream moments worth keeping once real clips are selected. No fake media is published here."
        />
      </Section>
      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="grid gap-4 md:grid-cols-3">
          {clipCategories.map((category) => (
            <div key={category} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <h2 className="text-xl font-semibold text-white">{category}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Reserved for approved clips and highlights when real media is ready.
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
