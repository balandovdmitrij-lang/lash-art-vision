import { useState } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { sendOTP } from '../../lib/firebase'

const COUNTRY_CODES = [
  { code: '+7', flag: '🇷🇺', label: 'RU' },
  { code: '+380', flag: '🇺🇦', label: 'UA' },
  { code: '+375', flag: '🇧🇾', label: 'BY' },
  { code: '+7', flag: '🇰🇿', label: 'KZ' },
]

export function PhoneScreen() {
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuthScreen, setPhone: storePhone, setConfirmationResult } = useAuthStore()

  const fullPhone = `${countryCode.code}${phone.replace(/\D/g, '')}`
  const isValid = phone.replace(/\D/g, '').length >= 10

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`
  }

  const handleSend = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const result = await sendOTP(fullPhone)
      setConfirmationResult(result)
      storePhone(fullPhone)
      setAuthScreen('otp')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка отправки SMS'
      if (msg.includes('invalid-phone')) {
        setError('Неверный формат номера')
      } else if (msg.includes('too-many-requests')) {
        setError('Слишком много попыток. Подожди немного')
      } else {
        setError('Не удалось отправить SMS. Проверь номер')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-12 bg-obsidian">
      <div className="orb orb-pink" style={{ top: '-10%', right: '-20%', width: '280px', height: '280px' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-2xl font-display font-bold neon-text tracking-wider mb-1">
          LASH ART VISION
        </div>
        <p className="text-text-muted text-sm">Вход по номеру телефона</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full space-y-4"
      >
        <GlassCard className="p-6">
          <p className="text-white font-semibold mb-4 text-center">Введи номер телефона</p>

          {/* Country + Phone input */}
          <div className="flex gap-2 mb-4">
            {/* Country selector */}
            <div className="relative">
              <select
                className="h-12 pl-3 pr-7 rounded-xl bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-cyber-pink/50"
                value={countryCode.code}
                onChange={(e) => {
                  const found = COUNTRY_CODES.find((c) => c.code === e.target.value && c.label === e.target.selectedOptions[0].dataset.label)
                  if (found) setCountryCode(found)
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.label} value={c.code} data-label={c.label}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">▾</div>
            </div>

            {/* Phone input */}
            <input
              type="tel"
              inputMode="numeric"
              placeholder="900 000-00-00"
              value={formatPhone(phone)}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSend()}
              className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted text-base focus:outline-none focus:border-cyber-pink/60 transition-colors"
            />
          </div>

          {/* Full phone preview */}
          {phone.replace(/\D/g, '').length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-text-muted text-sm mb-3"
            >
              Отправим SMS на{' '}
              <span className="text-cyber-pink font-semibold">{fullPhone}</span>
            </motion.p>
          )}

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

      <div id="recaptcha-container" />
    </div>
  )
}
