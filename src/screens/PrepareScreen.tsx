import { useState } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../components/ui/NeonButton'
import { useAppStore } from '../store/appStore'

const checklist = [
  { icon: '👱‍♀️', text: 'Волосы убраны от лица' },
  { icon: '🚫', text: 'Без макияжа (особенно туши)' },
  { icon: '💡', text: 'Хорошее равномерное освещение' },
  { icon: '📐', text: 'Анфас — смотри прямо в камеру' },
  { icon: '📏', text: 'Лицо занимает центр кадра' },
]

export function PrepareScreen() {
  const [checked, setChecked] = useState<boolean[]>(Array(checklist.length).fill(false))
  const setScreen = useAppStore((s) => s.setScreen)

  const toggle = (i: number) => {
    const next = [...checked]
    next[i] = !next[i]
    setChecked(next)
  }

  const allChecked = checked.every(Boolean)

  return (
    <div className="h-full flex flex-col px-6 py-10 bg-obsidian">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-white">Подготовка к фото</h1>
        <p className="text-text-muted text-sm mt-1">Отметь все пункты — это влияет на точность AI</p>
      </motion.div>

      <div className="flex-1 flex flex-col gap-3">
        {checklist.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => toggle(i)}
            className={`flex items-center gap-4 p-4 rounded-2xl glass border transition-all ${
              checked[i] ? 'border-cyber-pink shadow-neon-sm' : 'border-transparent'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                checked[i] ? 'bg-cyber-pink border-cyber-pink' : 'border-text-muted'
              }`}
            >
              {checked[i] && <span className="text-white text-xs">✓</span>}
            </div>
            <span className="text-lg">{item.icon}</span>
            <span className="text-text-primary text-sm text-left">{item.text}</span>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: allChecked ? 1 : 0.4 }}
        className="mt-6"
      >
        <NeonButton onClick={() => allChecked && setScreen('camera')} disabled={!allChecked} fullWidth>
          Готово — сделать фото 📸
        </NeonButton>
      </motion.div>
    </div>
  )
}
