import { ExternalButton, Section, SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";

export const metadata = {
  title: "Vaexil Stream Schedule",
  description:
    "Current scheduling information for Vaexil streams.",
};

export default function SchedulePage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Stream schedule."
          description="Streams may shift around life and energy. Twitch has the latest live status and channel notifications."
        />
      </Section>
      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/45 p-8">
          <h2 className="text-xl font-semibold text-white">No regular schedule is posted right now.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Follow the Twitch channel to see when Vaexil goes live.
          </p>
          <div className="mt-6">
            <ExternalButton href={siteConfig.links.twitch}>Open Twitch</ExternalButton>
          </div>
        </div>
      </Section>
    </>
  );
}
