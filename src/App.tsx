import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from './store/appStore'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { PrepareScreen } from './screens/PrepareScreen'
import { CameraScreen } from './screens/CameraScreen'
import { ValidationScreen } from './screens/ValidationScreen'
import { AnalysisScreen } from './screens/AnalysisScreen'
import { PreferencesScreen } from './screens/PreferencesScreen'
import { ResultScreen } from './screens/ResultScreen'
import { ChatScreen } from './screens/ChatScreen'

const screenMap = {
  onboarding: OnboardingScreen,
  prepare: PrepareScreen,
  camera: CameraScreen,
  validation: ValidationScreen,
  analysis: AnalysisScreen,
  preferences: PreferencesScreen,
  result: ResultScreen,
  chat: ChatScreen,
}

export default function App() {
  const screen = useAppStore((s) => s.screen)
  const Screen = screenMap[screen]

  return (
    <div className="h-full max-w-md mx-auto relative overflow-hidden">
      {/* Floating ambient orbs */}
      <div className="orb orb-pink" style={{ top: '-5%', left: '-20%', width: '340px', height: '340px' }} />
      <div className="orb orb-violet" style={{ top: '45%', right: '-25%', width: '380px', height: '380px' }} />
      <div className="orb orb-cyan" style={{ bottom: '0%', left: '15%', width: '260px', height: '260px' }} />

      {/* Perspective grid overlay */}
      <div className="perspective-grid absolute inset-0 pointer-events-none z-0" />

      {/* Screen content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="h-full relative z-10"
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
