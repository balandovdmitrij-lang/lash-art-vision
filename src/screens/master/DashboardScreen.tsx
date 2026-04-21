import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { supabase } from '../../lib/supabase'

interface Stats {
  clients: number
  appointments: number
  messages: number
}

interface TodayAppointment {
  id: string
  scheduled_at: string
  service: string
  status: string
  clientName: string
}

function StatCard({
  icon, value, label, color, onClick,
}: {
  icon: string; value: string | number; label: string; color: string; onClick?: () => void
}) {
  return (
    <button className="w-full text-left" onClick={onClick}>
      <GlassCard className="p-4 hover:bg-white/5 transition-colors">
        <div className="text-2xl mb-1" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>{icon}</div>
        <div className="text-2xl font-display font-bold text-white">{value}</div>
        <div className="text-text-muted text-xs">{label}</div>
      </GlassCard>
    </button>
  )
}

export function DashboardScreen() {
  const profile = useAuthStore((s) => s.profile)
  const setMasterTab = useAppStore((s) => s.setMasterTab)
  const firstName = profile?.name?.split(' ')[0] ?? 'Мастер'
  const [stats, setStats] = useState<Stats>({ clients: 0, appointments: 0, messages: 0 })
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [retentionClients, setRetentionClients] = useState<string[]>([])

  const today = new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })

  const fetchData = useCallback(async () => {
    if (!profile) return

    const todayStr = new Date().toISOString().split('T')[0]
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString()

    const [
      { count: clientCount },
      { count: apptCount },
      { count: msgCount },
      { data: todayAppts },
      { data: oldClients },
    ] = await Promise.all([
      supabase.from('master_clients').select('*', { count: 'exact', head: true }).eq('master_id', profile.id),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('master_id', profile.id),
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', profile.id).is('read_at', null),
      supabase.from('appointments')
        .select('id, scheduled_at, service, status, users!appointments_client_id_fkey(name)')
        .eq('master_id', profile.id)
        .gte('scheduled_at', `${todayStr}T00:00:00`)
        .lt('scheduled_at', `${tomorrowStr}T00:00:00`)
        .order('scheduled_at'),
      supabase.from('master_clients')
        .select('users!master_clients_client_id_fkey(name)')
        .eq('master_id', profile.id)
        .lt('linked_at', sixtyDaysAgo),
    ])

    setStats({
      clients: clientCount ?? 0,
      appointments: apptCount ?? 0,
      messages: msgCount ?? 0,
    })

    if (todayAppts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTodayAppointments((todayAppts as any[]).map((a) => ({
        id: a.id,
        scheduled_at: a.scheduled_at,
        service: a.service,
        status: a.status,
        clientName: Array.isArray(a.users) ? a.users[0]?.name : a.users?.name ?? 'Клиент',
      })))
    }

    if (oldClients) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRetentionClients((oldClients as any[]).map((c) =>
        Array.isArray(c.users) ? c.users[0]?.name : c.users?.name ?? 'Клиент'
      ).filter(Boolean))
    }
  }, [profile])

  useEffect(() => { fetchData() }, [fetchData])

  const statusColor: Record<string, string> = {
    pending: '#FF9500',
    confirmed: '#4CAF50',
    done: '#888',
    cancelled: '#FF4444',
  }

  const statusLabel: Record<string, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждено',
    done: 'Выполнено',
    cancelled: 'Отменено',
  }

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
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Статистика</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon="👥" value={stats.clients} label="Клиентов" color="#C9A96E" onClick={() => setMasterTab('clients')} />
          <StatCard icon="📅" value={stats.appointments} label="Всего записей" color="#9B5DE5" onClick={() => setMasterTab('calendar')} />
          <StatCard icon="✨" value="AI" label="Анализы" color="#FF2D8A" />
          <StatCard icon="💬" value={stats.messages} label="Новых сообщений" color="#00D4FF" onClick={() => setMasterTab('chat')} />
        </div>
      </motion.div>

      {/* Today's schedule */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-text-muted text-xs uppercase tracking-widest">Сегодня</p>
          <button
            onClick={() => setMasterTab('calendar')}
            className="text-rose-gold text-xs hover:underline"
          >
            Открыть календарь →
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <GlassCard className="p-5 text-center mb-4">
            <div className="text-4xl mb-2">🌸</div>
            <p className="text-white font-semibold mb-1">Нет записей на сегодня</p>
            <p className="text-text-muted text-xs">Добавь запись через Календарь</p>
          </GlassCard>
        ) : (
          <div className="space-y-2 mb-4">
            {todayAppointments.map((appt) => (
              <GlassCard key={appt.id} className="p-3 flex items-center gap-3">
                <div className="text-center shrink-0 w-12">
                  <p className="text-white text-sm font-bold">
                    {new Date(appt.scheduled_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{appt.clientName}</p>
                  <p className="text-text-muted text-xs">{appt.service}</p>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full border shrink-0"
                  style={{ color: statusColor[appt.status], borderColor: statusColor[appt.status] + '40', background: statusColor[appt.status] + '10' }}
                >
                  {statusLabel[appt.status]}
                </span>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>

      {/* Retention alert */}
      {retentionClients.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Напомни о себе</p>
          <GlassCard className="p-4 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-yellow-400 text-sm font-semibold mb-1">
                  {retentionClients.length} клиент{retentionClients.length > 1 ? 'а' : ''} давно не было
                </p>
                <p className="text-text-muted text-xs">
                  {retentionClients.slice(0, 3).join(', ')}{retentionClients.length > 3 ? ` и ещё ${retentionClients.length - 3}` : ''}
                </p>
                <button
                  onClick={() => setMasterTab('clients')}
                  className="text-yellow-400 text-xs mt-1 hover:underline"
                >
                  Открыть список клиентов →
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {retentionClients.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Напоминания</p>
          <GlassCard className="p-4 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-yellow-400 text-sm font-semibold">Всё хорошо!</p>
                <p className="text-text-muted text-xs">Клиенты, которые давно не записывались, появятся здесь</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}
