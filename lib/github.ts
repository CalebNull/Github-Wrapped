import "server-only"
import { Octokit } from "octokit"

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

export async function fetchWrapped(login: string, year: number): Promise<RawWrapped> {
  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`
  const data = await octokit.graphql<GraphQLResponse>(QUERY, { login, from, to })
  if (!data.user) throw new Error("USER_NOT_FOUND")
  const c = data.user.contributionsCollection
  return {
    login,
    name: data.user.name,
    avatarUrl: data.user.avatarUrl,
    year,
    contributions: c,
    repos: c.commitContributionsByRepository
  }
}