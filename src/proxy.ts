import { NextResponse, type NextRequest } from "next/server";
// Normalize before streaming starts so the redirect has an actual HTTP 308 status.
export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/acoes\/([a-z0-9]{4,12})(\/opengraph-image)?$/i);
  if (match && /\d/.test(match[1]) && match[1] !== match[1].toUpperCase()) {
    const url = request.nextUrl.clone();
    url.pathname = `/acoes/${match[1].toUpperCase()}${match[2] || ""}`;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}
export const config = { matcher: "/acoes/:path*" };
