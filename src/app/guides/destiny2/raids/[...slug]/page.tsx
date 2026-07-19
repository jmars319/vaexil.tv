import { DestinyRaidGuide } from "@/components/destiny-raid-guide";
import { destinyRaidGuides, getDestinyRaidGuide } from "@/data/destiny-raid-guides";
import { canViewDestinyGuides } from "@/lib/destiny-guide-access";
import { destinyGuideRobots } from "@/lib/destiny-guide-visibility";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type RaidGuidePageProps = {
  params: Promise<{ slug: string[] }>;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function generateStaticParams() {
  return destinyRaidGuides.map((guide) => ({ slug: guide.path }));
}

export async function generateMetadata({ params }: RaidGuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getDestinyRaidGuide(slug);

  if (!guide) {
    return {
      title: "Raid Guide Not Found",
      robots: { index: false },
    };
  }

  return {
    title: guide.title,
    description: guide.description,
    robots: destinyGuideRobots(),
    alternates: { canonical: `https://vaexil.tv${guide.href}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `https://vaexil.tv${guide.href}`,
      type: "article",
      images: [
        {
          url: "https://vaexil.tv/brand/vaexil/og-image.png",
          width: 1200,
          height: 630,
          alt: "Vaexil",
        },
      ],
    },
  };
}

export default async function RaidGuidePage({ params }: RaidGuidePageProps) {
  const { slug } = await params;
  const guide = getDestinyRaidGuide(slug);

  if (!guide || !(await canViewDestinyGuides())) {
    notFound();
  }

  return <DestinyRaidGuide guide={guide} />;
}
