import { NextRequest, NextResponse } from "next/server";

/**
 * BYOK proxy for MuAPI.
 *
 * Browser calls `/api/muapi/<path>` with an `x-api-key` header (the user's key,
 * read from localStorage). We forward the request to
 * `https://api.muapi.ai/api/v1/<path>` with that same header and stream the
 * upstream response back.
 *
 * SECURITY: the key is only ever relayed in-memory for the duration of this
 * request. It is never logged, never written to disk, never stored in a cookie,
 * and never read from an environment variable. This keeps the app's BYOK
 * guarantee: the key lives only in the user's browser.
 */

const MUAPI_BASE = (process.env.NEXT_PUBLIC_MUAPI_BASE_URL || "https://api.muapi.ai").replace(/\/+$/, "");
const UPSTREAM = `${MUAPI_BASE}/api/v1`;

// Always run per-request on the server; never cache proxied responses.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path?: string[] }> };

function buildForwardHeaders(req: NextRequest): Headers {
  const headers = new Headers();
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) headers.set("x-api-key", apiKey);
  // Preserve content-type (critical for multipart uploads' boundary) and accept.
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);
  return headers;
}

async function proxy(req: NextRequest, method: string, ctx: RouteContext): Promise<NextResponse> {
  const { path = [] } = await ctx.params;
  const search = new URL(req.url).search;
  const targetUrl = `${UPSTREAM}/${path.join("/")}${search}`;

  const init: RequestInit = {
    method,
    headers: buildForwardHeaders(req),
    redirect: "follow",
  };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch {
    return NextResponse.json({ error: "No se pudo contactar con MuAPI (proxy)." }, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  const res = new NextResponse(body, { status: upstream.status });
  const contentType = upstream.headers.get("content-type");
  if (contentType) res.headers.set("content-type", contentType);
  return res;
}

export function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, "GET", ctx);
}
export function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, "POST", ctx);
}
export function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, "DELETE", ctx);
}
