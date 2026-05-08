import { Section, SectionHeading } from "@/components/ui";
import Image from "next/image";

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
    image: "/brand/vaexcore-studio.webp",
  },
  {
    title: "VaexCore Console",
    description:
      "Future control surface for command workflows, admin utilities, and stream-side operations.",
    image: "/brand/vaexcore-console.webp",
  },
  {
    title: "VaexCore Pulse",
    description:
      "Future signal and highlights surface for capturing, organizing, and distributing stream moments.",
    image: "/brand/vaexcore-pulse.webp",
  },
];

export default function VaexCorePage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_0.78fr] lg:items-center">
          <SectionHeading
            title="VaexCore"
            description="VaexCore is a future product family inside Vaexil.tv. It supports the creator hub without replacing the stream identity."
          />
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <Image
              src="/brand/vaexcore-suite.webp"
              alt="VaexCore Suite neon logo"
              fill
              sizes="(min-width: 1024px) 384px, 90vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </Section>

      <Section className="pt-4">
        <div className="grid gap-4 md:grid-cols-3">
          {products.map(({ title, description, image }) => (
            <article
              key={title}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]"
            >
              <div className="relative aspect-square w-full border-b border-white/10">
                <Image
                  src={image}
                  alt={`${title} neon logo`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {description}
                </p>
                <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-slate-500">
                  Product details are intentionally deferred.
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
