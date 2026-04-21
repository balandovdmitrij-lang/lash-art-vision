import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { NeonButton } from '../../components/ui/NeonButton'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7
}

const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
const MONTHS_FULL = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

const STATUS_COLOR: Record<string, string> = {
  pending: '#FF9500',
  confirmed: '#4CAF50',
  done: '#888',
  cancelled: '#FF4444',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  done: 'Выполнено',
  cancelled: 'Отменено',
}

interface Appointment {
  id: string
  scheduled_at: string
  service: string
  status: string
  notes: string | null
  clientName: string
  client_id: string
}

interface NewAppt {
  clientName: string
  service: string
  time: string
  notes: string
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function scheduleReminder(appt: Appointment) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const apptTime = new Date(appt.scheduled_at).getTime()
  const reminderTime = apptTime - 60 * 60 * 1000 // 1 час до
  const now = Date.now()
  if (reminderTime > now) {
    setTimeout(() => {
      new Notification('Напоминание о записи', {
        body: `Через час — ${appt.service} (${appt.clientName})`,
        icon: '/favicon.svg',
      })
    }, reminderTime - now)
  }
}

export function CalendarScreen() {
  const profile = useAuthStore((s) => s.profile)
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAppt, setNewAppt] = useState<NewAppt>({ clientName: '', service: '', time: '10:00', notes: '' })
  const [saving, setSaving] = useState(false)
  const [daysWithAppts, setDaysWithAppts] = useState<Set<number>>(new Set())

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const fetchAppointments = useCallback(async () => {
    if (!profile) return
    const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00`
    const endOfMonth = `${year}-${String(month + 2).padStart(2, '0')}-01T00:00:00`

    const { data } = await supabase
      .from('appointments')
      .select('id, scheduled_at, service, status, notes, client_id, users!appointments_client_id_fkey(name)')
      .eq('master_id', profile.id)
      .gte('scheduled_at', startOfMonth)
      .lt('scheduled_at', endOfMonth)
      .order('scheduled_at')

    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (data as any[]).map((a) => ({
        ...a,
        clientName: Array.isArray(a.users) ? a.users[0]?.name : a.users?.name ?? 'Клиент',
      })) as Appointment[]
      setAppointments(rows)
      const days = new Set(rows.map((a) => new Date(a.scheduled_at).getDate()))
      setDaysWithAppts(days)
      rows.forEach(scheduleReminder)
    }
  }, [profile, year, month])

  useEffect(() => {
    fetchAppointments()
    requestNotificationPermission()
  }, [fetchAppointments])

  const selectedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
  const dayAppointments = appointments.filter((a) => a.scheduled_at.startsWith(selectedDateStr))

  const handleAddAppointment = async () => {
    if (!profile || !newAppt.clientName || !newAppt.service) return
    setSaving(true)
    const scheduledAt = `${selectedDateStr}T${newAppt.time}:00`

    // Try to find client by name in master_clients
    const { data: clientData } = await supabase
      .from('master_clients')
      .select('client_id, users!master_clients_client_id_fkey(name)')
      .eq('master_id', profile.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = (clientData as any[])?.find((c) => {
      const name = Array.isArray(c.users) ? c.users[0]?.name : c.users?.name
      return name?.toLowerCase().includes(newAppt.clientName.toLowerCase())
    })

    const clientId = found?.client_id ?? profile.id // fallback to master id if client not found

    const { error } = await supabase.from('appointments').insert({
      master_id: profile.id,
      client_id: clientId,
      scheduled_at: scheduledAt,
      service: newAppt.service,
      status: 'confirmed',
      notes: newAppt.notes || null,
    })

    if (!error) {
      setShowAddModal(false)
      setNewAppt({ clientName: '', service: '', time: '10:00', notes: '' })
      fetchAppointments()
    }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    fetchAppointments()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-display font-bold rose-text">Календарь</h1>
      </div>

      {/* Month nav */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <motion.button onClick={prevMonth} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white text-xl">
          ‹
        </motion.button>
        <p className="text-white font-semibold">{MONTHS_FULL[month]} {year}</p>
        <motion.button onClick={nextMonth} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white text-xl">
          ›
        </motion.button>
      </div>

      {/* Calendar grid */}
      <div className="px-4 mb-4">
        <GlassCard className="p-3">
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] text-text-muted font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = day === selectedDay
              const hasAppts = daysWithAppts.has(day)
              return (
                <motion.button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  whileTap={{ scale: 0.85 }}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all relative ${
                    isSelected
                      ? 'bg-rose-gold text-obsidian font-bold'
                      : isToday
                      ? 'border border-rose-gold/50 text-rose-gold'
                      : 'text-text-primary hover:bg-white/5'
                  }`}
                  style={isSelected ? { boxShadow: '0 0 12px rgba(201,169,110,0.4)' } : {}}
                >
                  {day}
                  {hasAppts && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose-gold" />
                  )}
                </motion.button>
              )
            })}
          </div>
        </GlassCard>
      </div>

      {/* Day schedule */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-text-muted text-xs uppercase tracking-widest">
            {selectedDay} {MONTHS[month]}
          </p>
          <NeonButton variant="secondary" className="text-xs px-3 py-1.5" onClick={() => setShowAddModal(true)}>
            + Запись
          </NeonButton>
        </div>

        {dayAppointments.length === 0 ? (
          <GlassCard className="p-6 text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-white text-sm font-semibold">Нет записей</p>
            <p className="text-text-muted text-xs mt-1">Свободный день — нажми «+ Запись» чтобы добавить</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {dayAppointments.map((appt) => (
              <GlassCard key={appt.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="text-center shrink-0">
                    <p className="text-white text-sm font-bold">
                      {new Date(appt.scheduled_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{appt.clientName}</p>
                    <p className="text-text-muted text-xs">{appt.service}</p>
                    {appt.notes && <p className="text-text-muted text-xs italic mt-0.5">{appt.notes}</p>}
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border shrink-0"
                    style={{ color: STATUS_COLOR[appt.status], borderColor: STATUS_COLOR[appt.status] + '40', background: STATUS_COLOR[appt.status] + '10' }}
                  >
                    {STATUS_LABEL[appt.status]}
                  </span>
                </div>
                {appt.status !== 'done' && appt.status !== 'cancelled' && (
                  <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                    {appt.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(appt.id, 'confirmed')}
                        className="text-xs text-green-400 hover:text-green-300"
                      >
                        ✓ Подтвердить
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(appt.id, 'done')}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      ✓ Выполнено
                    </button>
                    <button
                      onClick={() => updateStatus(appt.id, 'cancelled')}
                      className="text-xs text-red-400 hover:text-red-300 ml-auto"
                    >
                      Отменить
                    </button>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Add appointment modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 z-50 flex items-end"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full rounded-t-3xl p-5 space-y-4"
              style={{ background: '#13132A', border: '1px solid rgba(201,169,110,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-2" />
              <h3 className="text-white font-display font-bold text-lg">
                Новая запись — {selectedDay} {MONTHS[month]}
              </h3>

              <div>
                <label className="text-text-muted text-xs mb-1 block">Имя клиента</label>
                <input
                  type="text"
                  placeholder="Анастасия"
                  value={newAppt.clientName}
                  onChange={(e) => setNewAppt((p) => ({ ...p, clientName: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-rose-gold/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1 block">Услуга</label>
                <input
                  type="text"
                  placeholder="Наращивание ресниц / Коррекция"
                  value={newAppt.service}
                  onChange={(e) => setNewAppt((p) => ({ ...p, service: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-rose-gold/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1 block">Время</label>
                <input
                  type="time"
                  value={newAppt.time}
                  onChange={(e) => setNewAppt((p) => ({ ...p, time: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose-gold/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-text-muted text-xs mb-1 block">Заметки (необязательно)</label>
                <textarea
                  placeholder="Особые пожелания, аллергии…"
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-rose-gold/50 transition-colors resize-none text-sm"
                />
              </div>

              <NeonButton
                onClick={handleAddAppointment}
                disabled={!newAppt.clientName || !newAppt.service || saving}
                fullWidth
                variant="gradient"
              >
                {saving ? 'Сохраняем…' : 'Добавить запись'}
              </NeonButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
