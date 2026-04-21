import { AnimatePresence, motion } from 'framer-motion'
import { ClientTabBar, MasterTabBar } from './TabBar'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'

// Client screens
import { ClientHomeScreen } from '../../screens/client/HomeScreen'
import { AIAnalysisScreen } from '../../screens/client/AIAnalysisScreen'
import { CatalogScreen } from '../../screens/client/CatalogScreen'
import { AppointmentScreen } from '../../screens/client/AppointmentScreen'
import { ClientChatScreen } from '../../screens/client/ChatScreen'
import { TheoryScreen } from '../../screens/client/TheoryScreen'

// Master screens
import { DashboardScreen } from '../../screens/master/DashboardScreen'
import { ClientListScreen } from '../../screens/master/ClientListScreen'
import { CalendarScreen } from '../../screens/master/CalendarScreen'
import { MasterChatScreen } from '../../screens/master/ChatScreen'
import { MasterProfileScreen } from '../../screens/master/ProfileScreen'

import type { ClientTab, MasterTab } from './TabBar'
import type { ComponentType } from 'react'

const clientScreens: Record<ClientTab, ComponentType> = {
  home: ClientHomeScreen,
  ai: AIAnalysisScreen,
  catalog: CatalogScreen,
  appointments: AppointmentScreen,
  chat: ClientChatScreen,
  theory: TheoryScreen,
}

const masterScreens: Record<MasterTab, ComponentType> = {
  dashboard: DashboardScreen,
  clients: ClientListScreen,
  calendar: CalendarScreen,
  chat: MasterChatScreen,
  profile: MasterProfileScreen,
}

export function AppLayout() {
  const profile = useAuthStore((s) => s.profile)
  const isClient = profile?.role === 'client'

  const clientTab = useAppStore((s) => s.clientTab)
  const masterTab = useAppStore((s) => s.masterTab)
  const setClientTab = useAppStore((s) => s.setClientTab)
  const setMasterTab = useAppStore((s) => s.setMasterTab)

  if (isClient) {
    const Screen = clientScreens[clientTab]
    return (
      <div className="h-full flex flex-col relative">
        <div className="orb orb-pink pointer-events-none" style={{ top: '-5%', left: '-20%', width: '340px', height: '340px' }} />
        <div className="orb orb-violet pointer-events-none" style={{ top: '45%', right: '-25%', width: '380px', height: '380px' }} />
        <div className="perspective-grid absolute inset-0 pointer-events-none z-0" />

        <div className="flex-1 overflow-hidden relative z-10" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={clientTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </div>

        <ClientTabBar active={clientTab} onChange={setClientTab} />
      </div>
    )
  }

  const Screen = masterScreens[masterTab]
  return (
    <div className="h-full flex flex-col relative">
      <div className="orb orb-violet pointer-events-none" style={{ top: '-5%', right: '-20%', width: '300px', height: '300px' }} />
      <div className="orb pointer-events-none" style={{ bottom: '5%', left: '-15%', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(201,169,110,0.2) 0%, transparent 70%)' }} />
      <div className="perspective-grid absolute inset-0 pointer-events-none z-0" />

      <div className="flex-1 overflow-hidden relative z-10" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={masterTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </div>

      <MasterTabBar active={masterTab} onChange={setMasterTab} />
    </div>
  )
}
