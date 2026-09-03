"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { WrappedStats } from "@/lib/wrapped"
import { buildCards } from "./cards"
import { ProgressBar } from "./progress-bar"

export function Story({ stats }: { stats: WrappedStats }) {
  const cards = useMemo(() => buildCards(stats), [stats])
  const [index, setIndex] = useState(0)

  const clamp = useCallback(
    (n: number) => Math.max(0, Math.min(cards.length - 1, n)),
    [cards.length]
  )
  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp])
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp])

  // keyboard inputs
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        next()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev])

  // swipe inputs
  const [touchX, setTouchX] = useState<number | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    setTouchX(e.touches[0].clientX)
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    if (dx < -40) next()
    else if (dx > 40) prev()
    setTouchX(null)
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-0 sm:p-6">
      <div
        className="relative aspect-9/16 h-svh w-full max-w-107.5 overflow-hidden bg-zinc-900 sm:h-auto sm:max-h-[90svh] sm:rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ProgressBar total={cards.length} current={index} />

        <div
          className="pointer-events-none relative z-20 h-full w-full animate-in duration-300 fade-in"
          key={index}
        >
          {cards[index]}
        </div>

        <button
          aria-label="Previous"
          className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-default"
          onClick={prev}
        />
        <button
          aria-label="Next"
          className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-default"
          onClick={next}
        />
        <Link
          href="/"
          className="absolute top-6 right-3 z-30 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition backdrop:blur hover:bg-white/25"
        >
          Try another
        </Link>
      </div>
    </div>
  )
}
