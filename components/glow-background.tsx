export function GlowBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* soft glow */}
      <div className="w-[32vmax]bun absolute inset-0 m-auto flex h-[32vmax] items-center justify-center">
        <div className="aurora-blob h-full w-[50%] rounded-full bg-aurora-4 opacity-40 blur-[80px]" />
      </div>
    </div>
  )
}
