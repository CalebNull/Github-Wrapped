import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "./redis"

export const rateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "60 s"), // 15 requests / minute / IP
  prefix: "ratelimit:wrapped",
}) : null