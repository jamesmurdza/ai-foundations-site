import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
    // Don't send real mail during E2E — keep the SMTP creds out so the email
    // pipeline records/logs instead of blasting fake @example.com addresses.
    env: { SMTP_HOST: "", SMTP_USER: "", SMTP_PASS: "" },
  },
});
