import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../store/appStore'
import { chatWithAI } from '../services/openrouter'

const QUICK_QUESTIONS = [
  'Объясни мой эффект подробнее',
  'Какие эффекты мне запрещены и почему?',
  'Можно добавить цвет?',
  'Что такое эффект лучики?',
  'Как выглядит мой эффект на разных типах лица?',
]

export function ChatScreen() {
  const { recommendation, eyeParams, chatHistory, addChatMessage, setScreen } = useAppStore((s) => ({
    recommendation: s.recommendation,
    eyeParams: s.eyeParams,
    chatHistory: s.chatHistory,
    addChatMessage: s.addChatMessage,
    setScreen: s.setScreen,
  }))

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingMsg, setStreamingMsg] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, streamingMsg])

  const systemPrompt = `Ты — AI-стилист по наращиванию ресниц. Говоришь экспертно, тепло, на "ты".
Результат анализа клиента: ${JSON.stringify(recommendation)}
Параметры глаз: ${JSON.stringify(eyeParams)}
Отвечай коротко, используй эмодзи в меру.`

  const send = async (text: string) => {
    if (!text.trim() || isTyping) return
    setInput('')
    addChatMessage({ role: 'user', content: text })
    setIsTyping(true)
    setStreamingMsg('')

    try {
      let full = ''
      for await (const chunk of chatWithAI(systemPrompt, chatHistory, text)) {
        full += chunk
        setStreamingMsg(full)
      }
      addChatMessage({ role: 'assistant', content: full })
    } catch {
      addChatMessage({ role: 'assistant', content: 'Что-то пошло не так. Попробуй ещё раз 🙏' })
    } finally {
      setIsTyping(false)
      setStreamingMsg('')
    }
  }

  return (
    <div className="h-full flex flex-col bg-obsidian">
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setScreen('result')} className="text-text-muted">
          ←
        </button>
        <div className="w-8 h-8 rounded-full bg-cyber-pink/20 border border-cyber-pink/40 flex items-center justify-center text-sm">
          🤍
        </div>
        <div>
          <div className="text-sm font-semibold text-white">AI-стилист</div>
          <div className="text-xs text-cyber-pink">онлайн</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 flex flex-col gap-3">
        {chatHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
          >
            <p className="text-text-primary text-sm">
              Привет! 👋 Я знаю твой результат — <strong className="text-cyber-pink">{recommendation?.effectName}</strong>. Задавай любые вопросы о своих ресничках ✨
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyber-pink text-white rounded-tr-sm'
                    : 'glass text-text-primary rounded-tl-sm'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming message */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] glass px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-text-primary">
              {streamingMsg || (
                <span className="flex gap-1">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>•</motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>•</motion.span>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>•</motion.span>
                </span>
              )}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {chatHistory.length === 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="shrink-0 glass border border-white/10 text-text-muted text-xs px-3 py-2 rounded-full hover:border-cyber-pink hover:text-cyber-pink transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass border-t border-white/5 px-4 py-3 flex gap-3 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder="Задай вопрос стилисту..."
          rows={1}
          className="flex-1 bg-transparent text-text-primary text-sm placeholder-text-muted resize-none outline-none"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || isTyping}
          className="w-9 h-9 rounded-full bg-cyber-pink flex items-center justify-center text-white disabled:opacity-40 shrink-0"
        >
          ↑
        </button>
      </div>
    </div>
  )
}
