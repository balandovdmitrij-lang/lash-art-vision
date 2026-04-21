import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { NeonButton } from '../../components/ui/NeonButton'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7 // Mon = 0
}

const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
const DAYS_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

export function CalendarScreen() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-display font-bold rose-text">Календарь</h1>
      </div>

      {/* Month nav */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <motion.button onClick={prevMonth} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white">
          ‹
        </motion.button>
        <p className="text-white font-semibold">
          {MONTHS[month]} {year}
        </p>
        <motion.button onClick={nextMonth} whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-text-muted hover:text-white">
          ›
        </motion.button>
      </div>

      {/* Calendar grid */}
      <div className="px-4 mb-4">
        <GlassCard className="p-3">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] text-text-muted font-medium py-1">{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isSelected = day === selectedDay
              return (
                <motion.button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  whileTap={{ scale: 0.85 }}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-rose-gold text-obsidian font-bold'
                      : isToday
                      ? 'border border-rose-gold/50 text-rose-gold'
                      : 'text-text-primary hover:bg-white/5'
                  }`}
                  style={isSelected ? { boxShadow: '0 0 12px rgba(201,169,110,0.4)' } : {}}
                >
                  {day}
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
          <NeonButton variant="secondary" className="text-xs px-3 py-1.5">
            + Запись
          </NeonButton>
        </div>

        <GlassCard className="p-6 text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="text-white text-sm font-semibold">Нет записей</p>
          <p className="text-text-muted text-xs mt-1">Свободный день</p>
        </GlassCard>
      </div>
    </div>
  )
}
