import { ExternalButton, Section, SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";
import { Radio } from "lucide-react";

export const metadata = {
  title: "Watch Vaexil Live",
  description:
    "Watch Vaexil live on Twitch for reflective gaming, guide work, Recon map checks, quiet humor, and stream-adjacent systems.",
};

export default function LivePage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Watch Vaexil live."
          description="The stream leans toward reflective games, atmosphere, useful reference work, and conversations that have room to breathe."
        />
        <div className="mt-8">
          <ExternalButton href={siteConfig.links.twitch}>
            <Radio className="mr-2 size-4" aria-hidden="true" />
            Open Twitch
          </ExternalButton>
        </div>
      </Section>
      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="grid gap-5 md:grid-cols-3">
          {["Thoughtful games", "Guide and Recon work", "Technical side paths"].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <h2 className="text-xl font-semibold text-white">{item}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                This space is kept simple until live status and embeds are intentionally wired in.
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
