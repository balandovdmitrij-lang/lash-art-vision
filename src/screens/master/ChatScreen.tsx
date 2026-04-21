import { motion } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'

export function MasterChatScreen() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-display font-bold rose-text">Сообщения</h1>
        <p className="text-text-muted text-sm mt-1">Диалоги с клиентами</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-3">
        {/* Empty state */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-white font-semibold mb-1">Нет диалогов</p>
            <p className="text-text-muted text-sm">
              Когда клиенты напишут или поделятся AI-анализом — диалоги появятся здесь
            </p>
          </GlassCard>
        </motion.div>

        {/* Demo unread from client */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Демо-диалог</p>
          <GlassCard className="p-4 border border-neon-teal/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-electric-violet/20 flex items-center justify-center text-xl shrink-0">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-semibold">Алина К.</p>
                  <p className="text-text-muted text-xs">сейчас</p>
                </div>
                <p className="text-text-muted text-xs truncate">✨ поделилась AI-анализом</p>
              </div>
              <span className="w-5 h-5 rounded-full bg-cyber-pink text-white text-[10px] flex items-center justify-center shrink-0">1</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
