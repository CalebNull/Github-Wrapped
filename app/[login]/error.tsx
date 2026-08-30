"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const rateLimited =
    error.message.includes("rate limit") || error.message.includes("API rate")

  return (
    <div className="mx-auto max-w-md p-6">
      <h2 className="text-xl font-medium">
        {rateLimited
          ? "GitHub rate limit hit - try again in a minute."
          : "Something broke."}
      </h2>
      <Button onClick={reset} className="mt-3 underline">
        Retry
      </Button>
    </div>
  )
}
