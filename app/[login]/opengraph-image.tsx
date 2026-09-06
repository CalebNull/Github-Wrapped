{
  /* eslint-disable */
}

import type { ReactElement } from "react"
import { ImageResponse } from "next/og"
import { fetchWrapped } from "@/lib/github"
import { computeStats } from "@/lib/wrapped"
import { classifyPersona } from "@/lib/persona"
import { PersonaIcon } from "@/components/persona-icon"

export const alt = "GitHub Wrapped"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const revalidate = 86400 // has to app/[login]/page.tsx

export default async function Image({
  params,
}: {
  params: Promise<{ login: string }>
}) {
  const { login: rawLogin } = await params
  const login = decodeURIComponent(rawLogin)
  const year = new Date().getFullYear() - 1

  let body: ReactElement

  try {
    const stats = computeStats(await fetchWrapped(login, year))
    const persona = classifyPersona(stats)
    const topLang = stats.topLanguages[0]?.name ?? ""

    body = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          color: "white",
          backgroundColor: "#0f172a",
          backgroundImage:
            "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img
            src={stats.avatarUrl}
            width={96}
            height={96}
            alt=""
            style={{ borderRadius: 96 }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>
              {stats.name ?? stats.login}
            </div>
            <div style={{ fontSize: 24, opacity: 0.7 }}>
              @{stats.login} · {year} GitHub Wrapped
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1 }}>
              {stats.totalContributions.toLocaleString()}
            </div>
            <div style={{ fontSize: 28, opacity: 0.8 }}>contributions</div>
          </div>

          <div style={{ display: "flex", gap: 56 }}>
            <Stat label="Longest streak" value={`${stats.longestStreak}d`} />
            <Stat label="Top language" value={topLang} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 22, opacity: 0.6 }}>Persona</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PersonaIcon
                  name={persona.icon}
                  size={34}
                  color="white"
                  weight="fill"
                />
                <div style={{ fontSize: 34, fontWeight: 700 }}>
                  {persona.title}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch {
    body = (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a",
          color: "white",
          fontSize: 64,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        GitHub Wrapped
      </div>
    )
  }

  return new ImageResponse(body, { ...size })
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 22, opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700 }}>{value}</div>
    </div>
  )
}
