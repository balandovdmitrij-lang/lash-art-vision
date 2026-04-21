import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { signIn, signUp } from '../../lib/auth'
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
          className="text-center z-10 space-y-4"
        >
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-display font-bold text-white">Проверь почту</h2>
          <p className="text-text-muted text-sm max-w-xs">
            Мы отправили письмо на{' '}
            <span className="text-cyber-pink font-semibold">{email}</span>
            <br />Нажми на ссылку в письме — и ты окажешься в приложении
          </p>
          <div className="pt-4">
            <p className="text-text-muted text-xs">Не пришло? Проверь папку «Спам»</p>
            <button
              onClick={() => { setCheckEmail(false); setTab('login') }}
              className="text-cyber-pink text-sm font-semibold mt-3 hover:underline block mx-auto"
            >
              Уже подтвердил — войти →
            </button>
          </div>
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
