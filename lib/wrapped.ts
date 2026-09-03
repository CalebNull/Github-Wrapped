import type { RawWrapped } from "./github"

export type WrappedStats = {
  login: string,
  name: string | null,
  avatarUrl: string,
  year: number,
  totalContributions: number,
  totalCommits: number,
  pullRequests: number,
  issues: number,
  reviews: number,
  longestStreak: number,
  busiestDay: { date: string, count: number },
  busiestMonth: { month: string, count: number },
  topLanguages: { name: string, commits: number }[],
  topRepo: { name:string, commits: number } | null
  byWeekday: { day: string; count: number; }[],
}

export function computeStats(raw: RawWrapped): WrappedStats {
  const days = raw.contributions.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .sort((a, b) => a.date.localeCompare(b.date))

  // Longest streak
  let streak =0, longest = 0
  for (const d of days) {
    if (d.contributionCount > 0) { streak++; longest = Math.max(longest, streak) }
    else streak = 0
  }

  // Busiest day
  const busiestDay = days.reduce<{ date: string; count: number }> (
    (m, d) => 
      d.contributionCount > m.count ? { date: d.date, count: d.contributionCount } : m, { date: "", count: 0 }
  )
  
    // Busiest month
    const byMonth = new Map<string, number>()
    for (const d of days) {
      const key = d.date.slice(0, 7) // YYYY-MM
      byMonth.set(key, (byMonth.get(key) ?? 0) + d.contributionCount)
    }
    const [bm, bmCount] = [...byMonth.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0]

    // Contributions by weekday
    const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weekdayTotals = new Array(7).fill(0)
    for (const d of days) {
      weekdayTotals[d.weekday] += d.contributionCount
    }
    const byWeekday = weekdayTotals.map((count, i) => ({ day: WEEKDAYS[i], count }))

    // Languages + top repo (from commitContributionsByRepository)
    const langs = new Map<string, number>()
    let topRepo: WrappedStats["topRepo"] = null
    for (const r of raw.repos) {
      const commits = r.contributions.totalCount
      const lang = r.repository.primaryLanguage?.name
      if (lang) langs.set(lang, (langs.get(lang) ?? 0) + commits)
        if (!topRepo || commits > topRepo.commits) {
          topRepo = { name:r.repository.name, commits }
        } 
    }

    return {
      login: raw.login,
      name: raw.name,
      avatarUrl: raw.avatarUrl,
      year: raw.year,
      totalContributions: raw.contributions.contributionCalendar.totalContributions,
      totalCommits: raw.contributions.totalCommitContributions,
      pullRequests: raw.contributions.totalPullRequestContributions,
      issues: raw.contributions.totalIssueContributions,
      reviews: raw.contributions.totalPullRequestReviewContributions,
      longestStreak: longest,
      busiestDay,
      busiestMonth: { month: bm, count: bmCount },
      topLanguages: [...langs.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([name, commits]) => ({ name, commits })),
      topRepo,
      byWeekday,
    }
}

const GITHUB_USERNAME = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

export function isValidUsername(input: string): boolean {
  return GITHUB_USERNAME.test(input)
}