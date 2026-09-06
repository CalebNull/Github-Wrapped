/* eslint-disable @next/next/no-img-element -- next/og requires a plain <img> */
import type { ReactElement } from "react"
import { ImageResponse } from "next/og"
import { fetchWrapped } from "@/lib/github"
import { computeStats } from "@/lib/wrapped"
import { classifyPersona } from "@/lib/persona"

export const alt = "GitHub Wrapped"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const revalidate = 86400 // keep in sync with app/[login]/page.tsx

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
    const topLang = stats.topLanguages[0]?.name ?? "—"

    let avatarSrc: string | null = null
    try {
      const res = await fetch(stats.avatarUrl)
      if (!res.ok) {
        console.warn(
          `[og-image] avatar for ${login}: ${res.status} ${res.statusText}`
        )
      } else {
        const buf = await res.arrayBuffer()
        const type = res.headers.get("content-type") ?? "image/png"
        avatarSrc = `data:${type};base64,${Buffer.from(buf).toString("base64")}`
      }
    } catch (err) {
      console.warn(`[og-image] avatar fetch for ${login} failed:`, err)
    }

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
          {avatarSrc && (
            <img
              src={avatarSrc}
              width={96}
              height={96}
              alt=""
              style={{ borderRadius: 96 }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>
              {stats.name ?? stats.login}
            </div>
            <div style={{ fontSize: 24, opacity: 0.7 }}>
              {`@${stats.login} · ${year} GitHub Wrapped`}
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
            <Stat label="Persona" value={persona.title} />
          </div>
        </div>
      </div>
    )
  } catch (err) {
    console.error("[og-image] render failed:", err)
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
