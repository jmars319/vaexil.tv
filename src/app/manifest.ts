import { siteConfig } from "@/lib/config";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vaexil",
    short_name: "Vaexil",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#03030a",
    theme_color: "#03030a",
    icons: [
      {
        src: "/brand/vaexil/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/vaexil/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
