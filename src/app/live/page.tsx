import { ExternalButton, Section, SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";
import { Radio } from "lucide-react";

export const metadata = {
  title: "Watch Vaexil Live",
  description:
    "Watch Vaexil live on Twitch for reflective gaming, guide work, Recon map checks, and quiet humor.",
};

const streamThemes = [
  {
    title: "Thoughtful games",
    description: "Games with atmosphere, interesting systems, and room to explore beyond the obvious path.",
  },
  {
    title: "Guide and Recon work",
    description: "Live research, map checks, and practical notes that can become lasting references.",
  },
  {
    title: "Technical side paths",
    description: "Occasional deep dives into mods, tools, and the details behind how games work.",
  },
];

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
          {streamThemes.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
