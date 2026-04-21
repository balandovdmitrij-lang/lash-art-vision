import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { sendOTP } from '../../lib/firebase'
import { supabase } from '../../lib/supabase'

export function OTPScreen() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const { phone, confirmationResult, setAuthScreen, setFirebaseUid, setConfirmationResult } = useAuthStore()

  useEffect(() => {
    refs.current[0]?.focus()
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true)
          clearInterval(interval)
          return 0
        }
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
    if (val && i < 5) refs.current[i + 1]?.focus()

    // Auto-submit when all filled
    const complete = newDigits.every((d) => d)
    if (complete) verify(newDigits.join(''))
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const arr = pasted.split('')
      setDigits(arr)
      refs.current[5]?.focus()
      verify(pasted)
    }
  }

  const verify = async (code: string) => {
    if (!confirmationResult) {
      setError('Сессия истекла. Запроси код снова')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await confirmationResult.confirm(code)
      const uid = result.user.uid
      setFirebaseUid(uid)

      // Check if user exists in Supabase
      const { data: existing } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single()

      if (existing) {
        useAuthStore.getState().setProfile(existing)
      } else {
        setAuthScreen('role_select')
      }
    } catch {
      setError('Неверный код. Проверь SMS')
      setDigits(['', '', '', '', '', ''])
      refs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (!phone || !canResend) return
    setTimer(60)
    setCanResend(false)
    setError('')
    try {
      const result = await sendOTP(phone)
      setConfirmationResult(result)
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
          <div className="text-4xl mb-3">📱</div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Введи код</h2>
          <p className="text-text-muted text-sm">
            Отправили SMS на{' '}
            <span className="text-cyber-pink font-semibold">{phone}</span>
          </p>
        </div>

        <GlassCard className="p-6">
          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
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
                className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border transition-all focus:outline-none ${
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
            onClick={() => code.length === 6 && verify(code)}
            disabled={code.length < 6 || loading}
            fullWidth
            variant="gradient"
          >
            {loading ? 'Проверяем…' : 'Подтвердить →'}
          </NeonButton>
        </GlassCard>

        {/* Resend */}
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
