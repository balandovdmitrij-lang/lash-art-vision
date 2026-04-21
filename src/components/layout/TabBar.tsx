import { motion } from 'framer-motion'

// ── Client tabs ──────────────────────────────────────────────
export type ClientTab = 'home' | 'ai' | 'catalog' | 'appointments' | 'chat'
export type MasterTab = 'dashboard' | 'clients' | 'calendar' | 'chat' | 'profile'

const clientTabs: { id: ClientTab; icon: string; label: string }[] = [
  { id: 'home',         icon: '🏠', label: 'Главная' },
  { id: 'ai',           icon: '✨', label: 'Подбор' },
  { id: 'catalog',      icon: '📖', label: 'Каталог' },
  { id: 'appointments', icon: '📅', label: 'Записи' },
  { id: 'chat',         icon: '💬', label: 'Чат' },
]

const masterTabs: { id: MasterTab; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '📊', label: 'Дашборд' },
  { id: 'clients',   icon: '👥', label: 'Клиенты' },
  { id: 'calendar',  icon: '📅', label: 'Календарь' },
  { id: 'chat',      icon: '💬', label: 'Чат' },
  { id: 'profile',   icon: '👤', label: 'Профиль' },
]

interface ClientTabBarProps {
  active: ClientTab
  onChange: (tab: ClientTab) => void
  unreadChats?: number
}

interface MasterTabBarProps {
  active: MasterTab
  onChange: (tab: MasterTab) => void
  unreadChats?: number
}

function TabItem({
  icon,
  label,
  active,
  onClick,
  accent,
  badge,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
  accent: string
  badge?: number
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="relative flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1"
    >
      <div className="relative">
        <motion.span
          animate={active ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          className={`text-xl ${active ? '' : 'opacity-50'}`}
          style={active ? { filter: `drop-shadow(0 0 6px ${accent})` } : {}}
        >
          {icon}
        </motion.span>
        {badge && badge > 0 ? (
          <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-cyber-pink rounded-full text-[9px] font-bold flex items-center justify-center text-white shadow-neon-sm">
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>
      <span
        className={`text-[10px] font-medium transition-colors ${
          active ? 'text-white' : 'text-text-muted'
        }`}
        style={active ? { color: accent } : {}}
      >
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
        />
      )}
    </motion.button>
  )
}

export function ClientTabBar({ active, onChange, unreadChats = 0 }: ClientTabBarProps) {
  const ACCENT = '#FF2D8A'
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 flex border-t z-50"
      style={{
        background: 'rgba(8,8,26,0.92)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,45,138,0.15)',
      }}
    >
      {clientTabs.map((t) => (
        <TabItem
          key={t.id}
          icon={t.icon}
          label={t.label}
          active={active === t.id}
          onClick={() => onChange(t.id)}
          accent={ACCENT}
          badge={t.id === 'chat' ? unreadChats : undefined}
        />
      ))}
    </nav>
  )
}

export function MasterTabBar({ active, onChange, unreadChats = 0 }: MasterTabBarProps) {
  const ACCENT = '#C9A96E'
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 flex border-t z-50"
      style={{
        background: 'rgba(8,8,26,0.92)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(201,169,110,0.15)',
      }}
    >
      {masterTabs.map((t) => (
        <TabItem
          key={t.id}
          icon={t.icon}
          label={t.label}
          active={active === t.id}
          onClick={() => onChange(t.id)}
          accent={ACCENT}
          badge={t.id === 'chat' ? unreadChats : undefined}
        />
      ))}
    </nav>
  )
}
