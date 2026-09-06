export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* blob 1 */}
      <div className="aurora-blob absolute top-[10%] left-[5%] h-[45vmax] w-[45vmax] rounded-full bg-aurora-1 opacity-60 blur-[80px]" />

      {/* blob 2 */}
      <div className="aurora-blob absolute top-[0%] right-[0%] h-[40vmax] w-[40vmax] rounded-full bg-aurora-2 opacity-50 blur-[90px]" />

      {/* blob 3 */}
      <div className="aurora-blob absolute bottom-[0%] left-[25%] h-[38vmax] w-[38vmax] rounded-full bg-aurora-3 opacity-55 blur-[100px]" />

      {/* soft glow */}
      <div className="absolute inset-0 m-auto flex h-[32vmax] w-[32vmax] items-center justify-center">
        <div className="aurora-blob h-full w-full rounded-full bg-aurora-4 opacity-70 blur-[80px]" />
      </div>
    </div>
  )
}
