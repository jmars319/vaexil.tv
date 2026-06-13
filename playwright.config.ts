import { defineConfig, devices } from "@playwright/test";

process.env.FORCE_COLOR = "0";

const port = Number(process.env.PORT || 3203);
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: [["list"], ["json", { outputFile: "test-results/playwright-results.json" }]],
  webServer: {
    command: `VERCEL= LIBSQL_URL=file:.data/vaexil-playwright.db LIBSQL_AUTH_TOKEN= ADMIN_PASSWORD=playwright-admin-password ADMIN_SESSION_SECRET=playwright-admin-secret PORT=${port} sh -c "npm run db:seed && npm run dev"`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
