import type { Metadata } from "next";
import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Access Denied",
  robots: { index: false, follow: false },
};

export default function AccessDeniedPage() {
  return <StatusPage kind="accessDenied" />;
}
