import type { WrappedStats } from "./wrapped";

export type Persona = {
  key: string
  title: string
  blurb: string
  emoji: string
}

export function classifyPersona(s: WrappedStats): Persona {
  const langTotal = s.topLanguages.reduce((n, l) => n + l.commits, 0)
  const topLangShare = langTotal > 0 ? s.topLanguages[0].commits / langTotal : 0
  const topLang = s.topLanguages[0]?.name ?? "code"

  const weekdayTotal = s.byWeekday.reduce((n, d) => n + d.count, 0)
  const weekendShare = weekdayTotal > 0 ? (s.byWeekday[0].count + s.byWeekday[6].count) / weekdayTotal : 0
  const weekdayShare = weekdayTotal > 0 ? 1 - weekendShare : 0

  const monthShare = s.totalContributions > 0 ? s.busiestMonth.count / s.totalContributions : 0

  // First match wins - order = priority
  if (s.totalContributions === 0) {
    return {
      key: "ghost",
      title: "The Ghost",
      blurb: "A quiet year on GitHub. Next year's the one.",
      emoji: "👻"
    }
  }

  if (s.reviews >= 10 && s.reviews >= s.totalCommits) {
    return {
      key: "reviewer",
      title: "The Reviewer",
      blurb: "You spent more time in other people's pull requests than your own.",
      emoji: "🔍"
    }
  }

  if (s.pullRequests >= 30 && s.pullRequests >= s.totalCommits * 0.5) {
    return {
      key: "shipper",
      title: "The Shipper",
      blurb: "Open, review, merge, repeat. The pipeline never stopped.",
      emoji: "🚢"
    }
  }

  if (s.topRepo && s.repoCount <= 2 && s.topRepo.commits >= s.totalCommits * 0.8) {
    return {
      key: "lone-wolf",
      title: "The Lone Wolf",
      blurb: `Almost every commit landed in ${s.topRepo.name}.`,
      emoji: "🐺"
    }
  }

  if (s.topLanguages.length >= 4 && topLangShare < 0.5) {
    return {
      key: "polyglot",
      title: "The Polyglot",
      blurb: `${s.topLanguages.length} languages and no clear favorite.`,
      emoji: "🗣️"
    }
  }

  if (topLangShare >= 0.8) {
    return {
      key: "specialist",
      title: "The Specialist",
      blurb: `${topLang}, ${topLang}, and a little more ${topLang}.`,
      emoji: "🎯"
    }
  }

  if (s.longestStreak >= 30) {
    return {
      key: "streak-keeper",
      title: "The Streak Keeper",
      blurb: `${s.longestStreak} days in a row without missing.`,
      emoji: "🔥"
    }
  }

  if (weekendShare >= 0.4) {
    return {
      key: "weekend-warrior",
      title: "The Weekend Warrior",
      blurb: `Weekdays are for meetings. Weekends are for shipping.`,
      emoji: "🏕️"
    }
  }

  if (weekdayShare >= 0.95)
    return {
      key: "nine-to-five",
      title: "The Nine-to-Five",
      blurb: "Clocks in, commits, clocks out. Weekends off.",
      emoji: "🏢",
    }

  if (monthShare >= 0.4)
    return {
      key: "sprinter",
      title: "The Sprinter",
      blurb: "One big month carried the whole year.",
      emoji: "⚡",
    }

  if (s.activeDays >= 200)
    return {
      key: "marathoner",
      title: "The Marathoner",
      blurb: `Active on ${s.activeDays} days. Steady the whole way.`,
      emoji: "🏃",
    }

  return {
    key: "explorer",
    title: "The Explorer",
    blurb: "A bit of everything, spread across the year.",
    emoji: "🧭",
  }
}