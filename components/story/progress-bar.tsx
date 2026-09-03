export function ProgressBar({
  total,
  current,
}: {
  total: number
  current: number
}) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex gap-1 p-3">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
        >
          <div
            className="h-full rounded-full bg-white transition-all duration-300"
            style={{
              width: i < current ? "100%" : i === current ? "100%" : "0%",
            }}
          />
        </div>
      ))}
    </div>
  )
}
