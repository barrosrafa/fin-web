// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

const context = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });
function request(path: string, method = "POST", origin = "https://fin.test") {
  return new NextRequest(`https://fin.test/api/v1/${path}`, {
    method,
    headers: { origin, cookie: "auth_token=secret-jwt; other=private", authorization: "Bearer injected", "content-type": "application/json" },
    ...(method === "POST" ? { body: JSON.stringify({ email: "test@example.com", password: "example" }) } : {}),
  });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("login exposes only public auth data and stores a secure HttpOnly session", async () => {
  vi.stubEnv("API_BACKEND_URL", "https://api.test/api/v1");
  vi.stubEnv("NODE_ENV", "production");
  const fetch = vi.fn().mockResolvedValue(Response.json({ token: "new-jwt", expires_in: 3600, user: { id: "1" } }));
  vi.stubGlobal("fetch", fetch);
  const response = await POST(request("auth/login"), context("auth/login"));
  expect(await response.json()).toEqual({ expires_in: 3600, user: { id: "1" } });
  expect(response.headers.get("set-cookie")).toMatch(/auth_token=new-jwt/);
  for (const flag of ["HttpOnly", "Secure", "SameSite=strict", "Max-Age=3600"]) expect(response.headers.get("set-cookie")).toContain(flag);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});

it("forwards only the session bearer, query and required response headers", async () => {
  vi.stubEnv("API_BACKEND_URL", "https://api.test");
  const fetch = vi.fn().mockResolvedValue(Response.json({ id: "1" }, { headers: { "set-cookie": "evil=1", "x-total-count": "12" } }));
  vi.stubGlobal("fetch", fetch);
  await GET(request("auth/me?foo=bar", "GET"), context("auth/me"));
  expect(fetch.mock.calls[0][0]).toBe("https://api.test/api/v1/auth/me?foo=bar");
  const options = fetch.mock.calls[0][1];
  expect(options.headers.get("authorization")).toBe("Bearer secret-jwt");
  expect(options.headers.has("cookie")).toBe(false);
  expect(options.cache).toBe("no-store");
});

it.each(["https://attacker.test", "null", ""])("rejects mutation origin %s without contacting API", async (origin) => {
  const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
  const response = await POST(request("auth/login", "POST", origin), context("auth/login"));
  expect(response.status).toBe(403);
  expect(fetch).not.toHaveBeenCalled();
});

it("clears the cookie even when upstream logout fails", async () => {
  vi.stubEnv("API_BACKEND_URL", "https://api.test");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("private upstream message")));
  const response = await POST(request("auth/logout"), context("auth/logout"));
  expect(response.status).toBe(502);
  expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  expect(await response.text()).not.toContain("private upstream message");
});

it("does not follow redirects or forward upstream cookies", async () => {
  vi.stubEnv("API_BACKEND_URL", "https://api.test");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 307, headers: { location: "https://evil.test", "set-cookie": "evil=1" } })));
  const response = await GET(request("auth/me", "GET"), context("auth/me"));
  expect(response.status).toBe(502);
  expect(response.headers.has("location")).toBe(false);
  expect(response.headers.has("set-cookie")).toBe(false);
});

it("invalid auth responses do not create sessions", async () => {
  vi.stubEnv("API_BACKEND_URL", "https://api.test");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ token: "secret", expires_in: -1 })));
  const response = await POST(request("auth/login"), context("auth/login"));
  expect(response.status).toBe(502);
  expect(response.headers.has("set-cookie")).toBe(false);
});
