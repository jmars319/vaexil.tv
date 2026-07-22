import {
  BookOpenText,
  Compass,
  Map,
  Radio,
} from "lucide-react";

export const hubCards = [
  {
    title: "Recon",
    href: "/recon",
    description:
      "Interactive maps, clear location notes, and independently written references for games covered on stream.",
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
      "Watch Vaexil on Twitch and find the main channel links in one place.",
    icon: Radio,
  },
  {
    title: "Start Here",
    href: "/start-here",
    description:
      "A quick introduction to the stream, Recon maps, guides, and community suggestions.",
    icon: Compass,
  },
];

export const continuityRoutes = [
  {
    title: "Live",
    href: "/live",
    description:
      "Watch on Twitch and get a feel for the games, conversations, and guide work.",
    icon: Radio,
  },
  {
    title: "Guides",
    href: "/guides",
    description:
      "Find raid references, mod setup notes, and searchable game guides.",
    icon: BookOpenText,
  },
  {
    title: "Recon",
    href: "/recon",
    description:
      "Explore interactive maps and practical location notes.",
    icon: Map,
  },
  {
    title: "Start Here",
    href: "/start-here",
    description:
      "See what Vaexil.tv offers and choose where to begin.",
    icon: Compass,
  },
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
      "Recon brings independently authored maps, location notes, and practical references together for games covered on stream.",
  },
  {
    title: "Guides",
    body:
      "Guides are verified notes and references that should remain findable after a stream, mod setup, or viewer correction disappears into a feed.",
  },
  {
    title: "Community suggestions",
    body:
      "Viewers can suggest additions or corrections. Submissions stay clearly separate from published guide information until they are reviewed.",
  },
];
