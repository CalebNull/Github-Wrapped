import type { WrappedStats } from "@/lib/wrapped"
import { StoryCard, BigStat } from "./story-card"
import { LanguageChart, WeekdayChart } from "./charts"

import Link from "next/link"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function monthName(yyyymm: string) {
  const m = Number(yyyymm.split("-")[1]) - 1
  return MONTHS[m] ?? yyyymm
}

export function buildCards(stats: WrappedStats): React.ReactNode[] {
  return [
    <StoryCard key="intro" gradient="from-violet-600 to-indigo-700">
      <div className="text-sm tracking-widest text-white/70 uppercase">
        {stats.year} GitHub Wrapped
      </div>
      <div className="font-heading text-4xl font-extrabold">
        {stats.name ?? stats.login}
      </div>
      <div className="text-white/70">Let&apos;s look back at your year.</div>
    </StoryCard>,

    <StoryCard key="contributions" gradient="from-emerald-600 to-green-700">
      <BigStat
        value={stats.totalContributions.toLocaleString()}
        label="contributions this year"
        sub={`${stats.totalCommits.toLocaleString()} commits · ${stats.pullRequests} PRs · ${stats.reviews} reviews`}
      />
    </StoryCard>,

    <StoryCard key="streak" gradient="from-orange-500 to-red-600">
      <BigStat
        value={`${stats.longestStreak}`}
        label="day longest streak"
        sub={
          stats.busiestDay.count > 0
            ? `Your biggest day: ${stats.busiestDay.count} contributions on ${stats.busiestDay.date}`
            : undefined
        }
      />
    </StoryCard>,

    <StoryCard key="month" gradient="from-sky-500 to-blue-600">
      <BigStat
        value={monthName(stats.busiestMonth.month)}
        label="was your busiest month"
        sub={`${stats.busiestMonth.count.toLocaleString()} contributions`}
      />
    </StoryCard>,

    <StoryCard key="weekday" gradient="from-teal-500 to-cyan-700">
      <div className="text-lg font-medium text-white/90">When you commit</div>
      <div className="pointer-events-auto w-full">
        <WeekdayChart data={stats.byWeekday} />
      </div>
    </StoryCard>,

    <StoryCard key="language" gradient="from-fuchsia-600 to-pink-700">
      <div className="text-lg font-medium text-white/90">
        Your top languages
      </div>
      {stats.topLanguages.length > 0 ? (
        <div className="pointer-events-auto w-full">
          <LanguageChart data={stats.topLanguages} />
        </div>
      ) : (
        <div className="text-base font-normal text-white/60">
          No language data this year
        </div>
      )}
    </StoryCard>,

    stats.topRepo && (
      <StoryCard key="repo" gradient="from-amber-500 to-yellow-600">
        <div className="text-lg font-medium text-white/90">
          Your most active repo
        </div>
        <div className="font-heading text-3xl font-extrabold break-all">
          {stats.topRepo.name}
        </div>
        <div className="text-white/70">
          {stats.topRepo.commits.toLocaleString()} commits
        </div>
      </StoryCard>
    ),

    <StoryCard key="summary" gradient="from-zinc-800 to-zinc-900">
      <div className="text-sm tracking-widest text-white/60 uppercase">
        {stats.name ?? stats.login} · {stats.year}
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-left">
        <Fact k="Contributions" v={stats.totalContributions.toLocaleString()} />
        <Fact k="Longest streak" v={`${stats.longestStreak}d`} />
        <Fact k="Top language" v={stats.topLanguages[0]?.name ?? "-"} />
        <Fact k="Busiest month" v={monthName(stats.busiestMonth.month)} />
      </div>
      <Link
        href="/"
        className="pointer-events-auto relative z-20 inline-block after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-bottom after:scale-x-0 after:bg-white after:transition-transform after:duration-150 after:ease-out after:content-[''] hover:after:scale-x-100"
      >
        Wrap up another
      </Link>
    </StoryCard>,
  ].filter(Boolean) as React.ReactNode[]
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="">
      <div className="text-xs tracking-wide text-white/50 uppercase">{k}</div>
      <div className="text-xl font-bold">{v}</div>
    </div>
  )
}
