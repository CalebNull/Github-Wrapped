import { notFound } from "next/navigation"
import { fetchWrapped } from "@/lib/github"
import { computeStats } from "@/lib/wrapped"
import { Story } from "@/components/story/story"

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

  return <Story stats={computeStats(raw)} />
}
