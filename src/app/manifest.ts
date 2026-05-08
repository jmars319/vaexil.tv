import { siteConfig } from "@/lib/config";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vaexil.tv",
    short_name: "Vaexil",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#05070d",
    icons: [
      {
        src: "/brand/vaexil-v.png",
        sizes: "150x150",
        type: "image/png",
      },
    ],
  };
}
