import { siteConfig } from "@/lib/config";
import type { MetadataRoute } from "next";

const routes = [
  "",
  "/guides",
  "/guides/freelancer-free-items",
  "/guides/mods-setup",
  "/guides/stream-tools",
  "/suggest",
  "/suggestions",
  "/vaexcore",
  "/contact",
  "/privacy",
  "/terms",
];

const contentRefreshDate = new Date("2026-05-09");

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: contentRefreshDate,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : route === "/privacy" || route === "/terms" ? 0.4 : 0.7,
  }));
}
