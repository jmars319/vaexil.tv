"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ignoredPrefixes = ["/admin", "/api", "/_next"];

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || ignoredPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return;
    }

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || "",
    });

    if ("sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/page-view", blob);
      return;
    }

    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    });
  }, [pathname]);

  return null;
}
