import { useState } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../../lib/supabase'

const roles: { id: UserRole; icon: string; title: string; desc: string; perks: string[] }[] = [
  {
    id: 'client',
    icon: '✨',
    title: 'Я клиент',
    desc: 'Хочу подобрать идеальный образ',
    perks: ['AI-анализ формы глаз', 'Схема наращивания', 'Запись к мастеру', 'Каталог эффектов'],
  },
  {
    id: 'master',
    icon: '💅',
    title: 'Я мастер',
    desc: 'Веду клиентов и строю бизнес',
    perks: ['CRM — база клиентов', 'Календарь записей', 'P2P-чат с клиентами', 'AI-аналитика'],
  },
]

export function RoleSelectScreen() {
  const [selected, setSelected] = useState<UserRole | null>(null)

  const handleContinue = () => {
    if (!selected) return
    useAuthStore.setState((s) => ({
      authScreen: 'profile_setup',
      profile: s.profile ? { ...s.profile, role: selected } : {
        id: s.userId ?? '',
        role: selected,
        phone: null,
        name: '',
        avatar_url: null,
        created_at: new Date().toISOString(),
      },
    }))
  }

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-12 bg-obsidian overflow-hidden">
      <div className="orb orb-pink" style={{ top: '-5%', right: '-20%', width: '300px', height: '300px' }} />
      <div className="orb orb-violet" style={{ bottom: '5%', left: '-20%', width: '280px', height: '280px' }} />

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-2xl font-display font-bold neon-text tracking-wider">LASH ART VISION</div>
        <p className="text-text-muted text-sm mt-1">Кто ты в нашей системе?</p>
      </motion.div>

      <div className="w-full space-y-4">
        {roles.map((role, idx) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.1 }}
            onClick={() => setSelected(role.id)}
            className={`w-full p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
              selected === role.id
                ? 'border-cyber-pink bg-cyber-pink/10 shadow-neon'
                : 'border-white/10 bg-white/3 hover:border-white/20'
            }`}
          >
            {selected === role.id && (
              <motion.div
                layoutId="role-highlight"
                className="absolute inset-0 bg-cyber-pink/5 rounded-2xl"
              />
            )}

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div
                  className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${
                    selected === role.id ? 'bg-cyber-pink/20' : 'bg-white/5'
                  }`}
                >
                  {role.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-display font-bold text-lg">{role.title}</h3>
                    {selected === role.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-cyber-pink flex items-center justify-center text-xs"
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                  <p className="text-text-muted text-sm mb-3">{role.desc}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {role.perks.map((p) => (
                      <div key={p} className="flex items-center gap-1">
                        <span className="text-cyber-pink text-xs">•</span>
                        <span className="text-xs text-text-muted">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <NeonButton
          onClick={handleContinue}
          disabled={!selected}
          fullWidth
          variant="gradient"
        >
          Продолжить →
        </NeonButton>
      </motion.div>
    </div>
  )
}
