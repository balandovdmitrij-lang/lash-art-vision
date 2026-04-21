import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../../components/ui/NeonButton'
import { GlassCard } from '../../components/ui/GlassCard'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../lib/supabase'

export function ProfileSetupScreen() {
  const { firebaseUid, phone, profile } = useAuthStore()
  const role = profile?.role ?? 'client'
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!name.trim() || !firebaseUid) return
    setLoading(true)
    setError('')

    try {
      let uploadedAvatarUrl: string | null = null

      // Upload avatar if selected
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${firebaseUid}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (!uploadErr) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path)
          uploadedAvatarUrl = data.publicUrl
        }
      }

      const userProfile: UserProfile = {
        id: firebaseUid,
        role,
        phone: phone ?? '',
        name: name.trim(),
        avatar_url: uploadedAvatarUrl,
        created_at: new Date().toISOString(),
      }

      const { error: dbErr } = await supabase
        .from('users')
        .upsert(userProfile, { onConflict: 'id' })

      if (dbErr) throw dbErr

      useAuthStore.getState().setProfile(userProfile)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения профиля')
    } finally {
      setLoading(false)
    }
  }

  const isMaster = role === 'master'

  return (
    <div className="h-full flex flex-col items-center justify-between px-6 py-12 bg-obsidian overflow-y-auto">
      <div className="orb orb-pink" style={{ top: '0%', left: '-10%', width: '250px', height: '250px' }} />

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className={`text-2xl font-display font-bold tracking-wider ${isMaster ? 'rose-text' : 'neon-text'}`}>
          {isMaster ? '💅 Профиль мастера' : '✨ Твой профиль'}
        </div>
        <p className="text-text-muted text-sm mt-1">Последний шаг!</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full space-y-4"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={() => fileRef.current?.click()}
            whileTap={{ scale: 0.96 }}
            className="relative"
          >
            <div
              className={`w-24 h-24 rounded-full border-2 overflow-hidden flex items-center justify-center ${
                isMaster ? 'border-rose-gold' : 'border-cyber-pink'
              } ${avatarUrl ? '' : 'bg-white/5'}`}
              style={isMaster ? { boxShadow: '0 0 20px rgba(212,168,83,0.3)' } : { boxShadow: '0 0 20px rgba(255,45,138,0.3)' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{isMaster ? '💅' : '👤'}</span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-cyber-pink rounded-full flex items-center justify-center text-sm shadow-neon-sm">
              📷
            </div>
          </motion.button>
          <p className="text-text-muted text-xs">Нажми чтобы добавить фото</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>

        <GlassCard className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-text-muted text-xs mb-1 block">
              {isMaster ? 'Имя мастера / Бренд' : 'Твоё имя'}
            </label>
            <input
              type="text"
              placeholder={isMaster ? 'Анастасия / @lash.by.nastya' : 'Как тебя зовут?'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleSave()}
              className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:outline-none focus:border-cyber-pink/60 transition-colors"
            />
          </div>

          {/* Phone (readonly) */}
          <div>
            <label className="text-text-muted text-xs mb-1 block">Телефон</label>
            <div className="h-12 px-4 rounded-xl bg-white/3 border border-white/5 flex items-center">
              <span className="text-text-muted text-sm">{phone}</span>
              <span className="ml-auto text-green-400 text-xs">✓ подтверждён</span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">⚠️ {error}</p>
          )}
        </GlassCard>

        {isMaster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-4 border border-rose-gold/20"
          >
            <p className="text-xs text-text-muted text-center">
              💡 После регистрации клиенты смогут найти тебя по QR-коду и записаться онлайн
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <NeonButton
          onClick={handleSave}
          disabled={!name.trim() || loading}
          fullWidth
          variant="gradient"
        >
          {loading ? 'Сохраняем…' : isMaster ? 'Войти как мастер 💅' : 'Начать ✨'}
        </NeonButton>
      </motion.div>
    </div>
  )
}
