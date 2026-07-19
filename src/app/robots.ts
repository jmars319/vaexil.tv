import { siteConfig } from "@/lib/config";
import { destinyGuidesArePublic } from "@/lib/destiny-guide-visibility";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/admin", "/api"];

  if (!destinyGuidesArePublic()) {
    disallow.push("/guides/destiny2", "/tools/destiny2", "/downloads/guides/destiny2");
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
