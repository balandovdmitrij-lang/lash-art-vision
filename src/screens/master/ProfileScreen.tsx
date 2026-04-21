import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { NeonButton } from '../../components/ui/NeonButton'
import { useAuthStore } from '../../store/authStore'
import { auth } from '../../lib/firebase'
import { signOut } from 'firebase/auth'

export function MasterProfileScreen() {
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const [showQR, setShowQR] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
    logout()
  }

  // Simple QR placeholder — will be real QR in Sprint 3
  const qrUrl = `https://lashartvisio.app/join/${profile?.id ?? 'demo'}`

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 pt-12 pb-6">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-3xl"
            style={{ background: 'rgba(201,169,110,0.15)', border: '2px solid rgba(201,169,110,0.4)', boxShadow: '0 0 20px rgba(201,169,110,0.2)' }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : '💅'}
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">{profile?.name}</h1>
            <p className="text-text-muted text-sm">{profile?.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400 text-xs">Профиль активен</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Code block */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Мой QR-код</p>
        <GlassCard className="p-5">
          <p className="text-white text-sm mb-3">
            Клиенты сканируют QR и автоматически привязываются к тебе
          </p>

          {showQR ? (
            <div className="flex flex-col items-center gap-3">
              {/* QR visual placeholder */}
              <div
                className="w-40 h-40 rounded-xl flex items-center justify-center"
                style={{ background: 'white', padding: '12px' }}
              >
                <div className="w-full h-full bg-obsidian rounded flex items-center justify-center">
                  <div className="text-4xl">📱</div>
                </div>
              </div>
              <p className="text-text-muted text-xs text-center break-all">{qrUrl}</p>
              <NeonButton variant="secondary" onClick={() => setShowQR(false)}>
                Скрыть
              </NeonButton>
            </div>
          ) : (
            <NeonButton variant="gradient" fullWidth onClick={() => setShowQR(true)}>
              Показать QR-код 📱
            </NeonButton>
          )}
        </GlassCard>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Настройки</p>
        <GlassCard className="divide-y divide-white/5">
          {[
            { icon: '👤', label: 'Редактировать профиль', color: '#C9A96E' },
            { icon: '🔔', label: 'Уведомления', color: '#9B5DE5' },
            { icon: '🔒', label: 'Конфиденциальность', color: '#00D4FF' },
            { icon: '❓', label: 'Помощь', color: '#FF2D8A' },
          ].map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
              <span className="text-lg" style={{ filter: `drop-shadow(0 0 4px ${item.color})` }}>{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
              <span className="ml-auto text-text-muted">›</span>
            </button>
          ))}
        </GlassCard>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <NeonButton variant="ghost" fullWidth className="text-red-400 hover:text-red-300" onClick={handleLogout}>
          Выйти из аккаунта
        </NeonButton>
      </motion.div>
    </div>
  )
}
