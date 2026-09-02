export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* blob 1 */}
      <div className="aurora-blob absolute top-[10%] left-[5%] h-[45vmax] w-[45vmax] animate-[aurora-a_18s_ease-in-out_infinite] rounded-full bg-aurora-1 opacity-60 blur-[80px] will-change-transform [animation-delay:-3s]" />

      {/* blob 2 */}
      <div className="aurora-blob absolute top-[0%] right-[0%] h-[40vmax] w-[40vmax] animate-[aurora-b_24s_ease-in-out_infinite] rounded-full bg-aurora-2 opacity-50 blur-[90px] will-change-transform [animation-delay:-9s]" />

      {/* blob 3 */}
      <div className="aurora-blob absolute bottom-[0%] left-[25%] h-[38vmax] w-[38vmax] animate-[aurora-c_20s_ease-in-out_infinite] rounded-full bg-aurora-3 opacity-55 blur-[100px] will-change-transform [animation-delay:-5s]" />

      {/* soft glow */}
      <div className="absolute inset-0 m-auto flex h-[32vmax] w-[32vmax] translate-y-[4vmax] items-center justify-center">
        <div className="aurora-blob h-full w-full animate-[aurora-a_28s_ease-in-out_infinite_reverse] rounded-full bg-aurora-4 opacity-70 blur-[80px] will-change-transform" />
      </div>
    </div>
  )
}
