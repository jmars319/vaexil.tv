import { ContactForm } from "@/components/contact-form";
import { Section, SectionHeading } from "@/components/ui";
import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Vaexil about collaborations, promotions, stream questions, or VaexCore conversations.",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: "Contact | Vaexil.tv",
    description:
      "Contact Vaexil about collaborations, promotions, stream questions, or VaexCore conversations.",
    url: `${siteConfig.url}/contact`,
    siteName: "Vaexil.tv",
    type: "website",
  },
};

const contactPaths = [
  {
    title: "Collaborations",
    description:
      "For creator, channel, stream, or community ideas that need a direct review.",
  },
  {
    title: "Promotions",
    description:
      "For sponsorship, product, or campaign conversations with clear timing and scope.",
  },
  {
    title: "VaexCore",
    description:
      "For future product questions, early interest, or tool ideas that belong in the VaexCore surface.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Section className="pb-8 pt-16">
        <SectionHeading
          title="Contact Vaexil"
          description="Use this form for collaborations, promotions, stream questions, and future VaexCore conversations. Public contact is form-based so every request arrives with enough context to review."
        />
      </Section>
      <Section className="pt-4">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="grid gap-4">
            {contactPaths.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
              >
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
