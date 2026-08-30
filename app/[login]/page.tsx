import { notFound } from "next/navigation"
import { fetchWrapped } from "@/lib/github"
import { computeStats } from "@/lib/wrapped"

export const revalidate = 86400

export default async function Wrapped({
  params,
}: {
  params: Promise<{ login: string }>
}) {
  const { login } = await params
  const year = new Date().getFullYear() - 1

  let raw
  try {
    raw = await fetchWrapped(decodeURIComponent(login), year)
  } catch (e) {
    if (e instanceof Error && e.message === "USER_NOT_FOUND") notFound()
    throw e
  }

  const stats = computeStats(raw)

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-3xl font-bold">
        {stats.name ?? stats.login}&apos;s {year}
      </h1>
      <p>{stats.totalContributions} contributions</p>
      <p>Longest streak: {stats.longestStreak} days</p>
      <p>Busiest month: {stats.busiestMonth.month}</p>
      <p>Top language: {stats.topLanguages[0]?.name}</p>
    </main>
  )
}
