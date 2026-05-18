import type { Metadata } from "next";
import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Server Error",
  robots: { index: false, follow: false },
};

export default function ServerErrorPage() {
  return <StatusPage kind="serverError" />;
}
