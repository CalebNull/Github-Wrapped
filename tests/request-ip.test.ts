import { describe, expect, test } from "bun:test"
import { clientIp, retryAfterSeconds } from "@/lib/request-ip"

const h = (init: Record<string, string>) => new Headers(init)

describe("clientIp", () => {
  test("takes the first entry of a multi-value x-forwarded-for", () => {
    expect(
      clientIp(h({ "x-forwarded-for": "203.0.113.9, 70.41.3.18, 150.172.238.178" }))
    ).toBe("203.0.113.9")
  })

  test("trims whitespace around the first entry", () => {
    expect(clientIp(h({ "x-forwarded-for": "  203.0.113.9 ,10.0.0.1" }))).toBe(
      "203.0.113.9"
    )
  })

  test("handles a single-value x-forwarded-for", () => {
    expect(clientIp(h({ "x-forwarded-for": "198.51.100.7" }))).toBe("198.51.100.7")
  })

  test("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(clientIp(h({ "x-real-ip": "198.51.100.23" }))).toBe("198.51.100.23")
  })

  test("falls back to x-real-ip when x-forwarded-for is blank", () => {
    expect(
      clientIp(h({ "x-forwarded-for": "   ", "x-real-ip": "198.51.100.23" }))
    ).toBe("198.51.100.23")
  })

  test("trims x-real-ip", () => {
    expect(clientIp(h({ "x-real-ip": "  198.51.100.23 " }))).toBe("198.51.100.23")
  })

  test("prefers x-forwarded-for over x-real-ip", () => {
    expect(
      clientIp(h({ "x-forwarded-for": "203.0.113.9", "x-real-ip": "198.51.100.23" }))
    ).toBe("203.0.113.9")
  })

  test("returns 'anonymous' when no IP headers are present", () => {
    expect(clientIp(h({}))).toBe("anonymous")
  })
})

describe("retryAfterSeconds", () => {
  const now = 1_000_000

  test("rounds partial seconds up", () => {
    expect(retryAfterSeconds(now + 4200, now)).toBe(5)
  })

  test("does not round an exact-second boundary up", () => {
    expect(retryAfterSeconds(now + 30_000, now)).toBe(30)
  })

  test("floors at 1 when the window has already reset", () => {
    expect(retryAfterSeconds(now - 5000, now)).toBe(1)
  })

  test("returns 1 when reset is exactly now", () => {
    expect(retryAfterSeconds(now, now)).toBe(1)
  })
})