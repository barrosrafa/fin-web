import type { Page } from "@playwright/test";
export async function mockPublicApi(page: Page) {
  await page.route("**/api/v1/**", async route => {
    const incoming = new URL(route.request().url());
    const suffix = incoming.pathname.slice(incoming.pathname.indexOf("/api/v1"));
    const response = await route.fetch({ url: `http://127.0.0.1:8765${suffix}${incoming.search}` });
    await route.fulfill({ response });
  });
}
