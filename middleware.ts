import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "./lib/ratelimit"
import { clientIp, retryAfterSeconds } from "@/lib/request-ip"

export async function middleware(req: NextRequest) {
  if (!rateLimit) return NextResponse.next()

  const { success, reset } = await rateLimit.limit(clientIp(req.headers))
  if (!success) {
    return new NextResponse("Too many requests — try again in a minute.", {
      status: 429,
      headers: { "retry-after": retryAfterSeconds(reset).toString() },
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*opengraph-image|.*\\.).*)"],
}