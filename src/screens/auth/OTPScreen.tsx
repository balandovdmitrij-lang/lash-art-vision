import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { sendOTP, verifyOTP } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../lib/supabase'

export function OTPScreen() {
  const [digits, setDigits] = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const { email, setAuthScreen, setUserId } = useAuthStore()

  useEffect(() => {
    refs.current[0]?.focus()
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { setCanResend(true); clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDigit = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const newDigits = [...digits]
    newDigits[i] = val.slice(-1)
    setDigits(newDigits)
    if (val && i < 7) refs.current[i + 1]?.focus()
    if (newDigits.every((d) => d)) verify(newDigits.join(''))
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (pasted.length === 8) {
      const arr = pasted.split('')
      setDigits(arr)
      refs.current[7]?.focus()
      verify(pasted)
    }
  }

  const verify = async (code: string) => {
    if (!email) { setError('Сессия истекла. Запроси код снова'); return }
    setLoading(true)
    setError('')
    try {
      const { user } = await verifyOTP(email, code)
      if (!user) throw new Error('no user')
      setUserId(user.id)

      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existing) {
        useAuthStore.getState().setProfile(existing as UserProfile)
      } else {
        setAuthScreen('role_select')
      }
    } catch {
      setError('Неверный код. Проверь почту')
      setDigits(['', '', '', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (!email || !canResend) return
    setTimer(60)
    setCanResend(false)
    setError('')
    try {
      await sendOTP(email)
    } catch {
      setError('Не удалось отправить. Попробуй позже')
    }
  }

  const code = digits.join('')

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-12 bg-obsidian">
      <div className="orb orb-violet" style={{ top: '-5%', left: '-15%', width: '260px', height: '260px' }} />

      <motion.button
        onClick={() => setAuthScreen('phone')}
        className="self-start flex items-center gap-2 text-text-muted hover:text-white transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        ← Назад
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Введи код</h2>
          <p className="text-text-muted text-sm">
            Отправили код на{' '}
            <span className="text-cyber-pink font-semibold">{email}</span>
          </p>
        </div>

        <GlassCard className="p-6">
          <div className="flex gap-1.5 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <motion.input
                key={i}
                ref={(el) => { refs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                animate={d ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.15 }}
                className={`w-9 h-12 text-center text-xl font-bold rounded-xl border transition-all focus:outline-none ${
                  d
                    ? 'bg-cyber-pink/20 border-cyber-pink text-white shadow-neon-sm'
                    : 'bg-white/5 border-white/15 text-white focus:border-cyber-pink/60'
                }`}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center mb-4"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <NeonButton
            onClick={() => code.length === 8 && verify(code)}
            disabled={code.length < 8 || loading}
            fullWidth
            variant="gradient"
          >
            {loading ? 'Проверяем…' : 'Подтвердить →'}
          </NeonButton>
        </GlassCard>

        <div className="text-center">
          {canResend ? (
            <motion.button
              onClick={resend}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-cyber-pink text-sm font-semibold hover:underline"
            >
              Отправить код снова
            </motion.button>
          ) : (
            <p className="text-text-muted text-sm">
              Повторная отправка через{' '}
              <span className="text-white font-semibold tabular-nums">{timer}с</span>
            </p>
          )}
        </div>
      </motion.div>

      <div />
    </div>
  )
}
