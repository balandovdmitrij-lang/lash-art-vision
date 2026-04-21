import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <GlassCard className="p-4">
      <div className="text-2xl mb-1" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>{icon}</div>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-text-muted text-xs">{label}</div>
    </GlassCard>
  )
}

export function DashboardScreen() {
  const profile = useAuthStore((s) => s.profile)
  const firstName = profile?.name?.split(' ')[0] ?? 'Мастер'

  const today = new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 pt-12 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-text-muted text-sm capitalize">{today}</p>
            <h1 className="text-2xl font-display font-bold">
              <span className="text-white">{firstName}</span>{' '}
              <span className="rose-text">💅</span>
            </h1>
          </div>
          <div className="ml-auto">
            <div className="px-3 py-1 rounded-full border border-rose-gold/40 bg-rose-gold/10">
              <span className="text-rose-gold text-xs font-semibold">МАСТЕР</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Эта неделя</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon="👥" value="0" label="Клиентов" color="#C9A96E" />
          <StatCard icon="📅" value="0" label="Записей" color="#9B5DE5" />
          <StatCard icon="✨" value="0" label="AI-анализов" color="#FF2D8A" />
          <StatCard icon="💬" value="0" label="Сообщений" color="#00D4FF" />
        </div>
      </motion.div>

      {/* Today's schedule */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Сегодня</p>
        <GlassCard className="p-5 text-center mb-4">
          <div className="text-4xl mb-2">🌸</div>
          <p className="text-white font-semibold mb-1">Нет записей на сегодня</p>
          <p className="text-text-muted text-xs">Создай запись через Календарь или дай клиентам QR-код</p>
        </GlassCard>
      </motion.div>

      {/* Retention alert — UX initiative */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Напоминания</p>
        <GlassCard className="p-4 border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="text-yellow-400 text-sm font-semibold">Retention-механика</p>
              <p className="text-text-muted text-xs">Клиенты, которые давно не записывались, появятся здесь</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
