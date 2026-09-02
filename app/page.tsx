import { redirect } from "next/navigation"
import { UsernameForm } from "@/components/username-form"
import { isValidUsername } from "@/lib/wrapped"

async function wrap(formData: FormData) {
  "use server"
  const raw = String(formData.get("login") ?? "").trim()

  const login = raw
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/.*$/, "")

  if (!isValidUsername(login)) {
    redirect(`/?error=invalid`)
  }
  redirect(`/${encodeURIComponent(login)}`)
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">GitHub Wrapped</h1>
          <p className="text-sm text-muted-foreground">
            Your year in commits, streaks, and languages — in one shareable
            recap.
          </p>
        </div>

        <UsernameForm action={wrap} />

        {error === "invalid" && (
          <p className="text-sm text-destructive">
            That doesn&apos;t look like a GitHub username.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Try{" "}
          <a
            href="https://github.com/octokit"
            className="underline underline-offset-2"
          >
            octokit
          </a>{" "}
          · uses public data only
        </p>
      </div>
    </main>
  )
}
