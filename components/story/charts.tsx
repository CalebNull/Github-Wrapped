"use client"

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import type { WrappedStats } from "@/lib/wrapped"

export function WeekdayChart({ data }: { data: WrappedStats["byWeekday"] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <XAxis
          dataKey="day"
          tick={{ fill: "rgba(255,255,255,0.7", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          fill="rgba(255,255,255,0.85"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function LanguageChart({
  data,
}: {
  data: WrappedStats["topLanguages"]
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 8 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fill: "rgba(255,255,255,0.85", fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="commits" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill="rgba(255,255,255,0.85" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
