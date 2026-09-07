export function GlowBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div className="absolute -top-[10%] -left-[10%] h-[45vmax] w-[45vmax] rounded-full bg-aurora-1 opacity-60 blur-[90px]" />
      <div className="absolute -top-[15%] -right-[10%] h-[40vmax] w-[40vmax] rounded-full bg-aurora-2 opacity-50 blur-[100px]" />
      <div className="absolute -bottom-[15%] left-[25%] h-[38vmax] w-[38vmax] rounded-full bg-aurora-3 opacity-55 blur-[110px]" />
      <div className="absolute inset-0 left-[40%] m-auto h-[30vmax] w-[30vmax] rounded-full bg-aurora-4 opacity-40 blur-[80px]" />
    </div>
  )
}
