import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests-e2e", testMatch: /(?:seo-assets|accessibility-finance|scroll-window|data-failures)\.spec\.ts/,
  timeout: 30000, workers: 1, reporter: [["list"], ["json", { outputFile: "test-results/sdd-results.json" }]],
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure", ...devices["Desktop Chrome"] },
  webServer: [
    { command: "node tests-e2e/fixtures/backend.mjs", url: "http://127.0.0.1:8765/health", reuseExistingServer: false },
    { command: "pnpm exec next start --port 3100", url: "http://localhost:3100", reuseExistingServer: false,
      env: { API_BACKEND_URL: "http://127.0.0.1:8765", NEXT_PUBLIC_API_URL: "" } },
  ],
});
