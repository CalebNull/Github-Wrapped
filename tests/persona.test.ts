import { describe, expect, test } from "bun:test"
import { classifyPersona } from "@/lib/persona"
import type { WrappedStats } from "@/lib/wrapped"

function makeStats(over: Partial<WrappedStats> = {}): WrappedStats {
  return {
    login: "x",
    name: null,
    avatarUrl: "",
    year: 2024,
    totalContributions: 500,
    totalCommits: 400,
    pullRequests: 10,
    issues: 5,
    reviews: 2,
    longestStreak: 5,
    busiestDay: { date: "2024-06-01", count: 12 },
    busiestMonth: { month: "2024-06", count: 80 },
    topLanguages: [
      { name: "TypeScript", commits: 200 },
      { name: "CSS", commits: 120 },
      { name: "Go", commits: 80 },
    ],
    topRepo: { name: "app", commits: 150 },
    byWeekday: [
      { day: "Sun", count: 20 },
      { day: "Mon", count: 80 },
      { day: "Tue", count: 80 },
      { day: "Wed", count: 80 },
      { day: "Thu", count: 80 },
      { day: "Fri", count: 60 },
      { day: "Sat", count: 20 },
    ],
    weeks: [],
    activeDays: 120,
    repoCount: 8,
    ...over,
  }
}

const evenLangs = [
  { name: "TS", commits: 50 },
  { name: "CSS", commits: 50 },
]

describe("classifyPersona", () => {
  test("ghost when there are no contributions", () => {
    expect(classifyPersona(makeStats({ totalContributions: 0 })).key).toBe("ghost")
  })

  test("reviewer when reviews outweigh commits", () => {
    expect(
      classifyPersona(makeStats({ reviews: 50, totalCommits: 40 })).key
    ).toBe("reviewer")
  })

  test("shipper on heavy PR volume", () => {
    expect(
      classifyPersona(
        makeStats({ pullRequests: 60, totalCommits: 100, reviews: 0 })
      ).key
    ).toBe("shipper")
  })

  test("lone wolf when one repo holds ~everything", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          repoCount: 1,
          totalCommits: 100,
          topRepo: { name: "solo", commits: 95 },
        })
      ).key
    ).toBe("lone-wolf")
  })

  test("polyglot with 4+ evenly-used languages", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          topLanguages: [
            { name: "Go", commits: 100 },
            { name: "Rust", commits: 90 },
            { name: "TS", commits: 80 },
            { name: "Python", commits: 70 },
          ],
        })
      ).key
    ).toBe("polyglot")
  })

  test("specialist when one language is 80%+", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          longestStreak: 0,
          topLanguages: [
            { name: "TypeScript", commits: 180 },
            { name: "CSS", commits: 10 },
          ],
        })
      ).key
    ).toBe("specialist")
  })

  test("streak keeper at a 30+ day streak", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          longestStreak: 45,
          topLanguages: evenLangs,
        })
      ).key
    ).toBe("streak-keeper")
  })

  test("weekend warrior when 40%+ lands on Sat/Sun", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          longestStreak: 0,
          topLanguages: evenLangs,
          byWeekday: [
            { day: "Sun", count: 50 },
            { day: "Mon", count: 10 },
            { day: "Tue", count: 10 },
            { day: "Wed", count: 10 },
            { day: "Thu", count: 10 },
            { day: "Fri", count: 10 },
            { day: "Sat", count: 50 },
          ],
        })
      ).key
    ).toBe("weekend-warrior")
  })

  test("nine-to-five when it's ~all weekdays", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          longestStreak: 0,
          topLanguages: evenLangs,
          byWeekday: [
            { day: "Sun", count: 0 },
            { day: "Mon", count: 100 },
            { day: "Tue", count: 100 },
            { day: "Wed", count: 100 },
            { day: "Thu", count: 100 },
            { day: "Fri", count: 100 },
            { day: "Sat", count: 0 },
          ],
        })
      ).key
    ).toBe("nine-to-five")
  })

  test("sprinter when one month is 40%+ of the year", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          longestStreak: 0,
          totalContributions: 500,
          busiestMonth: { month: "2024-06", count: 250 },
          topLanguages: evenLangs,
        })
      ).key
    ).toBe("sprinter")
  })

  test("marathoner on 200+ active days", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          longestStreak: 0,
          activeDays: 240,
          busiestMonth: { month: "2024-06", count: 60 },
          topLanguages: evenLangs,
        })
      ).key
    ).toBe("marathoner")
  })

  test("explorer as the fallback", () => {
    expect(
      classifyPersona(
        makeStats({
          reviews: 0,
          pullRequests: 0,
          longestStreak: 3,
          activeDays: 50,
          busiestMonth: { month: "2024-06", count: 30 },
          topLanguages: [
            { name: "TS", commits: 60 },
            { name: "CSS", commits: 55 },
          ],
          byWeekday: [
            { day: "Sun", count: 10 },
            { day: "Mon", count: 20 },
            { day: "Tue", count: 20 },
            { day: "Wed", count: 20 },
            { day: "Thu", count: 20 },
            { day: "Fri", count: 20 },
            { day: "Sat", count: 10 },
          ],
        })
      ).key
    ).toBe("explorer")
  })
})