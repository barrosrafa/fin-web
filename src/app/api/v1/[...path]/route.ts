import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ path: string[] }> };
const COOKIE = "auth_token";

/** Keep the API's bearer token exclusively on the server side of the web app. */
async function handle(request: NextRequest, context: Context) {
  const { path } = await context.params;
  const route = path.join("/");
  const mutating = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  if (mutating && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
  }
  // Reject encoded separators/traversal: URL resolution must never change the upstream origin/path.
  if (path.some((part) => !part || part === "." || part === ".." || /[/\\%?#]/.test(part))) {
    return NextResponse.json({ error: "Invalid API path" }, { status: 400, headers: { "Cache-Control": "private, no-store" } });
  }
  const backend = process.env.API_BACKEND_URL?.trim() ||
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");
  const logout = route === "auth/logout" && request.method === "POST";
  let response: NextResponse;
  try {
    if (!backend) throw new Error("Backend unavailable");
    const base = backend.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
    const headers = new Headers();
    for (const name of ["content-type", "accept", "idempotency-key"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    const token = request.cookies.get(COOKIE)?.value;
    if (token) headers.set("authorization", `Bearer ${token}`);
    const upstream = await fetch(`${base}/api/v1/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body: mutating ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    const authenticating = request.method === "POST" && ["auth/login", "auth/register"].includes(route);
    if (authenticating && upstream.ok) {
      const data = await upstream.json();
      const { token: accessToken, ...publicData } = data;
      if (typeof accessToken !== "string" || !accessToken || !Number.isFinite(data.expires_in) || data.expires_in <= 0) {
        throw new Error("Invalid authentication response");
      }
      response = NextResponse.json(publicData, { status: upstream.status });
      response.cookies.set(COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        path: "/",
        maxAge: Math.min(Math.floor(data.expires_in), 604800),
      });
    } else if (upstream.status >= 300 && upstream.status < 400) {
      // Redirects must not disclose a bearer token or bypass the session boundary.
      response = NextResponse.json({ error: "Unexpected API redirect" }, { status: 502 });
    } else {
      response = new NextResponse(request.method === "HEAD" ? null : upstream.body, { status: upstream.status });
      for (const name of ["content-type", "x-total-count", "retry-after"]) {
        const value = upstream.headers.get(name);
        if (value) response.headers.set(name, value);
      }
    }
  } catch {
    response = NextResponse.json({ error: "API temporarily unavailable" }, { status: 502 });
  }
  if (logout) response.cookies.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV !== "development", sameSite: "strict", path: "/", maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD, handle as OPTIONS };
