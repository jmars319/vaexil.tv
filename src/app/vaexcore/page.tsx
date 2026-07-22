import { PrimaryLink, Section, SectionHeading, SecondaryLink } from "@/components/ui";
import Image from "next/image";

export const metadata = {
  title: "VaexCore",
  description: "Current availability information for VaexCore.",
};

export default function VaexCorePage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_0.78fr] lg:items-center">
          <SectionHeading
            level={1}
            title="VaexCore"
            description="VaexCore is not currently available as a public product or service."
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
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <h2 className="text-xl font-semibold text-white">What is available now</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Vaexil.tv currently offers stream links, guides, community suggestions,
            and Recon map references.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PrimaryLink href="/recon">Explore Recon</PrimaryLink>
            <SecondaryLink href="/guides">Browse guides</SecondaryLink>
          </div>
        </div>
      </Section>
    </>
  );
}
