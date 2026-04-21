import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { NeonButton } from '../../components/ui/NeonButton'
import { useAuthStore } from '../../store/authStore'

const stagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
}

export function ClientHomeScreen() {
  const profile = useAuthStore((s) => s.profile)
  const firstName = profile?.name?.split(' ')[0] ?? 'красотка'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 pt-12 pb-4">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-text-muted text-sm">{greeting},</p>
        <h1 className="text-2xl font-display font-bold text-white">
          {firstName} <span className="neon-text">✨</span>
        </h1>
      </motion.div>

      {/* Hero CTA */}
      <motion.div custom={0} variants={stagger} initial="hidden" animate="visible">
        <GlassCard className="p-5 mb-4 shimmer-border">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl bg-cyber-pink/20 flex items-center justify-center text-3xl"
              style={{ boxShadow: '0 0 20px rgba(255,45,138,0.3)' }}
            >
              📸
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">Подбор образа AI</h3>
              <p className="text-text-muted text-xs">478 точек FaceMesh · 30 секунд</p>
            </div>
          </div>
          <NeonButton variant="gradient" fullWidth className="mt-4">
            Начать AI-анализ ✨
          </NeonButton>
        </GlassCard>
      </motion.div>

      {/* Quick actions */}
      <motion.div custom={1} variants={stagger} initial="hidden" animate="visible">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2 px-1">Быстрый доступ</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: '📖', label: 'Каталог', color: '#9B5DE5' },
            { icon: '📅', label: 'Записи', color: '#00D4FF' },
            { icon: '💬', label: 'Чат', color: '#FF2D8A' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              custom={i + 2}
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <GlassCard className="p-3 text-center">
                <div
                  className="text-2xl mb-1"
                  style={{ filter: `drop-shadow(0 0 6px ${item.color})` }}
                >
                  {item.icon}
                </div>
                <p className="text-xs text-text-muted">{item.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Next appointment */}
      <motion.div custom={5} variants={stagger} initial="hidden" animate="visible">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2 px-1">Ближайшая запись</p>
        <GlassCard className="p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-cyan/10 flex items-center justify-center text-xl">📅</div>
            <div>
              <p className="text-white text-sm font-semibold">Нет предстоящих записей</p>
              <p className="text-text-muted text-xs">Запишись к мастеру через приложение</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Last analysis */}
      <motion.div custom={6} variants={stagger} initial="hidden" animate="visible">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2 px-1">Последний анализ</p>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-pink/10 flex items-center justify-center text-xl">✨</div>
            <div>
              <p className="text-white text-sm font-semibold">Ещё нет анализов</p>
              <p className="text-text-muted text-xs">Сделай свой первый AI-подбор образа</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
