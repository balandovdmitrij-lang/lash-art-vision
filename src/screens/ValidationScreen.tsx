import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { initFaceLandmarker, validatePhoto } from '../services/faceAnalysis'
import { NeonButton } from '../components/ui/NeonButton'

const STEPS = [
  'Загрузка AI-модели...',
  'Поиск лица...',
  'Проверка ракурса...',
  'Оценка освещения...',
  'Проверка резкости...',
]

export function ValidationScreen() {
  const { photoUrl, setScreen } = useAppStore((s) => ({
    photoUrl: s.photoUrl,
    setScreen: s.setScreen,
  }))

  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    if (!photoUrl || ran.current) return
    ran.current = true
    run()
  }, [photoUrl])

  async function run() {
    try {
      setStep(0)
      const landmarker = await initFaceLandmarker()

      setStep(1)
      const img = new Image()
      img.src = photoUrl!

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Не удалось прочитать фото'))
        setTimeout(() => reject(new Error('Тайм-аут загрузки фото')), 15000)
      })

      setStep(2)
      const result = landmarker.detect(img)
      const landmarks = result.faceLandmarks?.[0] ?? []

      setStep(3)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      setStep(4)
      await new Promise((r) => setTimeout(r, 200))

      const validation = validatePhoto(imageData, landmarks)
      setDone(true)

      if (!validation.ok) {
        setErrors(validation.errors)
        return
      }

      await new Promise((r) => setTimeout(r, 400))
      setScreen('analysis')
    } catch (e) {
      setErrors([e instanceof Error ? e.message : 'Ошибка обработки фото. Попробуй ещё раз.'])
      setDone(true)
    }
  }

  const progress = done ? 1 : step / STEPS.length

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 gap-8 bg-obsidian">
      <h1 className="text-xl font-display font-bold text-white">Проверка фото</h1>

      {photoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-44 h-44 rounded-2xl overflow-hidden border border-white/10"
        >
          <img src={photoUrl} alt="preview" className="w-full h-full object-cover" />
          {!done && (
            <div className="absolute inset-0 bg-obsidian/60 flex items-center justify-center">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="-rotate-90 w-16 h-16">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#1E1E35" strokeWidth="5" />
                  <circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke="#E91E8C" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress)}`}
                    style={{ transition: 'stroke-dashoffset 0.3s' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-cyber-pink">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="w-full max-w-xs flex flex-col gap-2">
        {STEPS.map((s, i) => {
          const passed = done || i < step
          const active = !done && i === step
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= step || done ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 text-sm"
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                  passed && errors.length === 0
                    ? 'bg-cyber-pink text-white'
                    : passed && errors.length > 0
                    ? 'bg-red-500 text-white'
                    : active
                    ? 'border-2 border-cyber-pink animate-pulse'
                    : 'border border-text-muted'
                }`}
              >
                {passed ? (errors.length > 0 ? '✗' : '✓') : ''}
              </div>
              <span className={i <= step || done ? 'text-text-primary' : 'text-text-muted'}>
                {s}
              </span>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {done && errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-3"
          >
            <div className="glass border border-red-500/30 rounded-2xl p-4 flex flex-col gap-2">
              {errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-300">
                  <span className="mt-0.5 shrink-0">⚠️</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
            <NeonButton onClick={() => setScreen('camera')} fullWidth>
              Переснять фото
            </NeonButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
