import type { NextRequest } from "next/server";

// Browsers always send Origin on a POST; it must be this site.
export function isSameOrigin(request: NextRequest): boolean {
  return request.headers.get("origin") === request.nextUrl.origin;
}
