interface Props {
  progress: number // 0–1
  size?: number
  label?: string
}

export function ProgressRing({ progress, size = 80, label }: Props) {
  const r = (size - 8) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E1E35" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#neonGrad)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
        <defs>
          <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E91E8C" />
            <stop offset="100%" stopColor="#C9A96E" />
          </linearGradient>
        </defs>
      </svg>
      {label && (
        <span className="absolute text-xs font-bold text-cyber-pink">{label}</span>
      )}
    </div>
  )
}
