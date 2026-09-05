import { describe, expect, test } from "bun:test"
import { computeStats, isValidUsername } from "./wrapped"
import type { ContributionDay, RawWrapped } from "./github"

// ---- fixtures -------------------------------------------------------------

type DayInput = { date: string; count: number; weekday?: number }

const weekdayOf = (iso: string) => new Date(iso + "T00:00:00Z").getUTCDay()

/** Consecutive days starting at `start`, one entry per count. */
function seq(start: string, counts: number[]): DayInput[] {
  const d = new Date(start + "T00:00:00Z")
  return counts.map((count) => {
    const date = d.toISOString().slice(0, 10)
    d.setUTCDate(d.getUTCDate() + 1)
    return { date, count }
  })
}

function makeRaw(opts: {
  days?: DayInput[]
  repos?: { name: string; language: string | null; commits: number }[]
  totals?: Partial<{
    totalContributions: number
    totalCommitContributions: number
    totalPullRequestContributions: number
    totalIssueContributions: number
    totalPullRequestReviewContributions: number
  }>
}): RawWrapped {
  const days: ContributionDay[] = (opts.days ?? []).map((d) => ({
    date: d.date,
    contributionCount: d.count,
    weekday: d.weekday ?? weekdayOf(d.date),
  }))

  // chunk into Sun..Sat weeks; first week is short if it doesn't start on Sunday
  const weeks: { contributionDays: ContributionDay[] }[] = []
  let i = 0
  if (days.length && days[0].weekday !== 0) {
    const firstLen = 7 - days[0].weekday
    weeks.push({ contributionDays: days.slice(0, firstLen) })
    i = firstLen
  }
  for (; i < days.length; i += 7) {
    weeks.push({ contributionDays: days.slice(i, i + 7) })
  }

  const repos = (opts.repos ?? []).map((r) => ({
    repository: {
      name: r.name,
      primaryLanguage: r.language ? { name: r.language } : null,
      stargazerCount: 0,
    },
    contributions: { totalCount: r.commits },
  }))

  const t = opts.totals ?? {}
  const contributions = {
    totalCommitContributions: t.totalCommitContributions ?? 0,
    totalPullRequestContributions: t.totalPullRequestContributions ?? 0,
    totalIssueContributions: t.totalIssueContributions ?? 0,
    totalPullRequestReviewContributions:
      t.totalPullRequestReviewContributions ?? 0,
    contributionCalendar: {
      totalContributions:
        t.totalContributions ??
        days.reduce((s, d) => s + d.contributionCount, 0),
      weeks,
    },
    commitContributionsByRepository: repos,
  }

  return {
    login: "tester",
    name: "Test User",
    avatarUrl: "https://example.com/a.png",
    year: 2024,
    contributions,
    repos,
  }
}

// ---- computeStats -------------------------------------------------------

describe("computeStats", () => {
  test("passes contribution totals straight through", () => {
    const s = computeStats(
      makeRaw({
        days: seq("2024-01-01", [1, 2, 3]),
        totals: {
          totalContributions: 999,
          totalCommitContributions: 100,
          totalPullRequestContributions: 10,
          totalIssueContributions: 5,
          totalPullRequestReviewContributions: 7,
        },
      })
    )
    expect(s.totalContributions).toBe(999)
    expect(s.totalCommits).toBe(100)
    expect(s.pullRequests).toBe(10)
    expect(s.issues).toBe(5)
    expect(s.reviews).toBe(7)
  })

  test("longest streak spans week boundaries and resets on a gap", () => {
    // 3 on, 1 off, 5 on
    const raw = makeRaw({ days: seq("2024-01-01", [1, 1, 1, 0, 2, 2, 2, 2, 2]) })
    expect(computeStats(raw).longestStreak).toBe(5)
  })

  test("longest streak is 0 with no activity", () => {
    expect(
      computeStats(makeRaw({ days: seq("2024-01-01", [0, 0, 0]) })).longestStreak
    ).toBe(0)
  })

  test("busiestDay takes the max, earliest day wins a tie", () => {
    const raw = makeRaw({
      days: [
        { date: "2024-03-04", count: 5 },
        { date: "2024-03-05", count: 9 },
        { date: "2024-03-06", count: 9 },
      ],
    })
    expect(computeStats(raw).busiestDay).toEqual({ date: "2024-03-05", count: 9 })
  })

  test("busiestDay is empty when nothing happened", () => {
    expect(
      computeStats(makeRaw({ days: seq("2024-01-01", [0, 0]) })).busiestDay
    ).toEqual({ date: "", count: 0 })
  })

  test("busiestMonth sums by calendar month", () => {
    const raw = makeRaw({
      days: [...seq("2024-01-10", [1, 1, 1]), ...seq("2024-02-10", [5, 5])],
    })
    expect(computeStats(raw).busiestMonth).toEqual({ month: "2024-02", count: 10 })
  })

  test("byWeekday always returns 7 buckets Sun..Sat", () => {
    const s = computeStats(makeRaw({ days: [] }))
    expect(s.byWeekday.map((d) => d.day)).toEqual([
      "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    ])
    expect(s.byWeekday.every((d) => d.count === 0)).toBe(true)
  })

  test("byWeekday sums into the right bucket", () => {
    const raw = makeRaw({
      days: [
        { date: "2024-01-01", count: 4 }, // Monday
        { date: "2024-01-08", count: 6 }, // Monday
        { date: "2024-01-07", count: 3 }, // Sunday
      ],
    })
    const byDay = Object.fromEntries(
      computeStats(raw).byWeekday.map((d) => [d.day, d.count])
    )
    expect(byDay["Mon"]).toBe(10)
    expect(byDay["Sun"]).toBe(3)
    expect(byDay["Tue"]).toBe(0)
  })

  test("topLanguages aggregates by primary language, desc, capped at 5", () => {
    const s = computeStats(
      makeRaw({
        repos: [
          { name: "a", language: "TypeScript", commits: 10 },
          { name: "b", language: "TypeScript", commits: 5 },
          { name: "c", language: "Go", commits: 20 },
          { name: "d", language: null, commits: 100 }, // no language -> ignored
          { name: "e", language: "Rust", commits: 1 },
          { name: "f", language: "C", commits: 2 },
          { name: "g", language: "Python", commits: 3 },
          { name: "h", language: "Ruby", commits: 4 },
        ],
      })
    )
    expect(s.topLanguages).toHaveLength(5)
    expect(s.topLanguages[0]).toEqual({ name: "Go", commits: 20 })
    expect(s.topLanguages[1]).toEqual({ name: "TypeScript", commits: 15 })
  })

  test("topRepo is the most-committed repo, else null", () => {
    expect(computeStats(makeRaw({ repos: [] })).topRepo).toBeNull()
    expect(
      computeStats(
        makeRaw({
          repos: [
            { name: "small", language: "Go", commits: 3 },
            { name: "big", language: "Go", commits: 30 },
          ],
        })
      ).topRepo
    ).toEqual({ name: "big", commits: 30 })
  })

  test("heatmap levels scale 0..4 against the busiest day", () => {
    const raw = makeRaw({
      days: [
        { date: "2024-01-07", count: 0 }, // 0        -> 0
        { date: "2024-01-08", count: 1 }, // .01      -> 1
        { date: "2024-01-09", count: 30 }, // .30     -> 2
        { date: "2024-01-10", count: 60 }, // .60     -> 3
        { date: "2024-01-11", count: 100 }, // max    -> 4
      ],
    })
    expect(
      computeStats(raw)
        .weeks.flat()
        .map((d) => d.level)
    ).toEqual([0, 1, 2, 3, 4])
  })

  test("weeks keep the raw calendar shape (partial first week, not padded)", () => {
    // 2024-01-03 is a Wednesday -> first week is Wed..Sat = 4 days
    const w = computeStats(
      makeRaw({ days: seq("2024-01-03", new Array(14).fill(1)) })
    ).weeks
    expect(w[0]).toHaveLength(4)
    expect(w[0][0].weekday).toBe(3)
  })

  test("does not throw on an empty calendar", () => {
    const s = computeStats(makeRaw({ days: [], repos: [] }))
    expect(s.weeks).toEqual([])
    expect(s.longestStreak).toBe(0)
    expect(s.busiestMonth).toEqual({ month: "", count: 0 })
    expect(s.topLanguages).toEqual([])
  })
})

// ---- isValidUsername ---------------------------------------------------

describe("isValidUsername", () => {
  test.each(["octokit", "a", "a-b-c", "torvalds", "x".repeat(39)])(
    "accepts %s",
    (u) => expect(isValidUsername(u)).toBe(true)
  )
  test.each([
    "",
    "-lead",
    "trail-",
    "a--b",
    "x".repeat(40),
    "has space",
    "under_score",
  ])("rejects %j", (u) => expect(isValidUsername(u)).toBe(false))
})