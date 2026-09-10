"use client"

import { useState } from "react"
import type { WrappedStats } from "@/lib/wrapped"

export function ShareButton({ stats }: { stats: WrappedStats }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    const url = window.location.href
    const data = {
      title: `${stats.name ?? stats.login}'s ${stats.year} GitHub Wrapped`,
      text: `${stats.totalContributions.toLocaleString()} contributions · ${stats.longestStreak}-day streak · ${stats.topLanguages[0]?.name ?? "code"}`,
      url,
    }

    // Mobile / supported browsers: native share sheet
    if (navigator.canShare?.(data)) {
      try {
        await navigator.share(data)
      } catch {
        /* user dismissed */
      }
      return
    }

    // Desktop fallback: copy the link
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      onClick={share}
      className="hover:bg-white-90 pointer-events-auto relative z-20 rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-900 transition"
    >
      {copied ? "Link copied ✓" : "Share"}
    </button>
  )
}
