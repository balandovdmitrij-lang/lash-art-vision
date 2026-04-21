import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { NeonButton } from '../../components/ui/NeonButton'

const STATUS_COLORS = {
  pending:   { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Ожидает' },
  confirmed: { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  label: 'Подтверждено' },
  done:      { bg: 'bg-white/5',       border: 'border-white/10',      text: 'text-text-muted',  label: 'Завершено' },
  cancelled: { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400',    label: 'Отменено' },
}

export function AppointmentScreen() {
  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold gradient-text">Мои записи</h1>
        <p className="text-text-muted text-sm mt-1">Предстоящие и история</p>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-white font-bold mb-2">Нет предстоящих записей</h3>
            <p className="text-text-muted text-sm mb-6">
              Найди мастера и запишись на процедуру прямо из приложения
            </p>
            <NeonButton variant="gradient" fullWidth>
              Найти мастера ✨
            </NeonButton>
          </GlassCard>
        </motion.div>

        {/* Demo upcoming appointment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Пример записи</p>
          <AppointmentCard
            masterName="Анастасия L."
            service="Наращивание ресниц · Кошачий"
            date="Завтра, 15:00"
            status="confirmed"
          />
        </motion.div>
      </div>
    </div>
  )
}

function AppointmentCard({
  masterName,
  service,
  date,
  status,
}: {
  masterName: string
  service: string
  date: string
  status: keyof typeof STATUS_COLORS
}) {
  const s = STATUS_COLORS[status]
  return (
    <GlassCard className={`p-4 border ${s.border}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">💅</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold text-sm">{masterName}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.text} border ${s.border}`}>
              {s.label}
            </span>
          </div>
          <p className="text-text-muted text-xs mb-1">{service}</p>
          <p className="text-electric-cyan text-xs">{date}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <NeonButton variant="secondary" className="flex-1 text-xs py-2">
          Написать
        </NeonButton>
        <NeonButton variant="ghost" className="flex-1 text-xs py-2 text-red-400 hover:text-red-300">
          Отменить
        </NeonButton>
      </div>
    </GlassCard>
  )
}
