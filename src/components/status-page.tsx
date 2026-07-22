import { PrimaryLink, SecondaryLink, Section } from "@/components/ui";

const STATUS_COPY = {
  accessDenied: {
    code: "403",
    eyebrow: "Access denied",
    title: "This Vaexil.tv page is not available publicly.",
    body: "This page is restricted. Return home to continue browsing the public site.",
  },
  notFound: {
    code: "404",
    eyebrow: "Page not found",
    title: "Page not found",
    body: "The requested Vaexil.tv page does not exist yet, may have moved, or is not public.",
  },
  serverError: {
    code: "500",
    eyebrow: "Server error",
    title: "Something went wrong",
    body: "The site hit an unexpected issue. Please return home and try again shortly.",
  },
  maintenance: {
    code: "503",
    eyebrow: "Maintenance",
    title: "Vaexil.tv is temporarily unavailable",
    body: "Maintenance or a temporary host issue may be in progress. Please check back soon.",
  },
};

export type StatusPageKind = keyof typeof STATUS_COPY;

export function StatusPage({
  kind = "notFound",
  children,
}: {
  kind?: StatusPageKind;
  children?: React.ReactNode;
}) {
  const copy = STATUS_COPY[kind];

  return (
    <Section className="py-24">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
          Vaexil.tv
        </p>
        <p className="mt-5 text-xs uppercase tracking-[0.28em] text-slate-500">
          {copy.code} / {copy.eyebrow}
        </p>
        <h1 className="mt-5 text-4xl font-semibold text-white">
          {copy.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-400">{copy.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <PrimaryLink href="/">Return home</PrimaryLink>
          <SecondaryLink href="/recon">Open Recon</SecondaryLink>
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </Section>
  );
}
