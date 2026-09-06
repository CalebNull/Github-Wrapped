/** Best-effort client IP from proxy headers, for rate-limiting keys. */
export function clientIp(headers: Headers): string {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (first) return first
  return headers.get("x-real-ip")?.trim() || "anonymous"
}

/** Seconds to advertise in a Retry-After header, never below 1. */
export function retryAfterSeconds(reset: number, now = Date.now()): number {
  return Math.max(1, Math.ceil((reset - now) / 1000))
}