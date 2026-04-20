import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  neon?: boolean
  shimmer?: boolean
  delay?: number
  tilt?: boolean
}

export function GlassCard({ children, className = '', neon = false, shimmer = false, delay = 0, tilt = true }: Props) {
  const borderClass = shimmer
    ? 'shimmer-border'
    : neon
    ? 'glass-vivid neon-border border'
    : 'glass'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-2xl p-4 ${borderClass} ${tilt ? 'card-3d' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
