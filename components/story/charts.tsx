"use client"

import type { CSSProperties } from "react"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { WrappedStats } from "@/lib/wrapped"

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  "Jupyter Notebook": "#DA5B0B",
}
const FALLBACK_COLOR = "rgba(255,255,255,0.85)"

const tooltipStyle: CSSProperties = {
  backgroundColor: "rgba(0,0,0,0.8)",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
}
const cursorStyle = { fill: "rgba(255,255,255,0.12)" }

export function WeekdayChart({ data }: { data: WrappedStats["byWeekday"] }) {
  const max = Math.max(...data.map((d) => d.count), 0)
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
        <Tooltip
          cursor={cursorStyle}
          contentStyle={tooltipStyle}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: "rgba(255,255,255,0.6)" }}
          formatter={(value) => [
            Number(value).toLocaleString(),
            "contributions",
          ]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell
              key={d.day}
              fill={
                d.count === max && max > 0 ? "#fff" : "rgba(255,255,255,0.55)"
              }
            />
          ))}
        </Bar>
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
          tick={{ fill: "rgba(255,255,255,0.85)", fontSize: 13 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={cursorStyle}
          contentStyle={tooltipStyle}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: "rgba(255,255,255,0.6)" }}
          formatter={(value) => [Number(value).toLocaleString(), "commits"]}
        />
        <Bar dataKey="commits" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell
              key={d.name}
              fill={LANGUAGE_COLORS[d.name] ?? FALLBACK_COLOR}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
