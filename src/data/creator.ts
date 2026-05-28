import {
  BookOpenText,
  CalendarDays,
  Clapperboard,
  Compass,
  Map,
  Radio,
  Sparkles,
} from "lucide-react";

export const hubCards = [
  {
    title: "Recon",
    href: "/recon",
    description:
      "Private map work, reviewed sources, POI markers, and public-ready guide surfaces for games that need better reference maps.",
    icon: Map,
  },
  {
    title: "Guides",
    href: "/guides",
    description:
      "Verified stream notes, setup references, and useful archives that should stay easier to find than a chat message.",
    icon: BookOpenText,
  },
  {
    title: "Live",
    href: "/live",
    description:
      "The fastest route to the stream and the current live/offline context without burying viewers in platform links.",
    icon: Radio,
  },
  {
    title: "VaexCore",
    href: "/vaexcore",
    description:
      "The future creator-operations product family that supports the stream without replacing Vaexil as the identity.",
    icon: Sparkles,
  },
];

export const continuityRoutes = [
  {
    title: "Live",
    href: "/live",
    description:
      "Watch live on Twitch and understand what kind of stream this is before jumping platforms.",
    icon: Radio,
  },
  {
    title: "Schedule",
    href: "/schedule",
    description:
      "A plain public schedule surface for planned streams, event windows, and future calendar integration.",
    icon: CalendarDays,
  },
  {
    title: "Clips",
    href: "/clips",
    description:
      "A curated highlights surface for moments worth keeping after the feed moves on.",
    icon: Clapperboard,
  },
  {
    title: "Start Here",
    href: "/start-here",
    description:
      "A new-viewer route that explains Vaexil, the stream, Recon, guides, suggestions, and VaexCore.",
    icon: Compass,
  },
];

export const clipCategories = [
  "Funny moments",
  "Game discoveries",
  "Guide-worthy finds",
  "Good conversations",
  "Technical rabbit holes",
  "Quietly strange moments",
];

export const scheduleNotes = [
  "Streams may move around life and energy.",
  "This route is the future canonical schedule surface.",
  "When calendar integration is ready, it should update this page instead of creating a competing schedule.",
];

export const startHereSections = [
  {
    title: "The stream",
    body:
      "Vaexil is built around reflective gaming, quiet humor, atmosphere, interpretation, and the kind of side paths that turn into useful guides.",
  },
  {
    title: "Recon",
    body:
      "Recon is the map and guide system. It keeps private research, source notes, markers, and public map pages organized without copying guide prose or game UI.",
  },
  {
    title: "Guides",
    body:
      "Guides are verified notes and references that should remain findable after a stream, mod setup, or viewer correction disappears into a feed.",
  },
  {
    title: "VaexCore",
    body:
      "VaexCore is the future creator-operations layer for stream tooling, local controls, highlight review, and operational workflows.",
  },
];
