import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageShell } from "@/components/shell";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pageViewScript = `(()=>{if(window.__vaexilPageViews)return;window.__vaexilPageViews=1;let p="";const t=()=>{const n=location.pathname;if(n===p||navigator.doNotTrack==="1"||n.startsWith("/admin"))return;p=n;navigator.sendBeacon("/api/analytics/page-view",JSON.stringify({path:n,referrer:document.referrer||""}))};for(const n of ["pushState","replaceState"]){const r=history[n];history[n]=function(...e){const o=r.apply(this,e);queueMicrotask(t);return o}}addEventListener("popstate",t);t()})();`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | Vaexil.tv",
  },
  description: siteConfig.description,
  applicationName: "Vaexil.tv",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "Vaexil.tv",
    type: "website",
    images: [
      {
        url: "/brand/vaexil/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vaexil stream hub, guides, and Recon maps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/brand/vaexil/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand/vaexil/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/vaexil/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/brand/vaexil/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Vaexil.tv",
      url: siteConfig.url,
      logo: `${siteConfig.url}/brand/vaexil/icon-512.png`,
      description: siteConfig.description,
      sameAs: [
        siteConfig.links.twitch,
        siteConfig.links.youtube,
      ].filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteConfig.url}/#vaexil`,
      name: "Vaexil",
      url: siteConfig.url,
      description:
        "Streamer and creator focused on reflective gaming, guides, Recon maps, and systems-minded creative work.",
      sameAs: [
        siteConfig.links.twitch,
        siteConfig.links.youtube,
      ].filter(Boolean),
    },
  ];

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {structuredData.map((item) => (
          <script
            key={item["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
          />
        ))}
        <script dangerouslySetInnerHTML={{ __html: pageViewScript }} />
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
