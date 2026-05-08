import { PrimaryLink, Section, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Mods / Setup",
  description:
    "Placeholder area for verified Vaexil stream setup and mod notes.",
};

export default function ModsSetupPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Mods / Setup"
          description="A future home for verified setup notes, compatibility reminders, and stream configuration references. Nothing here is treated as official until it is reviewed."
        />
      </Section>
      <Section className="pt-4">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.035] p-8">
          <h2 className="text-xl font-semibold text-white">
            No verified setup entries yet
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            This route is intentionally ready before the content is. Additions
            should come through the suggestion workflow or admin-managed guide
            updates so unverified recommendations do not become site facts.
          </p>
          <div className="mt-6">
            <PrimaryLink href="/suggest">Suggest setup notes</PrimaryLink>
          </div>
        </div>
      </Section>
    </>
  );
}
