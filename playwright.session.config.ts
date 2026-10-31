import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests-session",
  testMatch: "session.spec.ts",
  use: { baseURL: "http://localhost:18983", headless: true },
  webServer: [
    { command: "node tests-e2e/fixtures/session-backend.mjs", url: "http://127.0.0.1:18982/health", reuseExistingServer: false },
    { command: "pnpm start --port 18983", url: "http://localhost:18983/login", reuseExistingServer: false,
      env: { API_BACKEND_URL: "http://127.0.0.1:18982" }, timeout: 30000 },
  ],
});
