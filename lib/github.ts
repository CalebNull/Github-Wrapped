import "server-only"
import { Octokit } from "octokit"
import { redis } from "./redis"

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export type ContributionDay = {
  date: string
  contributionCount: number
  weekday: number
}

export type RepoContribution = {
  repository: {
    name: string
    primaryLanguage: { name: string } | null
    stargazerCount: number
  }
  contributions: { totalCount: number }
}

export type ContributionsCollection = {
  totalCommitContributions: number
  totalPullRequestContributions: number
  totalIssueContributions: number
  totalPullRequestReviewContributions: number
  contributionCalendar: {
    totalContributions: number
    weeks: { contributionDays: ContributionDay[] }[]
  }
  commitContributionsByRepository: RepoContribution[]
}

export type RawWrapped = {
  login: string
  name: string | null
  avatarUrl: string
  year: number
  contributions: ContributionsCollection
  repos: RepoContribution[]
}

export type GraphQLResponse = {
  user: {
    name: string | null
    avatarUrl: string
    contributionsCollection: ContributionsCollection
  } | null
}

const QUERY = `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      name
      avatarUrl
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount weekday } }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          repository { name primaryLanguage { name } stargazerCount }
          contributions { totalCount }
        }
      }
    }
  }
`

const CACHE_TIL = 60 * 60 * 24 // 24h for a successful lookup
const NEG_TIL = 60 * 60 // 1h for "no such user" (negative cache)

export async function fetchWrapped(login: string, year: number): Promise<RawWrapped> {
  const key = `wrapped:v1:${login.toLowerCase()}:${year}`

  if (redis) {
    const cached = await redis.get<RawWrapped | { notFound: true }>(key)
    if (cached) {
      if ("notFound" in cached) throw new Error("USER_NOT_FOUND")
      return cached
    }
  }

  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`

  let data: GraphQLResponse
  try {
    data = await octokit.graphql<GraphQLResponse>(QUERY, { login, from, to })
  } catch (e) {
    // GitHub returns NOT_FOUND for unknown logins *and* for orgs (octokit, vercel...)
    const errors = (e as { errors?: { type?: string }[] })?.errors
    if (Array.isArray(errors) && errors.some((x) => x?.type === "NOT_FOUND")) {
      if (redis) await redis.set(key, { notFound: true }, { ex: NEG_TIL })
      throw new Error("USER_NOT_FOUND")
    }
    throw e
  }


  if (!data.user) {
    if (redis) await redis.set(key, { notFound: true }, { ex: NEG_TIL })
    throw new Error("USER_NOT_FOUND")
  }
  const c = data.user.contributionsCollection
  const result: RawWrapped = {
    login,
    name: data.user.name,
    avatarUrl: data.user.avatarUrl,
    year,
    contributions: c,
    repos: c.commitContributionsByRepository,
  }

  if (redis) await redis.set(key, result, { ex: CACHE_TIL })
  return result
}