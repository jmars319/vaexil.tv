import { expect, test, type Page } from "@playwright/test";

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

async function loginAdmin(page: Page) {
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  const passwordInput = page.getByLabel("Admin password");
  if ((await passwordInput.count()) > 0) {
    await passwordInput.fill("playwright-admin-password");
    await page.getByRole("button", { name: "Sign in" }).click();
  }

  const adminQueue = page.getByRole("heading", { name: "Admin queue" });
  await adminQueue.waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
  if (!(await adminQueue.isVisible().catch(() => false))) {
    test.skip(true, "Admin Recon smoke requires the Playwright test admin env.");
  }
  await expect(adminQueue).toBeVisible();
}

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

test("draft Berlin Recon map remains public 404", async ({ request }) => {
  const response = await request.get("/recon/hitman/berlin");
  expect(response.status()).toBe(404);
});

const privateSniperEliteRoutes = [
  "/recon/sniper-elite-5/the-atlantic-wall",
  "/recon/sniper-elite-5/occupied-residence",
  "/recon/sniper-elite-5/spy-academy",
  "/recon/sniper-elite-5/war-factory",
  "/recon/sniper-elite-5/festung-guernsey",
  "/recon/sniper-elite-5/liberation",
  "/recon/sniper-elite-5/secret-weapons",
  "/recon/sniper-elite-5/rubble-and-ruin",
  "/recon/sniper-elite-5/wolf-mountain",
  "/recon/sniper-elite-5/landing-force",
  "/recon/sniper-elite-5/conqueror",
  "/recon/sniper-elite-5/rough-landing",
  "/recon/sniper-elite-5/kraken-awakes",
  "/recon/sniper-elite-resistance/behind-enemy-lines",
  "/recon/sniper-elite-resistance/dead-drop",
  "/recon/sniper-elite-resistance/sonderzuge-sabotage",
  "/recon/sniper-elite-resistance/collision-course",
  "/recon/sniper-elite-resistance/devils-cauldron",
  "/recon/sniper-elite-resistance/assault-on-fort-rouge",
  "/recon/sniper-elite-resistance/lock-stock-and-barrels",
  "/recon/sniper-elite-resistance/end-of-the-line",
  "/recon/sniper-elite-resistance/all-or-nothing",
  "/recon/sniper-elite-resistance/lights-camera-achtung",
  "/recon/sniper-elite-resistance/vercors-vendetta",
  "/recon/sniper-elite-resistance/striking-range",
  "/recon/sniper-elite-resistance/mud-and-thunder",
];

for (const route of privateSniperEliteRoutes) {
  test(`draft ${route} remains public 404`, async ({ request }) => {
    const response = await request.get(route);
    expect(response.status()).toBe(404);
  });
}

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

test("private imported Berlin Recon asset is gated when logged out", async ({ request }) => {
  const response = await request.get("/admin/recon/assets/hitmaps-hitman-berlin-level-0");
  expect(response.status()).toBe(404);
});

test("admin Recon index groups maps by game and shows source-check status", async ({ page }) => {
  await loginAdmin(page);

  await page.goto("/admin/recon", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { name: "HITMAN World of Assassination" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sniper Elite 5" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sniper Elite: Resistance" }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Sniper Elite 5 / 13" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sniper Elite: Resistance / 13" }),
  ).toBeVisible();
  await expect(page.getByText(/Source check: position cross checked/i).first()).toBeVisible();
  await expect(page.getByText(/Source check: needs manual position review/i).first()).toBeVisible();
});

test("admin Recon map supports wheel and touchpad-style zoom", async ({ page }) => {
  await loginAdmin(page);

  await page.goto("/admin/recon/maps/the-atlantic-wall", {
    waitUntil: "domcontentloaded",
  });
  const viewport = page.getByTestId("recon-map-viewport");
  await expect(viewport).toBeVisible();
  await viewport.scrollIntoViewIfNeeded();

  const beforeZoom = Number(await viewport.getAttribute("data-scale"));
  const box = await viewport.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.wheel(0, -480);
  await expect
    .poll(async () => Number(await viewport.getAttribute("data-scale")))
    .toBeGreaterThan(beforeZoom);

  const zoomedIn = Number(await viewport.getAttribute("data-scale"));
  await page.mouse.wheel(0, 360);
  await expect
    .poll(async () => Number(await viewport.getAttribute("data-scale")))
    .toBeLessThan(zoomedIn);
});

test("admin Atlantic Wall markers keep corrected positions and readable icons", async ({ page }) => {
  await loginAdmin(page);

  await page.goto("/admin/recon/maps/the-atlantic-wall", {
    waitUntil: "domcontentloaded",
  });

  const viewport = page.getByTestId("recon-map-viewport");
  await expect(viewport).toBeVisible();

  await expect(page.getByRole("button", { exact: true, name: "Beach" })).toHaveAttribute(
    "style",
    /left:\s*78\.4%;\s*top:\s*77\.2%;?/,
  );

  await expect(
    page
      .getByRole("button", { exact: true, name: "Mission 1 Long Shot Gold Medal" })
      .locator("img"),
  ).toHaveAttribute("src", "/recon/icons/common/medal.svg");
  await expect(
    page.getByRole("button", { exact: true, name: "Bolt Cutters" }).first().locator("img"),
  ).toHaveAttribute("src", "/recon/icons/common/bolt-cutters.svg");
  await expect(
    page.getByRole("button", { exact: true, name: "Crowbar" }).first().locator("img"),
  ).toHaveAttribute("src", "/recon/icons/common/crowbar.svg");
  await expect(
    page.getByRole("button", { exact: true, name: "Satchel Charge" }).first().locator("img"),
  ).toHaveAttribute("src", "/recon/icons/common/satchel-charge.svg");

  await page.getByPlaceholder("Search markers").fill("medal");
  await page
    .getByRole("button", {
      exact: true,
      name: "Mission 1 Long Shot Gold Medal Medal-related",
    })
    .click();
  await expect(page.getByText(/600 m rifle shot toward the northeast/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Source cross-check" })).toBeVisible();
  await expect(page.getByText(/Gamer Guides Sniper Elite 5 map index/i)).toBeVisible();
  await expect(page.getByText(/Workbench count/i).first()).toBeVisible();
});

test("admin Behind Enemy Lines markers keep corrected campaign-cell positions", async ({ page }) => {
  await loginAdmin(page);

  await page.goto("/admin/recon/maps/behind-enemy-lines", {
    waitUntil: "domcontentloaded",
  });

  const viewport = page.getByTestId("recon-map-viewport");
  await expect(viewport).toBeVisible();

  await expect(page.getByRole("button", { exact: true, name: "Behind Enemy Lines" })).toHaveAttribute(
    "style",
    /left:\s*32\.8857%;\s*top:\s*28\.1433%;?/,
  );

  await expect(
    page.getByRole("button", { exact: true, name: "Bolt Cutters" }).first().locator("img"),
  ).toHaveAttribute("src", "/recon/icons/common/bolt-cutters.svg");
  await expect(
    page.getByRole("button", { exact: true, name: "Crowbar" }).first().locator("img"),
  ).toHaveAttribute("src", "/recon/icons/common/crowbar.svg");
  await expect(
    page.getByRole("button", { exact: true, name: "Satchel Charge" }).first().locator("img"),
  ).toHaveAttribute("src", "/recon/icons/common/satchel-charge.svg");

  await page.getByPlaceholder("Search markers").fill("workbench");
  await page
    .getByRole("button", {
      exact: true,
      name: "Pistol Workbench Workbench",
    })
    .click();
  await expect(page.getByText(/single Behind Enemy Lines collectible\/workbench/i)).toBeVisible();
});

test("admin Sniper Elite expansion maps are privately reviewable", async ({ page }) => {
  await loginAdmin(page);

  await page.goto("/admin/recon/maps/spy-academy", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("heading", { name: "Spy Academy capture" })).toBeVisible();
  await expect(page.getByTestId("recon-map-viewport")).toBeVisible();
  await page.getByPlaceholder("Search markers").fill("Mission 3 Long Shot");
  await expect(
    page.getByRole("button", {
      exact: true,
      name: "Mission 3 Long Shot Gold Medal Medal-related",
    }),
  ).toBeVisible();

  await page.goto("/admin/recon/maps/dead-drop", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("heading", { name: "Dead Drop capture" })).toBeVisible();
  await expect(page.getByTestId("recon-map-viewport")).toBeVisible();

  await page.getByRole("checkbox", { name: /Ammunition pickup/ }).check();
  await page.getByPlaceholder("Search markers").fill("ammunition");
  await expect(page.getByRole("button", { name: /Ammunition/ }).first()).toBeVisible();

  await page.goto("/admin/recon/maps/vercors-vendetta", {
    waitUntil: "domcontentloaded",
  });
  await expect(page.getByRole("heading", { name: "Vercors Vendetta capture" })).toBeVisible();
  await expect(page.getByTestId("recon-map-viewport")).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "DLC2: Waterfalls" })).toBeVisible();
});

test("contact API rejects invalid payload without leaking internals", async ({ request }) => {
  const response = await request.post("/api/contact", { data: {} });
  expect(response.status()).toBe(400);
  const body = await response.text();
  expect(body).not.toMatch(/SENDGRID_API_KEY|TURSO_AUTH_TOKEN|stack|trace/i);
});
