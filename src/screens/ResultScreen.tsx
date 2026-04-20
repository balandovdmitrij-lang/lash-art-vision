import { motion } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { GlassCard } from '../components/ui/GlassCard'
import { NeonButton } from '../components/ui/NeonButton'
import { SchemeVisualizer } from '../components/face/SchemeVisualizer'

const FORBIDDEN_RU: Record<string, string> = {
  fox: 'Лисий',
  'fox effect': 'Лисий эффект',
  doll: 'Кукольный',
  'doll effect': 'Кукольный эффект',
  squirrel: 'Беличий',
  'squirrel effect': 'Беличий эффект',
  fox_squirrel: 'Лиса-белка',
  'fox squirrel': 'Лиса-белка',
  reverse_squirrel: 'Обратная белка',
  'reverse squirrel': 'Обратная белка',
  wispy: 'Виспи',
  'mega volume': 'Мега объём',
  volume: 'Объёмный',
  natural: 'Натуральный',
  classic: 'Классика',
}

function toRu(name: string): string {
  const lower = name.toLowerCase().trim()
  return FORBIDDEN_RU[lower] ?? name
}

export function ResultScreen() {
  const { recommendation, photoUrl, setScreen, reset } = useAppStore((s) => ({
    recommendation: s.recommendation,
    photoUrl: s.photoUrl,
    setScreen: s.setScreen,
    reset: s.reset,
  }))

  if (!recommendation) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 gap-4">
        <p className="text-text-muted text-sm">Результат не получен</p>
        <NeonButton onClick={() => setScreen('preferences')} variant="secondary">
          ← Назад
        </NeonButton>
      </div>
    )
  }

  const shareText = `✨ Мой эффект: ${recommendation.effectName}\n${recommendation.effectDescription}\n\nЗоны: ${recommendation.zones.map((z) => `${z.zone}: ${z.length}мм`).join(' · ')}\nИзгиб: ${recommendation.curl} · Объём: ${recommendation.volume}\n\n#LashArtVision`
  const encoded = encodeURIComponent(shareText)

  const shareOptions = [
    {
      label: 'Telegram',
      icon: '✈️',
      color: '#229ED9',
      action: () => window.open(`https://t.me/share/url?url=https%3A%2F%2Flashbomba.ru&text=${encoded}`, '_blank'),
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      action: () => window.open(`https://wa.me/?text=${encoded}`, '_blank'),
    },
    {
      label: 'VK',
      icon: '🔵',
      color: '#4C7DB4',
      action: () => window.open(`https://vk.com/share.php?title=${encodeURIComponent(recommendation.effectName)}&comment=${encoded}`, '_blank'),
    },
    {
      label: 'Почта',
      icon: '📧',
      color: '#D4A853',
      action: () => window.open(`mailto:?subject=${encodeURIComponent('Мой эффект ресниц — ' + recommendation.effectName)}&body=${encoded}`, '_blank'),
    },
    {
      label: 'Копировать',
      icon: '📋',
      color: '#9B5DE5',
      action: async () => {
        await navigator.clipboard.writeText(shareText)
        alert('Скопировано!')
      },
    },
    {
      label: 'Ещё',
      icon: '⬆️',
      color: '#FF2D8A',
      action: async () => {
        try {
          if (navigator.share) await navigator.share({ title: 'Lash Art Vision', text: shareText })
        } catch { /* cancelled */ }
      },
    },
  ]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-2"
      >
        <p className="text-text-muted text-xs tracking-widest uppercase mb-2">Твой рецепт ресниц</p>
        <h1 className="text-3xl font-display font-bold gradient-text leading-tight">
          {recommendation.effectName}
        </h1>
      </motion.div>

      {/* Neon divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="neon-line mx-4 my-4"
      />

      {/* AI message */}
      <GlassCard shimmer delay={0.1} className="mb-4">
        <div className="flex gap-3">
          <span className="text-2xl shrink-0">✨</span>
          <p className="text-text-primary text-sm leading-relaxed italic">
            {recommendation.aiMessage}
          </p>
        </div>
      </GlassCard>

      {/* Scheme visualizer */}
      <GlassCard delay={0.2} className="mb-4">
        <p className="text-text-muted text-xs mb-3 uppercase tracking-wider violet-text">Схема-веер</p>
        <SchemeVisualizer zones={recommendation.zones} curl={recommendation.curl} />
      </GlassCard>

      {/* Parameters grid */}
      <GlassCard delay={0.3} className="mb-4">
        <p className="text-text-muted text-xs mb-3 uppercase tracking-wider violet-text">Параметры наращивания</p>
        <div className="grid grid-cols-2 gap-3">
          {recommendation.zones.map((z, i) => (
            <motion.div
              key={z.zone}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.06 }}
              className="rounded-xl p-3 text-center"
              style={{
                background: `linear-gradient(135deg, rgba(255,45,138,0.12), rgba(155,93,229,0.08))`,
                border: '1px solid rgba(155,93,229,0.25)',
              }}
            >
              <div className="text-text-muted text-xs">Зона {z.zone}</div>
              <div className="font-bold text-xl" style={{ color: `hsl(${280 + i * 30}, 80%, 72%)` }}>
                {z.length}<span className="text-xs">мм</span>
              </div>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl p-3 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(255,45,138,0.08))',
              border: '1px solid rgba(212,168,83,0.3)',
            }}
          >
            <div className="text-text-muted text-xs">Изгиб</div>
            <div className="rose-text font-bold text-xl">{recommendation.curl}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 }}
            className="rounded-xl p-3 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(155,93,229,0.08))',
              border: '1px solid rgba(0,212,255,0.25)',
            }}
          >
            <div className="text-text-muted text-xs">Объём</div>
            <div className="cyan-text font-bold text-xl">{recommendation.volume}</div>
          </motion.div>
        </div>
      </GlassCard>

      {/* Forbidden */}
      {recommendation.forbidden?.length > 0 && (
        <GlassCard delay={0.4} className="mb-4">
          <p className="text-text-muted text-xs mb-3 uppercase tracking-wider" style={{ color: '#F87171' }}>
            ⛔ Не рекомендуется
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendation.forbidden.map((f: string) => (
              <span key={f} className="badge-red text-xs px-3 py-1 rounded-full">
                ✕ {toRu(f)}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Photo */}
      {photoUrl && (
        <GlassCard delay={0.5} className="mb-6">
          <p className="text-text-muted text-xs mb-3 uppercase tracking-wider violet-text">Твоё фото</p>
          <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid rgba(155,93,229,0.3)' }}>
            <img src={photoUrl} alt="face" className="w-full object-cover max-h-48" />
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(to top, rgba(18,8,42,0.6) 0%, transparent 40%)',
            }} />
          </div>
        </GlassCard>
      )}

      {/* Neon divider */}
      <div className="neon-line mx-4 mb-6" />

      {/* Share */}
      <GlassCard delay={0.6} className="mb-4">
        <p className="text-text-muted text-xs mb-3 uppercase tracking-wider violet-text">Поделиться результатом</p>
        <div className="grid grid-cols-3 gap-3">
          {shareOptions.map((opt, i) => (
            <motion.button
              key={opt.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65 + i * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={opt.action}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all active:scale-95"
              style={{
                background: `${opt.color}18`,
                border: `1px solid ${opt.color}40`,
              }}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs font-medium" style={{ color: opt.color }}>{opt.label}</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-col gap-3 pb-8">
        <NeonButton onClick={() => setScreen('chat')} variant="gradient" fullWidth>
          💬 Поговорить со стилистом
        </NeonButton>
        <NeonButton variant="ghost" onClick={reset} fullWidth>
          🔄 Начать заново
        </NeonButton>
      </div>
    </div>
  )
}
