import { notFound } from "next/navigation"
import { fetchWrapped } from "@/lib/github"
import { computeStats } from "@/lib/wrapped"
import { Story } from "@/components/story/story"
import type { Metadata } from "next"

export const revalidate = 86400

export async function generateMetadata({
  params,
}: {
  params: Promise<{ login: string }>
}): Promise<Metadata> {
  const { login } = await params
  const name = decodeURIComponent(login)
  const year = new Date().getFullYear() - 1

  return {
    title: `${name}'s ${year} GitHub Wrapped`,
    description: `${name}'s year on GitHub - contributions, streaks, languages, and more.`,
  }
}

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

  return <Story stats={stats} />
}
