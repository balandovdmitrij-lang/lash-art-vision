import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { signIn, signUp, resendConfirmation } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../lib/supabase'

export function LoginScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendMsg, setResendMsg] = useState('')
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { setAuthScreen, setUserId, setEmail: storeSetEmail } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    try {
      const { user } = await signIn(email, password)
      if (!user) throw new Error('no user')
      setUserId(user.id)
      storeSetEmail(email)
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('Invalid login credentials')) {
        setError('Неверный email или пароль')
      } else if (msg.includes('Email not confirmed')) {
        setError('Подтверди email — письмо отправлено при регистрации')
      } else {
        setError('Ошибка входа. Проверь данные')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!email || !password) return
    if (password !== confirm) { setError('Пароли не совпадают'); return }
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return }
    setLoading(true)
    setError('')
    try {
      const { user, session } = await signUp(email, password)
      if (!user) throw new Error('no user')
      setUserId(user.id)
      storeSetEmail(email)
      // If session exists immediately — email confirmation is disabled, go straight in
      if (session) {
        setAuthScreen('role_select')
      } else {
        // Email confirmation required — show "check email" screen
        setCheckEmail(true)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('Email уже зарегистрирован — войди')
      } else {
        setError('Ошибка регистрации. Попробуй ещё раз')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return
    try {
      await resendConfirmation(email)
      setResendMsg('Письмо отправлено! Проверь почту и папку «Спам»')
      setResendCooldown(60)
      cooldownRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      setResendMsg('Не удалось отправить. Попробуй через минуту')
    }
  }

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }
  }, [])

  const switchTab = (t: 'login' | 'register') => {
    setTab(t)
    setError('')
    setPassword('')
    setConfirm('')
  }

  // "Check email" state after registration
  if (checkEmail) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 bg-obsidian">
        <div className="orb orb-violet" style={{ top: '-5%', left: '-15%', width: '260px', height: '260px' }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10 space-y-4 max-w-xs w-full"
        >
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-display font-bold text-white">Проверь почту</h2>
          <p className="text-text-muted text-sm">
            Мы отправили письмо на{' '}
            <span className="text-cyber-pink font-semibold break-all">{email}</span>
            <br /><br />Нажми на ссылку в письме, чтобы подтвердить аккаунт
          </p>

          <div className="glass rounded-2xl p-4 text-left space-y-1 border border-white/10">
            <p className="text-white text-xs font-medium">Если письмо не пришло:</p>
            <p className="text-text-muted text-xs">• Проверь папку «Спам» / «Нежелательные»</p>
            <p className="text-text-muted text-xs">• Подожди 1–2 минуты</p>
            <p className="text-text-muted text-xs">• Нажми «Отправить повторно» ниже</p>
          </div>

          {resendMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-xs text-center"
            >
              ✓ {resendMsg}
            </motion.p>
          )}

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className={`w-full py-3 rounded-xl text-sm font-semibold border transition-all ${
              resendCooldown > 0
                ? 'border-white/10 text-text-muted cursor-not-allowed'
                : 'border-cyber-pink/40 text-cyber-pink hover:bg-cyber-pink/10'
            }`}
          >
            {resendCooldown > 0 ? `Отправить повторно (${resendCooldown}с)` : 'Отправить письмо повторно'}
          </button>

          <button
            onClick={() => { setCheckEmail(false); setTab('login') }}
            className="text-cyber-pink text-sm font-semibold hover:underline block mx-auto pt-2"
          >
            Уже подтвердил — войти →
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-12 bg-obsidian overflow-y-auto">
      <div className="orb orb-pink" style={{ top: '-5%', right: '-20%', width: '280px', height: '280px' }} />
      <div className="orb orb-violet" style={{ bottom: '5%', left: '-20%', width: '260px', height: '260px' }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="text-center z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-4 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, #FF2D8A, #9B5DE5, #00D4FF, #FF2D8A)', padding: '2px' }}
        >
          <div className="w-full h-full rounded-full bg-obsidian flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
        </motion.div>
        <div className="text-2xl font-display font-bold neon-text tracking-wider">LASH ART VISION</div>
        <p className="text-text-muted text-sm mt-1">Твой AI-стилист и помощник</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full space-y-4 z-10"
      >
        {/* Tabs */}
        <div className="flex rounded-xl bg-white/5 p-1 gap-1">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-cyber-pink text-white'
                  : 'text-text-muted hover:text-white'
              }`}
              style={tab === t ? { boxShadow: '0 0 12px rgba(255,45,138,0.4)' } : {}}
            >
              {t === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>

        <GlassCard className="p-5 space-y-3">
          {/* Email */}
          <div>
            <label className="text-text-muted text-xs mb-1 block">Email</label>
            <input
              type="email"
              placeholder="example@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-cyber-pink/60 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-text-muted text-xs mb-1 block">Пароль</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && tab === 'login' && handleLogin()}
                className="w-full h-12 px-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-cyber-pink/60 transition-colors"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-lg"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirm password (register only) */}
          <AnimatePresence>
            {tab === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <label className="text-text-muted text-xs mb-1 block">Повтори пароль</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Повтори пароль"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-cyber-pink/60 transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              ⚠️ {error}
            </motion.p>
          )}
        </GlassCard>

        <NeonButton
          onClick={tab === 'login' ? handleLogin : handleRegister}
          disabled={!email || !password || (tab === 'register' && !confirm) || loading}
          fullWidth
          variant="gradient"
        >
          {loading
            ? 'Загружаем…'
            : tab === 'login'
            ? 'Войти →'
            : 'Создать аккаунт →'}
        </NeonButton>
      </motion.div>

      <p className="text-text-muted text-xs text-center z-10">
        Продолжая, вы соглашаетесь с условиями использования
      </p>
    </div>
  )
}
