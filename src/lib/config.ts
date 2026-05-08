function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "Vaexil.tv",
  title: "Vaexil.tv | Stream Hub, Guides, and VaexCore",
  description:
    "A calm home base for Vaexil stream resources, verified guide notes, community suggestions, and future VaexCore releases.",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL || "https://vaexil.tv"),
  links: {
    twitch: process.env.NEXT_PUBLIC_TWITCH_URL || "https://www.twitch.tv/vaexil",
    youtube:
      process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com/@vaexil",
    discord: process.env.NEXT_PUBLIC_DISCORD_URL || "",
    github: process.env.NEXT_PUBLIC_GITHUB_URL || "",
  },
};

export const guideCategories = [
  "Fictional sample",
  "Tool",
  "Route note",
  "Setup note",
  "Stream tool",
];
