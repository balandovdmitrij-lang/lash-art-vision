import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import { auth } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import type { UserProfile } from '../../lib/supabase'

export function SplashScreen() {
  const { setAuthScreen, setProfile, setFirebaseUid, profile } = useAuthStore()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUid(firebaseUser.uid)
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', firebaseUser.uid)
          .single()
        if (data) {
          setProfile(data as UserProfile)
        } else {
          setAuthScreen('role_select')
        }
      } else {
        // No Firebase session — check if we have cached profile
        if (profile) {
          setAuthScreen('app')
        } else {
          setAuthScreen('phone')
        }
      }
    })
    // Fallback timeout in case Firebase is slow
    const t = setTimeout(() => setAuthScreen('phone'), 5000)
    return () => {
      unsub()
      clearTimeout(t)
    }
  }, [])

  return (
    <div className="h-full flex flex-col items-center justify-center bg-obsidian">
      {/* Ambient orbs */}
      <div className="orb orb-pink" style={{ top: '10%', left: '-15%', width: '300px', height: '300px' }} />
      <div className="orb orb-violet" style={{ bottom: '10%', right: '-15%', width: '350px', height: '350px' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-center relative z-10"
      >
        {/* Logo mark */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-20 h-20 mx-auto mb-6 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #FF2D8A, #9B5DE5, #00D4FF, #FF2D8A)',
            padding: '3px',
          }}
        >
          <div className="w-full h-full rounded-full bg-obsidian flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
        </motion.div>

        <div className="text-3xl font-display font-bold neon-text tracking-widest mb-1">
          LASH ART
        </div>
        <div className="text-xl font-display font-bold gradient-text tracking-widest mb-2">
          VISION 2.0
        </div>
        <div className="text-xs text-text-muted tracking-widest">by @lash.bomba</div>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="absolute bottom-16 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-cyber-pink"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>

      {/* Hidden recaptcha */}
      <div id="recaptcha-container" />
    </div>
  )
}
