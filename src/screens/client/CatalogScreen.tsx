import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'

interface Effect {
  id: string
  name: string
  emoji: string
  desc: string
  suitableFor: string[]
  notFor: string[]
  params: { zone: string; note: string }[]
}

const EFFECTS: Effect[] = [
  {
    id: 'fox',
    name: 'Лисий',
    emoji: '🦊',
    desc: 'Акцент на внешнем уголке. Создаёт приподнятый, игривый взгляд.',
    suitableFor: ['Миндалевидные глаза', 'Опущенный внешний угол', 'Широко посаженные'],
    notFor: ['Широко посаженные + нависание (запрет)', 'Круглые глаза'],
    params: [
      { zone: '1–2', note: '8–10мм, C-завиток' },
      { zone: '3', note: '12мм, CC-завиток' },
      { zone: '4–5', note: '14–16мм, D-завиток' },
    ],
  },
  {
    id: 'cat',
    name: 'Кошачий',
    emoji: '🐱',
    desc: 'Классика. Плавное удлинение к внешнему углу — всегда уместно.',
    suitableFor: ['Большинство форм глаз', 'Миндалевидные', 'Узкие'],
    notFor: ['Глубоко посаженные (осторожно)'],
    params: [
      { zone: '1', note: '9мм, B-завиток' },
      { zone: '2–3', note: '11–12мм, C-завиток' },
      { zone: '4–5', note: '13–15мм, C/CC' },
    ],
  },
  {
    id: 'doll',
    name: 'Кукольный',
    emoji: '🪆',
    desc: 'Акцент в центре. Открывает и округляет взгляд.',
    suitableFor: ['Узкие глаза', 'Миндалевидные', 'Опущенный угол'],
    notFor: ['Круглые глаза', 'Выпуклые'],
    params: [
      { zone: '1', note: '9мм, C-завиток' },
      { zone: '2–3', note: '14–16мм, D-завиток' },
      { zone: '4–5', note: '10–11мм, C-завиток' },
    ],
  },
  {
    id: 'squirrel',
    name: 'Белка',
    emoji: '🐿️',
    desc: 'Акцент на 3/4 длины. Поднимает и придаёт живость.',
    suitableFor: ['Прямой разрез', 'Широко посаженные', 'Нависающее веко'],
    notFor: ['Очень маленькие глаза'],
    params: [
      { zone: '1–2', note: '8–9мм, B-завиток' },
      { zone: '3–4', note: '13–15мм, CC-завиток' },
      { zone: '5', note: '11мм, C-завиток' },
    ],
  },
  {
    id: 'natural',
    name: 'Натуральный',
    emoji: '🍃',
    desc: 'Повторяет натуральный рост. Лёгкий эффект «свои, но лучше».',
    suitableFor: ['Любая форма глаз', 'Деловой стиль', 'Новички'],
    notFor: [],
    params: [
      { zone: '1', note: '8мм, J-завиток' },
      { zone: '2–3', note: '10–11мм, B-завиток' },
      { zone: '4–5', note: '9–10мм, B-завиток' },
    ],
  },
  {
    id: 'wispy',
    name: 'Объёмный (Wispy)',
    emoji: '✨',
    desc: 'Пучки разной длины. Создаёт объём и «мокрый» эффект.',
    suitableFor: ['Любая форма', 'Вечерний образ', 'Густые ресницы'],
    notFor: ['Очень тонкие родные ресницы'],
    params: [
      { zone: 'все', note: 'Чередование 8–14мм, D-завиток' },
    ],
  },
]

export function CatalogScreen() {
  const [selected, setSelected] = useState<Effect | null>(null)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold gradient-text">Каталог эффектов</h1>
        <p className="text-text-muted text-sm mt-1">6 техник · схемы · подходит/нет</p>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {EFFECTS.map((effect, i) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                className="glass rounded-2xl p-4 cursor-pointer hover:border-cyber-pink/40 border border-transparent transition-all"
                onClick={() => setSelected(effect)}
              >
                <div className="text-3xl mb-2">{effect.emoji}</div>
                <h3 className="text-white font-bold text-sm mb-1">{effect.name}</h3>
                <p className="text-text-muted text-xs line-clamp-2">{effect.desc}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-[10px] text-green-400">✓ {effect.suitableFor.length} типа</span>
                  {effect.notFor.length > 0 && (
                    <span className="text-[10px] text-red-400 ml-auto">✗ {effect.notFor.length}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Effect Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 z-50 flex items-end"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-h-[85%] overflow-y-auto scrollbar-hide rounded-t-3xl"
              style={{ background: '#13132A', border: '1px solid rgba(255,45,138,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4" />

              <div className="px-5 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">{selected.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">{selected.name}</h2>
                    <p className="text-text-muted text-sm">эффект наращивания</p>
                  </div>
                </div>

                <p className="text-text-primary text-sm leading-relaxed mb-5">{selected.desc}</p>

                {/* Zone params */}
                <div className="mb-5">
                  <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Параметры по зонам</p>
                  <div className="space-y-2">
                    {selected.params.map((p) => (
                      <div key={p.zone} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyber-pink/15 flex items-center justify-center text-cyber-pink text-xs font-bold">
                          {p.zone}
                        </div>
                        <span className="text-white text-sm">{p.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suitable / Not for */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <p className="text-green-400 text-xs font-semibold mb-2">✓ Подходит</p>
                    {selected.suitableFor.map((s) => (
                      <p key={s} className="text-xs text-text-muted mb-1">• {s}</p>
                    ))}
                  </div>
                  {selected.notFor.length > 0 && (
                    <div>
                      <p className="text-red-400 text-xs font-semibold mb-2">✗ Не рекомендуется</p>
                      {selected.notFor.map((s) => (
                        <p key={s} className="text-xs text-text-muted mb-1">• {s}</p>
                      ))}
                    </div>
                  )}
                </div>

                <NeonButton variant="gradient" fullWidth>
                  Попробовать AI-анализ ✨
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
