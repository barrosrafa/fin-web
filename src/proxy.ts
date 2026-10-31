import { NextResponse, type NextRequest } from "next/server";

// Restrict normalization to ticker shapes, preserving static routes and query parameters.
export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/(acoes|fiis|etfs|bdrs|stocks|reits)\/([^/]+)(\/opengraph-image)?$/);
  if (match) {
    const [, market, ticker, suffix = ""] = match;
    const valid = ["stocks", "reits"].includes(market)
      ? /^[a-z]{1,5}(?:[.-][a-z])?$/i.test(ticker)
      : /^[a-z]{4}\d{1,2}$/i.test(ticker);
    if (valid && ticker !== ticker.toUpperCase()) {
      const url = request.nextUrl.clone();
      url.pathname = `/${market}/${ticker.toUpperCase()}${suffix}`;
      return NextResponse.redirect(url, 308);
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/acoes/:path*", "/fiis/:path*", "/etfs/:path*", "/bdrs/:path*", "/stocks/:path*", "/reits/:path*"] };
