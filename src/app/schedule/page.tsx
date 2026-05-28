import { Section, SectionHeading } from "@/components/ui";
import { scheduleNotes } from "@/data/creator";

export const metadata = {
  title: "Vaexil Stream Schedule",
  description:
    "Current Vaexil schedule surface for planned streams, event notes, update windows, and future calendar integration.",
};

export default function SchedulePage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Stream schedule."
          description="Streams may shift around life and energy, but this route is the place future planned streams and event notes should land."
        />
      </Section>
      <Section className="border-y border-white/10 bg-white/[0.025]">
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/45 p-8">
          <h2 className="text-xl font-semibold text-white">No public schedule is configured yet.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            This is intentionally honest until a real schedule source is connected.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {scheduleNotes.map((note) => (
            <div key={note} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm leading-6 text-slate-300">
              {note}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
