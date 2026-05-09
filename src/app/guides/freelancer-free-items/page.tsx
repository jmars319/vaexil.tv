import { GuideTable } from "@/components/guide-table";
import { PrimaryLink, SecondaryLink, Section, SectionHeading } from "@/components/ui";
import { listOfficialItems } from "@/lib/repository";

export const metadata = {
  title: "Hitman Freelancer Free Items Guide",
  description:
    "Searchable Vaexil guide table for verified Hitman Freelancer free item locations, categories, and notes.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function FreelancerFreeItemsPage() {
  const items = await listOfficialItems();

  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            title="Freelancer free items"
            description={`${items.length} verified official guide rows for free Freelancer items, weapons, tools, and Merces sources. Search by item, map, location, category, or notes.`}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/suggest">Suggest an item</PrimaryLink>
            <SecondaryLink href="/suggestions">Community suggestions</SecondaryLink>
          </div>
        </div>
      </Section>
      <Section className="pt-4">
        <GuideTable items={items} />
      </Section>
    </>
  );
}
