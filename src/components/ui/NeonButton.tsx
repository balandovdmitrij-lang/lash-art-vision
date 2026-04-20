import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'violet' | 'gradient'
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

export function NeonButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  fullWidth = false,
}: Props) {
  const base =
    'relative inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-sm transition-all select-none overflow-hidden'

  const variants = {
    primary:
      'bg-cyber-pink text-white shadow-neon hover:shadow-[0_0_40px_rgba(255,45,138,0.8)] active:scale-95',
    gradient:
      'text-white active:scale-95 shadow-neon hover:shadow-[0_0_50px_rgba(155,93,229,0.6)]',
    violet:
      'bg-electric-violet text-white shadow-neon-violet hover:shadow-[0_0_40px_rgba(155,93,229,0.8)] active:scale-95',
    secondary:
      'border border-cyber-pink text-cyber-pink glass hover:bg-cyber-pink/10 active:scale-95',
    ghost: 'text-text-muted hover:text-text-primary active:scale-95',
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`${base} ${variant !== 'gradient' ? variants[variant] : variants.gradient} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={variant === 'gradient' ? {
        background: 'linear-gradient(135deg, #FF2D8A 0%, #9B5DE5 60%, #00D4FF 100%)',
        backgroundSize: '200% 200%',
      } : undefined}
    >
      {variant === 'gradient' && (
        <span
          className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #FF2D8A 0%, #9B5DE5 60%, #00D4FF 100%)', filter: 'brightness(1.2)' }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
