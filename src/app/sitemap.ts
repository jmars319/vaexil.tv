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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
