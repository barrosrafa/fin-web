// @vitest-environment node
import { expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";
it.each(["acoes/petr4", "fiis/hglg11", "etfs/bova11", "bdrs/aapl34", "stocks/msft", "stocks/brk.b", "reits/pld"])("normalizes %s preserving query", (path) => {
  const response = proxy(new NextRequest(`https://fin.test/${path}?ref=a`));
  expect(response.status).toBe(308);
  const [market, ticker] = path.split("/");
  expect(response.headers.get("location")).toBe(`https://fin.test/${market}/${ticker.toUpperCase()}?ref=a`);
});
it.each(["acoes/rankings", "fiis/comparador", "stocks/rankings", "acoes/PETR4", "acoes/petr4/details"])("preserves static or canonical path %s", (path) => {
  expect(proxy(new NextRequest(`https://fin.test/${path}`)).status).toBe(200);
});
it("normalizes opengraph ticker before streaming", () => {
  const response = proxy(new NextRequest("https://fin.test/fiis/hglg11/opengraph-image"));
  expect(response.status).toBe(308);
  expect(response.headers.get("location")).toBe("https://fin.test/fiis/HGLG11/opengraph-image");
});
