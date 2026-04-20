import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { analyzeWithAI } from '../services/openrouter'
import { ProgressRing } from '../components/ui/ProgressRing'

const questions = [
  {
    key: 'style' as const,
    question: 'Какой стиль тебе ближе?',
    options: [
      { value: 'bright', label: '✨ Яркий', desc: 'Выразительный, заметный взгляд' },
      { value: 'natural', label: '🌿 Натуральный', desc: 'Естественное усиление красоты' },
    ],
  },
  {
    key: 'density' as const,
    question: 'Предпочтения по объёму?',
    options: [
      { value: 'dense', label: '🌟 Плотная линия', desc: 'Больше пучков, насыщенный эффект' },
      { value: 'sparse', label: '🪶 Разреженная', desc: 'Лёгкость, натуральность' },
    ],
  },
  {
    key: 'length' as const,
    question: 'Желаемая длина?',
    options: [
      { value: 'short', label: '💫 Короткие', desc: 'До 10 мм — аккуратно' },
      { value: 'medium', label: '⭐ Средние', desc: '10–12 мм — универсально' },
      { value: 'long', label: '🌙 Длинные', desc: '13+ мм — эффектно' },
    ],
  },
]

export function PreferencesScreen() {
  const [qIdx, setQIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { photoUrl, eyeParams, preferences, setPreference, setRecommendation, setScreen } =
    useAppStore((s) => ({
      photoUrl: s.photoUrl,
      eyeParams: s.eyeParams,
      preferences: s.preferences,
      setPreference: s.setPreference,
      setRecommendation: s.setRecommendation,
      setScreen: s.setScreen,
    }))

  const q = questions[qIdx]

  const select = async (key: typeof q.key, value: string) => {
    setPreference(key, value as never)
    const updatedPrefs = { ...preferences, [key]: value }

    if (qIdx < questions.length - 1) {
      setQIdx(qIdx + 1)
      return
    }

    // Last question answered — call AI now
    setLoading(true)
    setError('')
    try {
      if (!photoUrl || !eyeParams) throw new Error('Нет данных для анализа')

      const base64 = photoUrl.includes(',') ? photoUrl.split(',')[1] : photoUrl
      const raw = await analyzeWithAI(base64, eyeParams, updatedPrefs)

      // Extract first valid JSON object from response
      const jsonMatch = raw.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/)
      if (!jsonMatch) throw new Error('Некорректный ответ AI. Попробуй ещё раз.')

      const rec = JSON.parse(jsonMatch[0])
      setRecommendation(rec)
      setScreen('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка AI. Попробуй ещё раз.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 gap-6 bg-obsidian">
        <ProgressRing progress={0.7} size={80} label="AI" />
        <div className="text-center">
          <p className="text-cyber-pink font-medium">Подбираю идеальный эффект...</p>
          <p className="text-text-muted text-xs mt-1">Проверяю матрицу запретов</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col px-6 py-12 bg-obsidian">
      <div className="flex gap-2 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= qIdx ? 'bg-cyber-pink shadow-neon-sm' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <p className="text-text-muted text-xs mb-2">Вопрос {qIdx + 1} из {questions.length}</p>

      <motion.h2
        key={qIdx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-display font-bold text-white mb-8"
      >
        {q.question}
      </motion.h2>

      <motion.div
        key={`opts-${qIdx}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-3 flex-1"
      >
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => select(q.key, opt.value)}
            className="glass border border-white/10 rounded-2xl p-4 text-left hover:border-cyber-pink hover:shadow-neon-sm transition-all active:scale-95"
          >
            <div className="text-base font-semibold text-white">{opt.label}</div>
            <div className="text-text-muted text-xs mt-1">{opt.desc}</div>
          </button>
        ))}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 glass border border-red-500/30 rounded-2xl p-3 text-center"
        >
          <p className="text-red-300 text-xs">⚠️ {error}</p>
          <button onClick={() => setError('')} className="text-cyber-pink text-xs mt-2 underline">
            Попробовать ещё раз
          </button>
        </motion.div>
      )}
    </div>
  )
}
