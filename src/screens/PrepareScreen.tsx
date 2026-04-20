import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../components/ui/NeonButton'
import { useAppStore } from '../store/appStore'

const tips = [
  { icon: '👱‍♀️', text: 'Волосы убраны от лица' },
  { icon: '🚫', text: 'Без макияжа (особенно туши)' },
  { icon: '💡', text: 'Хорошее равномерное освещение' },
  { icon: '📐', text: 'Смотри прямо в камеру, анфас' },
  { icon: '📏', text: 'Лицо по центру кадра' },
]

const SEEN_KEY = 'prepare_seen'

export function PrepareScreen() {
  const setScreen = useAppStore((s) => s.setScreen)

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY)) {
      setScreen('camera')
    }
  }, [])

  const proceed = () => {
    localStorage.setItem(SEEN_KEY, '1')
    setScreen('camera')
  }

  return (
    <div className="h-full flex flex-col px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold gradient-text">Подготовка к фото</h1>
        <p className="text-text-muted text-sm mt-1">Для точного анализа AI</p>
      </motion.div>

      <div className="flex-1 flex flex-col gap-3">
        {tips.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-4 p-4 rounded-2xl glass"
          >
            <span className="text-2xl shrink-0">{item.icon}</span>
            <span className="text-text-primary text-sm">{item.text}</span>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 flex flex-col gap-3">
        <NeonButton onClick={proceed} variant="gradient" fullWidth>
          Понятно — снимаем 📸
        </NeonButton>
        <p className="text-center text-text-muted text-xs">Это окно больше не появится</p>
      </motion.div>
    </div>
  )
}
