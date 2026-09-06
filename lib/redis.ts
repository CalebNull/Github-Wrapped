import { Redis } from "@upstash/redis"

// null when Upstash isn't configured - callers fall back to hitting GitHub directly
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null