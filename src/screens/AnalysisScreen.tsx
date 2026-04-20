import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { initFaceLandmarker, computeEyeParams } from '../services/faceAnalysis'

const STATUS_MESSAGES = [
  'Определяю форму глаз...',
  'Анализирую ось взгляда...',
  'Считаю пропорции...',
  'Проверяю навис века...',
  'Анализирую посадку...',
]

export function AnalysisScreen() {
  const { photoUrl, setScreen, setEyeParams } = useAppStore((s) => ({
    photoUrl: s.photoUrl,
    setScreen: s.setScreen,
    setEyeParams: s.setEyeParams,
  }))

  const [msgIdx, setMsgIdx] = useState(0)
  const [error, setError] = useState('')

  // Pre-generate random dots to avoid re-render flicker
  const dots = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: 15 + (i * 17 + 11) % 70,
        top: 10 + (i * 13 + 7) % 80,
        delay: i * 0.05,
      })),
    []
  )

  useEffect(() => {
    const interval = setInterval(
      () => setMsgIdx((i) => (i + 1) % STATUS_MESSAGES.length),
      1200
    )
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (photoUrl) runAnalysis()
  }, [photoUrl])

  async function runAnalysis() {
    try {
      const landmarker = await initFaceLandmarker()

      const img = new Image()
      img.src = photoUrl!

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Не удалось загрузить фото'))
        setTimeout(() => reject(new Error('Тайм-аут загрузки фото')), 10000)
      })

      const result = landmarker.detect(img)
      const landmarks = result.faceLandmarks?.[0]

      if (!landmarks || landmarks.length === 0) {
        throw new Error('Лицо не распознано. Попробуй другое фото.')
      }

      const params = computeEyeParams(landmarks)
      setEyeParams(params)

      // Brief pause for UX — let animation finish
      await new Promise((r) => setTimeout(r, 1500))
      setScreen('preferences')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка анализа')
    }
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 gap-8 bg-obsidian">
      {photoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-64 h-72 rounded-3xl overflow-hidden"
        >
          <img src={photoUrl} alt="face" className="w-full h-full object-cover brightness-75" />

          {/* Laser scanner */}
          <motion.div
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-1 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, #E91E8C, transparent)',
              boxShadow: '0 0 20px 4px rgba(233, 30, 140, 0.6)',
            }}
          />

          {/* FaceMesh dots */}
          <div className="absolute inset-0 pointer-events-none">
            {dots.map((d) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: d.delay, duration: 1.5, repeat: Infinity }}
                className="absolute w-1 h-1 rounded-full bg-cyber-pink"
                style={{ left: `${d.left}%`, top: `${d.top}%` }}
              />
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        key={msgIdx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-cyber-pink font-medium text-base">{STATUS_MESSAGES[msgIdx]}</p>
        <p className="text-text-muted text-xs mt-1">AI анализирует 478 точек лица</p>
      </motion.div>

      {!error && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-transparent border-t-cyber-pink border-r-rose-gold"
        />
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass border border-red-500/30 rounded-2xl p-4 text-center w-full"
        >
          <p className="text-red-300 text-sm mb-3">⚠️ {error}</p>
          <button
            onClick={() => setScreen('camera')}
            className="text-cyber-pink text-sm underline"
          >
            Попробовать снова
          </button>
        </motion.div>
      )}
    </div>
  )
}
