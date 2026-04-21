// AI Analysis screen — embeds the full v1.0 flow
// Onboarding → Camera → Validation → Analysis → Result → Chat
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../../store/appStore'
import { OnboardingScreen } from '../OnboardingScreen'
import { PrepareScreen } from '../PrepareScreen'
import { CameraScreen } from '../CameraScreen'
import { ValidationScreen } from '../ValidationScreen'
import { AnalysisScreen } from '../AnalysisScreen'
import { PreferencesScreen } from '../PreferencesScreen'
import { ResultScreen } from '../ResultScreen'
import { ChatScreen } from '../ChatScreen'

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

export function AIAnalysisScreen() {
  const screen = useAppStore((s) => s.screen)
  const Screen = screenMap[screen]

  return (
    <div className="h-full relative overflow-hidden">
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
