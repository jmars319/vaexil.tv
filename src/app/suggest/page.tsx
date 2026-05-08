import { SuggestionForm } from "@/components/suggestion-form";
import { Section, SectionHeading } from "@/components/ui";
import { suggestionReadyVoteThreshold } from "@/lib/config";

export const metadata = {
  title: "Suggest an Update",
  description:
    "Submit Vaexil guide additions or corrections for community votes and admin review.",
};

export const runtime = "nodejs";

export default function SuggestPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Suggest an addition or correction"
          description="Viewer notes are useful, but they do not become official guide entries automatically. Submissions enter the pending queue and remain separate from published guide data until admin review."
        />
      </Section>
      <Section className="pt-4">
        <SuggestionForm readyVoteThreshold={suggestionReadyVoteThreshold} />
      </Section>
    </>
  );
}
