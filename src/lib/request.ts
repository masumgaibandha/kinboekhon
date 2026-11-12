import { createHmac } from "node:crypto";

import type { NextRequest } from "next/server";

import { requiredEnv } from "@/lib/env";

// Browsers always send Origin on a POST; it must be this site.
export function isSameOrigin(request: NextRequest): boolean {
  return request.headers.get("origin") === request.nextUrl.origin;
}

// Vercel puts the visitor's address first in x-forwarded-for.
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function userAgent(request: NextRequest): string {
  return (request.headers.get("user-agent") ?? "").slice(0, 500);
}

// A keyed hash, so stored rate-limit keys and admin views never show the address itself.
export function hashIp(ip: string): string {
  return createHmac("sha256", requiredEnv("IP_HASH_SECRET")).update(ip).digest("hex").slice(0, 32);
}
