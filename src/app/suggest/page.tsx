import { SuggestionForm } from "@/components/suggestion-form";
import { SecondaryLink, Section, SectionHeading } from "@/components/ui";
import { suggestionReadyVoteThreshold } from "@/lib/config";

export const metadata = {
  title: "Suggest an Update",
  description:
    "Submit Vaexil guide additions or corrections for community votes and review.",
};

export const runtime = "nodejs";

export default function SuggestPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          level={1}
          title="Suggest an addition or correction"
          description="Viewer notes are useful, but they do not become official guide entries automatically. Suggestions remain separate from the guide information shown on the site until Vaexil reviews them."
        />
        <div className="mt-6">
          <SecondaryLink href="/suggestions">
            View community suggestions
          </SecondaryLink>
        </div>
      </Section>
      <Section className="pt-4">
        <SuggestionForm readyVoteThreshold={suggestionReadyVoteThreshold} />
      </Section>
    </>
  );
}
