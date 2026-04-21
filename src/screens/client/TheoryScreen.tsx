import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'

const effects = [
  {
    name: 'Лисий эффект',
    icon: '🦊',
    color: '#FF2D8A',
    short: 'Удлинение к внешнему углу',
    description:
      'Ресницы постепенно удлиняются от внутреннего угла к внешнему. Создаёт эффект вытянутого, соблазнительного взгляда. Идеален для круглых глаз — визуально вытягивает форму.',
    suitedFor: ['Круглые глаза', 'Близко посаженные глаза', 'Небольшие глаза'],
    notFor: ['Миндалевидные глаза', 'Опущенные уголки'],
    curl: 'C или D',
    zones: '8–9–10–11–12 мм',
  },
  {
    name: 'Кошачий эффект',
    icon: '🐱',
    color: '#9B5DE5',
    short: 'Акцент на внешний уголок',
    description:
      'Короткие ресницы во внутреннем уголке резко переходят в длинные на внешнем. Придаёт взгляду игривость и загадочность. Один из самых популярных запросов.',
    suitedFor: ['Все типы глаз', 'Прямой разрез', 'Опущенные уголки'],
    notFor: ['Очень маленькие глаза'],
    curl: 'C или CC',
    zones: '7–8–9–11–13 мм',
  },
  {
    name: 'Кукольный эффект',
    icon: '🪆',
    color: '#00D4FF',
    short: 'Максимум в центре',
    description:
      'Самые длинные ресницы расположены в центре века, что визуально раскрывает и увеличивает глаз. Придаёт взгляду невинность и открытость.',
    suitedFor: ['Узкие глаза', 'Глубоко посаженные глаза', 'Азиатский тип'],
    notFor: ['Выпуклые глаза', 'Уже широкие глаза'],
    curl: 'CC или D',
    zones: '9–11–12–11–9 мм',
  },
  {
    name: 'Беличий эффект',
    icon: '🐿️',
    color: '#C9A96E',
    short: 'Пик на 3/4 века',
    description:
      'Пик длины приходится на три четверти от внутреннего угла. Смягчает черты, придаёт взгляду мягкость и женственность. Современный трендовый эффект.',
    suitedFor: ['Миндалевидные глаза', 'Большие глаза', 'Европейский тип'],
    notFor: ['Близко посаженные глаза'],
    curl: 'B или C',
    zones: '9–10–12–11–9 мм',
  },
  {
    name: 'Натуральный',
    icon: '🍃',
    color: '#4CAF50',
    short: 'Повторяет природный рост',
    description:
      'Плавное повторение натуральной формы роста ресниц. Незаметное усиление, идеально для повседневной жизни и клиентов, которые хотят «как будто свои, только лучше».',
    suitedFor: ['Любой тип глаз', 'Деловой стиль', 'Чувствительные глаза'],
    notFor: [],
    curl: 'B или C',
    zones: '9–10–11–10–9 мм',
  },
  {
    name: 'Виспи',
    icon: '✨',
    color: '#FF9500',
    short: 'Пушистые пучки с иголочками',
    description:
      'Создаётся из пучков разной длины с длинными «иголочками» — отдельными более длинными ресницами. Выглядит как голливудский объём, модно и драматично.',
    suitedFor: ['Большие глаза', 'Широко посаженные глаза', 'Вечерний look'],
    notFor: ['Тонкие и слабые ресницы', 'Очень маленькие глаза'],
    curl: 'CC или D',
    zones: 'Микс 9–14 мм',
  },
]

const theory = [
  {
    title: 'Типы изгибов',
    icon: '〜',
    color: '#9B5DE5',
    content: `**B** — слабый изгиб, почти прямые. Добавляют длину без подъёма. Для натурального результата.

**C** — стандартный изгиб. Классика, подходит большинству. Хорошо открывает глаз.

**CC** — между C и D. Современный выбор. Открывает глаз сильнее C.

**D** — сильный изгиб, крутой подъём. Для глубоко посаженных глаз или максимального эффекта.

**L/L+** — прямое основание с крутым изгибом на конце. Для нависшего века.`,
  },
  {
    title: 'Толщина ресниц',
    icon: '📏',
    color: '#FF2D8A',
    content: `**0.03–0.05 мм** — ультратонкие. Для мегаобъёма. Используются пучками по 6–16 штук.

**0.07 мм** — тонкие. Русский объём (2–5D). Лёгкий результат.

**0.10 мм** — классика. 1:1 с натуральными ресницами. Самый натуральный вид.

**0.12–0.15 мм** — утолщённые. Для насыщенного классического результата.

**0.20 мм** — толстые. Создают максимальный акцент.`,
  },
  {
    title: 'Противопоказания',
    icon: '⚠️',
    color: '#FF9500',
    content: `• Аллергия на клей или смолы
• Конъюнктивит и другие глазные инфекции
• Сухой синдром глаза (в острой форме)
• Беременность (рекомендуется осторожность)
• Сильное нависание века (ограничивает эффекты)
• Химиотерапия (ресницы очень ослаблены)

При чувствительных глазах рекомендуется тест на аллергию за 24 часа до процедуры.`,
  },
  {
    title: 'Уход после процедуры',
    icon: '💧',
    color: '#00D4FF',
    content: `**Первые 24 часа:**
• Не мочить ресницы
• Не посещать сауну и бассейн
• Не спать лицом в подушку

**Ежедневный уход:**
• Расчёсывать щёточкой каждое утро
• Мыть мягкой пенкой без масел
• Не тереть глаза руками

**Нельзя:**
• Масляная косметика для снятия макияжа
• Тушь (особенно водостойкая)
• Механические бигуди`,
  },
  {
    title: 'Коррекция и долговечность',
    icon: '🗓️',
    color: '#C9A96E',
    content: `Натуральный цикл роста ресниц — 45–90 дней. Ресницы выпадают вместе с нарощенными.

**Срок службы:**
• 2–3 недели — рекомендуемая коррекция
• 4 недели — максимум без потери вида
• После 5 недель коррекция экономически нецелесообразна

**Что ускоряет выпадение:**
• Жирная кожа
• Активный образ жизни / пот
• Несоблюдение ухода
• Некачественный клей

**Совет:** планируй коррекцию заранее — запишись сразу на следующий визит.`,
  },
]

export function TheoryScreen() {
  const [activeEffect, setActiveEffect] = useState<number | null>(null)
  const [activeTheory, setActiveTheory] = useState<number | null>(null)

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 pt-12 pb-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold neon-text">Теория и эффекты</h1>
        <p className="text-text-muted text-sm">Всё что нужно знать о наращивании</p>
      </motion.div>

      {/* Effects */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <p className="text-text-muted text-xs uppercase tracking-widest mb-3">Эффекты ресниц</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {effects.map((effect, i) => (
            <motion.button
              key={effect.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => setActiveEffect(activeEffect === i ? null : i)}
              className="text-left"
            >
              <GlassCard
                className="p-3 h-full"
                style={activeEffect === i ? { borderColor: effect.color, background: `${effect.color}10` } : {}}
              >
                <div className="text-2xl mb-1" style={{ filter: `drop-shadow(0 0 6px ${effect.color})` }}>
                  {effect.icon}
                </div>
                <p className="text-white text-sm font-semibold">{effect.name}</p>
                <p className="text-text-muted text-xs mt-0.5">{effect.short}</p>
              </GlassCard>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Effect detail */}
      <AnimatePresence>
        {activeEffect !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
            className="mb-6"
          >
            <GlassCard className="p-4" style={{ borderColor: effects[activeEffect].color }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{effects[activeEffect].icon}</span>
                <h3 className="text-white font-bold">{effects[activeEffect].name}</h3>
              </div>
              <p className="text-text-muted text-sm mb-3">{effects[activeEffect].description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-green-400 font-semibold mb-1">Подходит для</p>
                  {effects[activeEffect].suitedFor.map((s) => (
                    <p key={s} className="text-text-muted">• {s}</p>
                  ))}
                </div>
                {effects[activeEffect].notFor.length > 0 && (
                  <div>
                    <p className="text-red-400 font-semibold mb-1">Не подходит</p>
                    {effects[activeEffect].notFor.map((s) => (
                      <p key={s} className="text-text-muted">• {s}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex gap-4 text-xs">
                <div>
                  <span className="text-text-muted">Изгиб: </span>
                  <span className="text-white font-medium">{effects[activeEffect].curl}</span>
                </div>
                <div>
                  <span className="text-text-muted">Длины: </span>
                  <span className="text-white font-medium">{effects[activeEffect].zones}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theory sections */}
      <p className="text-text-muted text-xs uppercase tracking-widest mb-3">База знаний</p>
      <div className="space-y-3 pb-4">
        {theory.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <button
              className="w-full text-left"
              onClick={() => setActiveTheory(activeTheory === i ? null : i)}
            >
              <GlassCard
                className="p-4"
                style={activeTheory === i ? { borderColor: item.color } : {}}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-xl w-8 h-8 flex items-center justify-center rounded-lg bg-white/5"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-white text-sm font-semibold flex-1">{item.title}</span>
                  <motion.span
                    animate={{ rotate: activeTheory === i ? 180 : 0 }}
                    className="text-text-muted text-sm"
                  >
                    ›
                  </motion.span>
                </div>

                <AnimatePresence>
                  {activeTheory === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="mt-3 pt-3 border-t border-white/5">
                        {item.content.split('\n').map((line, j) => (
                          <p
                            key={j}
                            className={`text-xs mb-1 ${
                              line.startsWith('**') && line.endsWith('**')
                                ? 'text-white font-semibold mt-2'
                                : 'text-text-muted'
                            }`}
                          >
                            {line.replace(/\*\*/g, '')}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
