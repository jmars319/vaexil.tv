import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/recon",
  "/recon/hitman",
  "/recon/sniper-elite-5",
  "/recon/sniper-elite-resistance",
  "/suggest",
  "/guides",
  "/contact",
  "/privacy",
  "/terms",
  "/admin",
  "/admin/recon",
  "/status/access-denied",
  "/status/server-error",
  "/status/maintenance",
  "/robots.txt",
  "/sitemap.xml",
];

for (const route of routes) {
  test(`renders ${route}`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status() || 0).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/[A-Za-z]/);
    await expect(page.locator("[data-nextjs-dialog-overlay]")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });
}

test("draft Recon map remains public 404", async ({ request }) => {
  const response = await request.get("/recon/hitman/dubai");
  expect(response.status()).toBe(404);
});

test("draft Sniper Elite Resistance Recon map remains public 404", async ({ request }) => {
  const response = await request.get("/recon/sniper-elite-resistance/behind-enemy-lines");
  expect(response.status()).toBe(404);
});

test("unknown routes render branded 404", async ({ page }) => {
  const response = await page.goto("/missing-page-check", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).toContainText(/Vaexil\.tv|Page not found/i);
  await expect(page.locator("[data-nextjs-dialog-overlay]")).toHaveCount(0);
});

test("private Recon asset is gated when logged out", async ({ request }) => {
  const response = await request.get("/admin/recon/assets/draft-placeholder-hitman-dubai");
  expect(response.status()).toBe(404);
});

test("contact API rejects invalid payload without leaking internals", async ({ request }) => {
  const response = await request.post("/api/contact", { data: {} });
  expect(response.status()).toBe(400);
  const body = await response.text();
  expect(body).not.toMatch(/SENDGRID_API_KEY|TURSO_AUTH_TOKEN|stack|trace/i);
});
