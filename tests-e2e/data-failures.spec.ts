import { test, expect } from "@playwright/test";
import { mockPublicApi } from "./fixtures/route";
test("failed sections never show fabricated fundamentals or technical recommendations", async ({ page }) => {
  await mockPublicApi(page);
  await page.goto("/acoes/FAIL3");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("FAIL3");
  await expect(page.locator("#fundamentos")).toContainText("Dados indisponíveis");
  await expect(page.locator("#tecnica")).toContainText("Indisponível");
  await expect(page.locator("#fundamentos")).not.toContainText("280");
  await expect(page.locator("#tecnica")).not.toContainText("Cruzamento de Alta Confirmado");
  await expect(page.locator("body")).not.toContainText("12ms");
  await expect(page.locator("body")).not.toContainText("Mercado B3 Aberto");
});
test("pagination exposes retry and can recover from HTTP failure", async ({ page }) => {
  await mockPublicApi(page);
  let failure = true;
  await page.route("**/market/assets?**", async route => {
    if (failure) return route.fulfill({ status: 503, body: "{}" });
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `http://127.0.0.1:8765/api/v1/market/assets${url.search}` });
    await route.fulfill({ response });
  });
  await page.goto("/acoes");
  await expect(page.getByRole("alert").filter({ hasText: "Falha ao consultar" })).toContainText("Falha ao consultar");
  failure = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByText("QA00000", { exact: true })).toBeVisible();
});
