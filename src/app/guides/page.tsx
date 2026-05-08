import { PrimaryLink, Section, SectionHeading } from "@/components/ui";
import { BookOpenText, Boxes, Wrench } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Guides",
  description:
    "Vaexil guide hub for verified stream notes, setup references, and future tool documentation.",
};

const guideCards = [
  {
    title: "Hitman Freelancer Free Items",
    href: "/guides/freelancer-free-items",
    description:
      "A searchable table structure for verified item notes. Current rows are intentionally fictional seed data.",
    icon: BookOpenText,
  },
  {
    title: "Mods / Setup",
    href: "/guides/mods-setup",
    description:
      "Reserved for installation notes, compatibility reminders, and stream setup references once verified.",
    icon: Wrench,
  },
  {
    title: "Tools mentioned on stream",
    href: "/guides/stream-tools",
    description:
      "A future index for utilities discussed live, kept separate from official guide facts.",
    icon: Boxes,
  },
];

export default function GuidesPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Guide archive"
          description="A practical knowledge base for stream references. Official entries should stay narrow, searchable, and verified instead of becoming a pile of unreviewed notes."
        />
      </Section>

      <Section className="pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          {guideCards.map(({ title, href, description, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-cyan-300/40 hover:bg-white/[0.06]"
            >
              <Icon className="size-7 text-cyan-200" aria-hidden="true" />
              <h2 className="mt-6 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="mods-setup" className="border-y border-white/10 bg-white/[0.025]">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">Mods / Setup</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              This section is intentionally placeholder-only until real setup
              notes are approved. It exists so the IA is ready without
              pretending to know the final recommendations.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-slate-400">
            No verified setup entries yet.
          </div>
        </div>
      </Section>

      <Section id="stream-tools">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Tools mentioned on stream
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Future tools can be listed here with links, categories, and short
              notes once they are intentionally selected.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-slate-400">
            No stream tool entries yet.
          </div>
        </div>
        <div className="mt-10">
          <PrimaryLink href="/suggest">Suggest a guide correction</PrimaryLink>
        </div>
      </Section>
    </>
  );
}
