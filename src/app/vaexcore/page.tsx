import { Section, SectionHeading } from "@/components/ui";
import { Clapperboard, MonitorPlay, SlidersHorizontal } from "lucide-react";

export const metadata = {
  title: "VaexCore",
  description:
    "Future VaexCore product family surface inside the Vaexil.tv creator hub.",
};

const products = [
  {
    title: "VaexCore Studio",
    description:
      "Future creator workflow product for managing stream production, media, and reference systems.",
    icon: MonitorPlay,
  },
  {
    title: "VaexCore Console",
    description:
      "Future control surface for command workflows, admin utilities, and stream-side operations.",
    icon: SlidersHorizontal,
  },
  {
    title: "VaexCore Highlights",
    description:
      "Future highlights pipeline for capturing, organizing, and distributing stream moments.",
    icon: Clapperboard,
  },
];

export default function VaexCorePage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="VaexCore"
          description="VaexCore is a future product family inside Vaexil.tv. It supports the creator hub without replacing the stream identity."
        />
      </Section>

      <Section className="pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          {products.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6"
            >
              <Icon className="size-8 text-fuchsia-200" aria-hidden="true" />
              <h2 className="mt-6 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {description}
              </p>
              <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-slate-500">
                Product details are intentionally deferred.
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
