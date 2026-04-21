import { useState } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { sendOTP } from '../../lib/auth'

export function PhoneScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuthScreen, setEmail: storeEmail } = useAuthStore()

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSend = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      await sendOTP(email)
      storeEmail(email)
      setAuthScreen('otp')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || 'Не удалось отправить код')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-12 bg-obsidian">
      <div className="orb orb-pink" style={{ top: '-10%', right: '-20%', width: '280px', height: '280px' }} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-2xl font-display font-bold neon-text tracking-wider mb-1">
          LASH ART VISION
        </div>
        <p className="text-text-muted text-sm">Вход по email</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full space-y-4"
      >
        <GlassCard className="p-6">
          <p className="text-white font-semibold mb-4 text-center">Введи свой email</p>

          <input
            type="email"
            inputMode="email"
            placeholder="example@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && isValid && handleSend()}
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted text-base focus:outline-none focus:border-cyber-pink/60 transition-colors mb-4"
          />

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center mb-3"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <NeonButton
            onClick={handleSend}
            disabled={!isValid || loading}
            fullWidth
            variant="gradient"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ⟳
                </motion.span>
                Отправляем…
              </span>
            ) : (
              'Получить код →'
            )}
          </NeonButton>
        </GlassCard>

        <p className="text-center text-text-muted text-xs px-4">
          Продолжая, ты соглашаешься с{' '}
          <span className="text-cyber-pink">условиями использования</span>
        </p>
      </motion.div>

      <div className="text-center">
        <p className="text-text-muted text-xs">✨ Первый вход = регистрация</p>
      </div>
    </div>
  )
}
