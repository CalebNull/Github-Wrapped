"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { WrappedStats } from "@/lib/wrapped"

type HeatDay = WrappedStats["weeks"][number][number]

const LEVEL_CLASS = [
  "bg-white/10",
  "bg-emerald-800",
  "bg-emerald-600",
  "bg-emerald-400",
  "bg-emerald-300",
]

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function Heatmap({ weeks }: { weeks: WrappedStats["weeks"] }) {
  const [hover, setHover] = useState<{
    day: HeatDay
    x: number
    y: number
  } | null>(null)

  const grid = useMemo(
    () =>
      weeks.map((week) => {
        const col: (HeatDay | null)[] = Array.from({ length: 7 }, () => null)
        for (const d of week) col[d.weekday] = d
        return col
      }),
    [weeks]
  )

  const months = useMemo(() => {
    const out: (string | null)[] = []
    let last = -1
    weeks.forEach((week, i) => {
      const d = week[0]
      const m = d ? Number(d.date.slice(5, 7)) - 1 : -1
      if (d && m !== last && i < weeks.length - 1) {
        out.push(MONTHS_SHORT[m])
        last = m
      } else {
        out.push(null)
      }
    })
    return out
  }, [weeks])

  return (
    <div
      data-heatmap
      className="relative flex w-full flex-col gap-1"
      onMouseLeave={() => setHover(null)}
    >
      <div className="flex w-full gap-0.5 text-[9px] leading-none text-white/50">
        {months.map((m, i) => (
          <div
            key={i}
            className="w-0 flex-1 overflow-visible whitespace-nowrap"
          >
            {m}
          </div>
        ))}
      </div>

      <div className="flex w-full gap-0.5">
        {grid.map((col, wi) => (
          <div key={wi} className="flex flex-1 flex-col gap-0.5">
            {col.map((day, wd) => (
              <div
                key={wd}
                onMouseEnter={(e) => {
                  if (!day) return
                  const host = e.currentTarget.closest("[data-heatmap]")!
                  const hb = host.getBoundingClientRect()
                  const cb = e.currentTarget.getBoundingClientRect()
                  setHover({
                    day,
                    x: cb.left - hb.left + cb.width / 2,
                    y: cb.top - hb.top,
                  })
                }}
                className={cn(
                  "aspect-square w-full rounded-[1px]",
                  day ? LEVEL_CLASS[day.level] : "opacity-0",
                  hover?.day.date === day?.date && day && "ring-1 ring-white"
                )}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 self-end text-[10px] text-white/50">
        Less
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={cn("size-2 rounded-[1px]", c)} />
        ))}
        More
      </div>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          {hover.day.count === 0
            ? "No contributions"
            : `${hover.day.count.toLocaleString()} contribution${hover.day.count === 1 ? "" : "s"}`}
          <span className="text-white/50"> · {fmtDate(hover.day.date)}</span>
        </div>
      )}
    </div>
  )
}
