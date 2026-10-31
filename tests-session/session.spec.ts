import { test, expect } from "@playwright/test";

test("browser session hides JWT, authenticates through BFF and expires on logout", async ({ page, context }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("fin_token", "legacy-jwt"));
  await page.locator('input[type="email"]').fill("qa@example.test");
  await page.locator('input[type="password"]').fill("example-password");
  const loginResponse = page.waitForResponse((response) => response.url().endsWith("/api/v1/auth/login"));
  await page.getByRole("button", { name: "Entrar na Conta" }).click();
  expect(await (await loginResponse).json()).not.toHaveProperty("token");
  await page.waitForURL("**/carteira");
  expect(await page.evaluate(() => localStorage.getItem("fin_token"))).toBeNull();
  expect(await page.evaluate(() => document.cookie)).not.toContain("auth_token");
  const cookie = (await context.cookies()).find((item) => item.name === "auth_token");
  expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Strict" });
  expect(await page.evaluate(async () => (await fetch("/api/v1/auth/me")).status)).toBe(200);
  expect(await page.evaluate(async () => (await fetch("/api/v1/auth/logout", { method: "POST" })).status)).toBe(200);
  expect((await context.cookies()).some((item) => item.name === "auth_token")).toBe(false);
  expect(await page.evaluate(async () => (await fetch("/api/v1/auth/me")).status)).toBe(401);
});

test("foreign origin cannot create a browser session", async ({ request }) => {
  const response = await request.post("/api/v1/auth/login", { headers: { origin: "https://evil.test" }, data: {} });
  expect(response.status()).toBe(403);
  expect(response.headers()["set-cookie"]).toBeUndefined();
});
