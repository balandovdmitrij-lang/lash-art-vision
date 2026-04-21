import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../lib/supabase'

interface ClientRow extends UserProfile {
  last_visit?: string
  visit_count?: number
  unread?: number
  days_since_visit?: number
}

export function ClientListScreen() {
  const profile = useAuthStore((s) => s.profile)
  const [clients, setClients] = useState<ClientRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ClientRow | null>(null)

  const fetchClients = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    const { data } = await supabase
      .from('master_clients')
      .select('client_id, linked_at, users!master_clients_client_id_fkey(*)')
      .eq('master_id', profile.id)
    if (data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (data as any[]).map((r) => ({
        ...(Array.isArray(r.users) ? r.users[0] : r.users) as UserProfile,
        last_visit: r.linked_at as string,
      })) as ClientRow[]
      setClients(rows)
    }
    setLoading(false)
  }, [profile])

  useEffect(() => { fetchClients() }, [fetchClients])

  const filtered = clients.filter((c) =>
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-3">
        <h1 className="text-2xl font-display font-bold rose-text">Клиенты</h1>
        <p className="text-text-muted text-sm">{clients.length} в базе</p>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
          <input
            type="text"
            placeholder="Имя или телефон…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted text-sm focus:outline-none focus:border-rose-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 space-y-2 pb-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/3 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard className="p-8 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-white font-semibold mb-1">
                {search ? 'Не найдено' : 'Нет клиентов'}
              </p>
              <p className="text-text-muted text-sm">
                {search
                  ? 'Попробуй другой запрос'
                  : 'Поделись своим QR-кодом в профиле — клиенты привяжутся автоматически'}
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button className="w-full text-left" onClick={() => setSelected(client)}>
                <GlassCard className={`p-3 flex items-center gap-3 ${
                  client.days_since_visit && client.days_since_visit > 60
                    ? 'border-yellow-500/30'
                    : ''
                }`}>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-electric-violet/20 flex items-center justify-center text-lg overflow-hidden shrink-0">
                    {client.avatar_url
                      ? <img src={client.avatar_url} alt="" className="w-full h-full object-cover" />
                      : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold truncate">{client.name}</p>
                      {client.days_since_visit && client.days_since_visit > 60 && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                          Давно не был
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted text-xs">{client.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {client.unread ? (
                      <span className="w-5 h-5 rounded-full bg-cyber-pink text-white text-[10px] flex items-center justify-center">
                        {client.unread}
                      </span>
                    ) : (
                      <span className="text-text-muted text-lg">›</span>
                    )}
                  </div>
                </GlassCard>
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Client Card Sheet */}
      <AnimatePresence>
        {selected && (
          <ClientCardSheet client={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ClientCardSheet({ client, onClose }: { client: ClientRow; onClose: () => void }) {
  const [tab, setTab] = useState<'history' | 'analyses' | 'notes'>('history')
  const [notes, setNotes] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/70 z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full h-[85%] rounded-t-3xl flex flex-col"
        style={{ background: '#13132A', border: '1px solid rgba(201,169,110,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4 shrink-0" />

        {/* Client header */}
        <div className="px-5 pb-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-electric-violet/20 flex items-center justify-center text-2xl overflow-hidden">
              {client.avatar_url ? <img src={client.avatar_url} alt="" className="w-full h-full object-cover" /> : '👤'}
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white">{client.name}</h2>
              <p className="text-text-muted text-sm">{client.phone}</p>
              <p className="text-text-muted text-xs">Клиент с {new Date(client.created_at).toLocaleDateString('ru')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-5 shrink-0">
          {(['history', 'analyses', 'notes'] as const).map((t) => {
            const labels = { history: 'История', analyses: 'Анализы', notes: 'Заметки' }
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 pb-2 text-sm font-medium transition-colors relative ${
                  tab === t ? 'text-rose-gold' : 'text-text-muted'
                }`}
              >
                {labels[t]}
                {tab === t && (
                  <motion.div layoutId="client-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-gold rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
          {tab === 'history' && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-text-muted text-sm">История визитов появится после первой записи</p>
            </div>
          )}
          {tab === 'analyses' && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-text-muted text-sm">AI-анализы клиента будут здесь</p>
            </div>
          )}
          {tab === 'notes' && (
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Заметки мастера: особенности, предпочтения, аллергии…"
                className="w-full h-40 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted text-sm resize-none focus:outline-none focus:border-rose-gold/50"
              />
              <p className="text-text-muted text-xs mt-2">Только ты видишь эти заметки</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-6 flex gap-3 shrink-0">
          <button className="flex-1 h-11 rounded-xl border border-rose-gold/30 text-rose-gold text-sm font-medium hover:bg-rose-gold/10 transition-colors">
            Записать
          </button>
          <button className="flex-1 h-11 rounded-xl bg-cyber-pink/20 border border-cyber-pink/30 text-cyber-pink text-sm font-medium">
            Написать
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
