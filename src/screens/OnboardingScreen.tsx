import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NeonButton } from '../components/ui/NeonButton'
import { useAppStore } from '../store/appStore'

const slides = [
  {
    emoji: '📸',
    title: 'Сфотографируйся',
    desc: 'Сделай селфи при хорошем освещении без макияжа. AI увидит всё, что нужно.',
  },
  {
    emoji: '✨',
    title: 'AI анализирует твои глаза',
    desc: '478 точек FaceMesh считывают форму, ось, посадку и навис твоих глаз за секунды.',
  },
  {
    emoji: '💅',
    title: 'Получи схему',
    desc: 'Персональный рецепт наращивания с параметрами по зонам — готов за 30 секунд.',
  },
]

export function OnboardingScreen() {
  const [slide, setSlide] = useState(0)
  const setScreen = useAppStore((s) => s.setScreen)

  const next = () => {
    if (slide < slides.length - 1) setSlide(slide + 1)
    else setScreen('prepare')
  }

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-12 bg-obsidian">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="text-2xl font-display font-bold neon-text tracking-wider">
          LASH ART VISION
        </div>
        <div className="text-xs text-text-muted mt-1 tracking-widest">by @lash.bomba</div>
      </motion.div>

      {/* Slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.35 }}
          className="text-center px-4"
        >
          <div className="text-7xl mb-6">{slides[slide].emoji}</div>
          <h2 className="text-2xl font-display font-bold text-white mb-3">
            {slides[slide].title}
          </h2>
          <p className="text-text-muted text-base leading-relaxed">{slides[slide].desc}</p>
        </motion.div>
      </AnimatePresence>

      {/* Dots + Button */}
      <div className="w-full flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === slide ? 24 : 8, opacity: i === slide ? 1 : 0.3 }}
              className="h-2 rounded-full bg-cyber-pink"
            />
          ))}
        </div>
        <NeonButton onClick={next} fullWidth>
          {slide < slides.length - 1 ? 'Далее' : 'Начать ✨'}
        </NeonButton>
      </div>
    </div>
  )
}
