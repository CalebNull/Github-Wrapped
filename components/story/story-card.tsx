import { cn } from "@/lib/utils"

export function StoryCard({
  gradient = "from-zinc-900 to-zinc-800",
  children,
  className,
}: {
  gradient?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br px-8 text-center text-white",
        gradient,
        className
      )}
    >
      {children}
    </div>
  )
}

export function BigStat({
  value,
  label,
  sub,
}: {
  value: React.ReactNode
  label: string
  sub?: string
}) {
  return (
    <>
      <div className="font-heading text-6xl font-extrabold tabular-nums sm:text-7xl">
        {value}
      </div>
      <div className="text-lg font-medium text-white/90">{label}</div>
      {sub && <div className="text-sm text-white/60">{sub}</div>}
    </>
  )
}
