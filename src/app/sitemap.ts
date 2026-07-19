import { siteConfig } from "@/lib/config";
import { destinyRaidGuides } from "@/data/destiny-raid-guides";
import { destinyGuidesArePublic } from "@/lib/destiny-guide-visibility";
import type { MetadataRoute } from "next";

const baseRoutes = [
  "",
  "/live",
  "/schedule",
  "/clips",
  "/about",
  "/start-here",
  "/guides",
  "/guides/freelancer-free-items",
  "/guides/mods-setup",
  "/guides/stream-tools",
  "/recon",
  "/recon/hitman",
  "/recon/sniper-elite-5",
  "/recon/sniper-elite-resistance",
  "/suggest",
  "/suggestions",
  "/vaexcore",
  "/contact",
  "/privacy",
  "/terms",
];

const contentRefreshDate = new Date("2026-07-13");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = destinyGuidesArePublic()
    ? [
        ...baseRoutes,
        "/guides/destiny2",
        "/guides/destiny2/raids",
        "/tools/destiny2/verity",
        ...destinyRaidGuides.map((guide) => guide.href),
      ]
    : baseRoutes;

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: contentRefreshDate,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/privacy" || route === "/terms" ? 0.4 : 0.7,
  }));
}
