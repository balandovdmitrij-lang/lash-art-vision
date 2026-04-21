import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from './store/authStore'

// Auth screens
import { SplashScreen } from './screens/auth/SplashScreen'
import { LoginScreen } from './screens/auth/LoginScreen'
import { RoleSelectScreen } from './screens/auth/RoleSelectScreen'
import { ProfileSetupScreen } from './screens/auth/ProfileSetupScreen'

// Authenticated app
import { AppLayout } from './components/layout/AppLayout'

export default function App() {
  const authScreen = useAuthStore((s) => s.authScreen)

  const screen = () => {
    switch (authScreen) {
      case 'splash':        return <SplashScreen />
      case 'login':         return <LoginScreen />
      case 'role_select':   return <RoleSelectScreen />
      case 'profile_setup': return <ProfileSetupScreen />
      case 'app':           return <AppLayout />
    }
  }

  return (
    <div className="h-full max-w-md mx-auto relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={authScreen}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {screen()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
