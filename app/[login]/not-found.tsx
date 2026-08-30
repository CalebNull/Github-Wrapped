import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-semibold">No such GitHub user</h1>
      <p className="text-sm text-muted-foreground">
        We couldn&apos;t find that username on GitHub.
      </p>
      <Link href="/" className="text-sm underline underline-offset-2">
        Try another
      </Link>
    </main>
  )
}
