import { test, expect } from "@playwright/test";
import { mockPublicApi } from "./fixtures/route";
test("10k catalog keeps rendered cards proportional to viewport and cache bounded", async ({ page }) => {
  await mockPublicApi(page);
  await page.goto("/acoes");
  await expect(page.getByText("QA00000", { exact: true })).toBeVisible();
  for (let index = 0; index < 10; index++) {
    const button = page.getByRole("button", { name: /^Carregar mais Ações/ });
    if (await page.getByRole("button", { name: "Próximo bloco de Ações" }).isVisible()) break;
    if (await button.isVisible()) await button.click();
    await page.waitForTimeout(100);
  }
  const rendered = page.locator('.asset-list a[href^="/acoes/"]');
  expect(await rendered.count()).toBeLessThan(50);
  await page.getByRole("button", { name: "Exibir todo este bloco (acesso por teclado)" }).click();
  expect(await rendered.count()).toBeLessThanOrEqual(192);
  const next = page.getByRole("button", { name: "Próximo bloco de Ações" });
  await expect(next).toBeVisible();
  await next.click();
  await expect(page.getByText("QA00192", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao bloco anterior" }).click();
  await expect(page.getByText("QA00000", { exact: true })).toBeVisible();
});
