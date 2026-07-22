import { ExternalButton, Section, SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";

export const metadata = {
  title: "Vaexil Clips and Highlights",
  description:
    "Vaexil clips, highlights, and videos from the stream.",
};

export default function ClipsPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Clips and highlights."
          description="Selected stream moments and longer videos will appear here when available."
        />
      </Section>
      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/45 p-8">
          <h2 className="text-xl font-semibold text-white">No highlights are posted here yet.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Visit YouTube for available Vaexil videos.
          </p>
          <div className="mt-6">
            <ExternalButton href={siteConfig.links.youtube}>Open YouTube</ExternalButton>
          </div>
        </div>
      </Section>
    </>
  );
}
