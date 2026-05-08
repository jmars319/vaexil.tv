import { PrimaryLink, Section } from "@/components/ui";

export default function NotFound() {
  return (
    <Section className="py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold text-white">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-slate-400">
          The requested Vaexil.tv page does not exist yet.
        </p>
        <div className="mt-8">
          <PrimaryLink href="/">Return home</PrimaryLink>
        </div>
      </div>
    </Section>
  );
}
