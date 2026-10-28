import { test, expect } from "@playwright/test";

test.describe("FIN Web E2E & Accessibility Regression Suite", () => {
  test("1. Home page renders and TickerTape is present", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FIN/i);
    const tickerTape = page.locator(".animate-ticker").first();
    await expect(tickerTape).toBeVisible();
  });

  test("2. /acoes search and listing", async ({ page }) => {
    await page.goto("/acoes");
    await expect(page.locator("h1")).toContainText(/Ações/i);

    // Search input exists and allows typing
    const searchInput = page.getByPlaceholder(/Buscar por ticker/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("PETR4");

    // PETR4 card should be rendered
    const petrCard = page.locator("text=PETR4").first();
    await expect(petrCard).toBeVisible();
  });

  test("3. /acoes/PETR4 detail page renders real valuation and tabs", async ({ page }) => {
    await page.goto("/acoes/PETR4");
    await expect(page.locator("h1")).toContainText("PETR4");

    // Click valuation tab
    const valuationTab = page.locator("#tab-VALUATION");
    await expect(valuationTab).toBeVisible();
    await valuationTab.click();

    // Verify Benjamin Graham formula card
    await expect(page.locator("text=Fórmula de Benjamin Graham")).toBeVisible();
    await expect(page.locator("text=Margem Segurança").first()).toBeVisible();
  });

  test("4. /artigos and dynamic article reading page", async ({ page }) => {
    await page.goto("/artigos");
    await expect(page.locator("h1")).toContainText(/Artigos/i);

    // Click on first "Ler Artigo" link
    const firstArticleLink = page.getByRole("link", { name: /Ler Artigo/i }).first();
    await expect(firstArticleLink).toBeVisible();
    await firstArticleLink.click();

    // Verify dynamic article page loads with breadcrumbs
    await expect(page).toHaveURL(/\/artigos\/.+/);
    const breadcrumb = page.locator("nav[aria-label='Navegação estrutural']");
    await expect(breadcrumb).toBeVisible();
  });

  test("5. /login form validation and interaction", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText(/Acessar Plataforma/i);

    const emailInput = page.locator("input[type='email']");
    const passwordInput = page.locator("input[type='password']");
    const submitButton = page.locator("button[type='submit']");

    await emailInput.fill("test_user@fin.com.br");
    await passwordInput.fill("wrongpassword");
    await submitButton.click();

    // Error banner should be displayed gracefully
    const errorBanner = page.locator(".text-rose-400");
    await expect(errorBanner).toBeVisible({ timeout: 7000 });
  });

  test("6. /premium checkout modal functionality", async ({ page }) => {
    await page.goto("/premium");
    await expect(page.locator("h1")).toContainText(/Invista com Inteligência Institucional/i);

    const proButton = page.getByRole("button", { name: /Assinar com 7 Dias Grátis/i });
    await proButton.click();

    // Modal opens
    const modal = page.locator("text=Checkout Seguro Asaas");
    await expect(modal).toBeVisible();

    // Click PIX button
    const pixButton = page.getByRole("button", { name: /Gerar Cobrança PIX com QR Code/i });
    await pixButton.click();

    // Should prompt for auth if unauthenticated
    const authPrompt = page.locator("text=Você precisa estar autenticado");
    await expect(authPrompt).toBeVisible({ timeout: 7000 });
  });
});
