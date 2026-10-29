import { test, expect } from "@playwright/test";
test("public instrument has server HTML, canonical, OG and truthful parseable JSON-LD", async ({ request, browser }) => {
  const response = await request.get("/acoes/SDDD3");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("Empresa de teste SDD");
  expect(html).toContain("Fechamento");
  expect(html).toContain("2026-10-26");
  expect(html).toContain("12,34");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://localhost:3100/acoes/NJSX3");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Empresa de teste SDD");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/acoes\/NJSX3$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /NJSX3/);
  const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() || "{}");
  expect(graph["@graph"].some((node: Record<string, unknown>) => node.identifier === "B3:NJSX3")).toBe(true);
  await expect(page.locator("caption")).toContainText("nominal em BRL");
  await context.close();
});
test("lowercase URL redirects to canonical uppercase", async ({ request }) => {
  const response = await request.get("/acoes/sddd3", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/acoes/SDDD3");
});
