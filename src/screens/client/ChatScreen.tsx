import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { supabase } from '../../lib/supabase'

// Chat list view showing conversations with masters + AI assistant
export function ClientChatScreen() {
  const [view, setView] = useState<'list' | 'ai'>('list')

  if (view === 'ai') {
    return <AIChatView onBack={() => setView('list')} />
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold gradient-text">Чат</h1>
        <p className="text-text-muted text-sm mt-1">Мастера и AI-стилист</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-3">
        {/* AI assistant */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => setView('ai')}
            className="w-full text-left"
          >
            <GlassCard className="p-4 shimmer-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-cyber-pink/20 flex items-center justify-center text-2xl"
                  style={{ boxShadow: '0 0 15px rgba(255,45,138,0.3)' }}
                >
                  🤖
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">AI-стилист</p>
                    <span className="text-[10px] bg-cyber-pink/20 text-cyber-pink px-2 py-0.5 rounded-full border border-cyber-pink/30">
                      Всегда онлайн
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-0.5">Спроси про уход, эффекты, рекомендации…</p>
                </div>
                <span className="text-text-muted text-lg">›</span>
              </div>
            </GlassCard>
          </button>
        </motion.div>

        {/* Empty state for master chats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-6 text-center">
            <div className="text-3xl mb-2">💬</div>
            <p className="text-white text-sm font-semibold mb-1">Нет диалогов с мастерами</p>
            <p className="text-text-muted text-xs">
              Запишись к мастеру или поделись AI-анализом — начнётся диалог
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}

// ── AI Chat View ──────────────────────────────────────────────
function AIChatView({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Привет! Я AI-стилист LASH ART VISION. Спроси меня про уход за ресницами, технику или подбор образа 💅' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const QUICK = ['Как ухаживать?', 'Какой эффект мне?', 'Сколько держатся?', 'Что нельзя делать?']

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg = { role: 'user' as const, text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Call Supabase Edge Function for AI chat
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: text, history: messages.slice(-6) },
      })
      const reply = error ? 'Не удалось получить ответ. Попробуй позже.' : (data?.reply ?? '...')
      setMessages((m) => [...m, { role: 'ai', text: reply }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Временная ошибка. Попробуй снова 🙏' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 flex items-center gap-3 border-b border-white/5">
        <motion.button onClick={onBack} whileTap={{ scale: 0.9 }} className="text-text-muted hover:text-white">
          ←
        </motion.button>
        <div className="w-9 h-9 rounded-full bg-cyber-pink/20 flex items-center justify-center text-lg">🤖</div>
        <div>
          <p className="text-white text-sm font-semibold">AI-стилист</p>
          <p className="text-green-400 text-xs">● Онлайн</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyber-pink/20 border border-cyber-pink/30 text-white rounded-br-sm'
                    : 'bg-white/5 border border-white/10 text-text-primary rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cyber-pink"
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="shrink-0 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs text-text-muted hover:border-cyber-pink/40 hover:text-cyber-pink transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Напиши AI-стилисту…"
          className="flex-1 h-11 px-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-text-muted text-sm focus:outline-none focus:border-cyber-pink/50 transition-colors"
        />
        <motion.button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full bg-cyber-pink flex items-center justify-center text-white shadow-neon-sm disabled:opacity-40"
        >
          ›
        </motion.button>
      </div>
    </div>
  )
}
