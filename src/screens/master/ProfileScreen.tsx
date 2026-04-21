import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '../../components/ui/GlassCard'
import { NeonButton } from '../../components/ui/NeonButton'
import { useAuthStore } from '../../store/authStore'
import { signOut } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import type { UserProfile } from '../../lib/supabase'

type Sheet = 'edit' | 'notifications' | 'privacy' | 'help' | null

export function MasterProfileScreen() {
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const [showQR, setShowQR] = useState(false)
  const [sheet, setSheet] = useState<Sheet>(null)

  const handleLogout = async () => {
    await signOut()
    logout()
  }

  const qrUrl = `https://lashartvisio.app/join/${profile?.id ?? 'demo'}`

  return (
    <div className="h-full overflow-y-auto scrollbar-hide px-4 pt-12 pb-6">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-3xl"
            style={{ background: 'rgba(201,169,110,0.15)', border: '2px solid rgba(201,169,110,0.4)', boxShadow: '0 0 20px rgba(201,169,110,0.2)' }}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              : '💅'}
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">{profile?.name}</h1>
            <p className="text-text-muted text-sm">{profile?.phone ?? profile?.id?.slice(0, 8)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-400 text-xs">Профиль активен</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Code block */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Мой QR-код</p>
        <GlassCard className="p-5">
          <p className="text-white text-sm mb-3">
            Клиенты сканируют QR и автоматически привязываются к тебе
          </p>
          {showQR ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-40 h-40 rounded-xl flex items-center justify-center" style={{ background: 'white', padding: '12px' }}>
                <div className="w-full h-full bg-obsidian rounded flex items-center justify-center">
                  <div className="text-4xl">📱</div>
                </div>
              </div>
              <p className="text-text-muted text-xs text-center break-all">{qrUrl}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(qrUrl)}
                  className="text-xs text-rose-gold border border-rose-gold/30 px-3 py-1.5 rounded-lg hover:bg-rose-gold/10 transition-colors"
                >
                  Скопировать ссылку
                </button>
                <NeonButton variant="secondary" onClick={() => setShowQR(false)}>Скрыть</NeonButton>
              </div>
            </div>
          ) : (
            <NeonButton variant="gradient" fullWidth onClick={() => setShowQR(true)}>
              Показать QR-код 📱
            </NeonButton>
          )}
        </GlassCard>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-4">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Настройки</p>
        <GlassCard className="divide-y divide-white/5">
          {[
            { icon: '👤', label: 'Редактировать профиль', color: '#C9A96E', action: () => setSheet('edit') },
            { icon: '🔔', label: 'Уведомления', color: '#9B5DE5', action: () => setSheet('notifications') },
            { icon: '🔒', label: 'Конфиденциальность', color: '#00D4FF', action: () => setSheet('privacy') },
            { icon: '❓', label: 'Помощь и поддержка', color: '#FF2D8A', action: () => setSheet('help') },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors"
            >
              <span className="text-lg" style={{ filter: `drop-shadow(0 0 4px ${item.color})` }}>{item.icon}</span>
              <span className="text-white text-sm">{item.label}</span>
              <span className="ml-auto text-text-muted">›</span>
            </button>
          ))}
        </GlassCard>
      </motion.div>

      {/* App version */}
      <p className="text-text-muted text-xs text-center mb-4">Lash Art Vision v2.0</p>

      {/* Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <NeonButton variant="ghost" fullWidth className="text-red-400 hover:text-red-300" onClick={handleLogout}>
          Выйти из аккаунта
        </NeonButton>
      </motion.div>

      {/* Sheets */}
      <AnimatePresence>
        {sheet && (
          <ProfileSheet type={sheet} onClose={() => setSheet(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ProfileSheet({ type, onClose }: { type: Sheet; onClose: () => void }) {
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
        className="w-full rounded-t-3xl flex flex-col max-h-[85%]"
        style={{ background: '#13132A', border: '1px solid rgba(201,169,110,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4 shrink-0" />
        <div className="overflow-y-auto scrollbar-hide px-5 pb-6">
          {type === 'edit' && <EditProfileContent onClose={onClose} />}
          {type === 'notifications' && <NotificationsContent />}
          {type === 'privacy' && <PrivacyContent />}
          {type === 'help' && <HelpContent />}
        </div>
      </motion.div>
    </motion.div>
  )
}

function EditProfileContent({ onClose }: { onClose: () => void }) {
  const profile = useAuthStore((s) => s.profile)
  const [name, setName] = useState(profile?.name ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarUrl(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!profile || !name.trim()) return
    setSaving(true)
    let uploadedUrl = profile.avatar_url
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `avatars/${profile.id}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!uploadErr) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        uploadedUrl = data.publicUrl
      }
    }
    const updated: UserProfile = { ...profile, name: name.trim(), avatar_url: uploadedUrl }
    await supabase.from('users').upsert(updated, { onConflict: 'id' })
    useAuthStore.getState().setProfile(updated)
    setSuccess(true)
    setSaving(false)
    setTimeout(onClose, 800)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display font-bold text-white">Редактировать профиль</h3>
      <div className="flex flex-col items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-rose-gold flex items-center justify-center bg-rose-gold/10 text-3xl">
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : '💅'}
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-cyber-pink rounded-full flex items-center justify-center text-xs">📷</div>
        </button>
        <p className="text-text-muted text-xs">Нажми для смены фото</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
      </div>
      <div>
        <label className="text-text-muted text-xs mb-1 block">Имя / Бренд</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-rose-gold/50 transition-colors"
        />
      </div>
      {success && <p className="text-green-400 text-sm text-center">✓ Сохранено!</p>}
      <NeonButton onClick={handleSave} disabled={!name.trim() || saving} fullWidth variant="gradient">
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </NeonButton>
    </div>
  )
}

function NotificationsContent() {
  const [push, setPush] = useState(true)
  const [reminders, setReminders] = useState(true)
  const [marketing, setMarketing] = useState(false)

  const requestPush = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPush(result === 'granted')
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display font-bold text-white">Уведомления</h3>
      <GlassCard className="divide-y divide-white/5">
        {[
          { label: 'Push-уведомления', desc: 'Новые записи и сообщения', value: push, onChange: (v: boolean) => { setPush(v); if (v) requestPush() } },
          { label: 'Напоминания о записях', desc: 'За 1 час до визита клиента', value: reminders, onChange: setReminders },
          { label: 'Новости и акции', desc: 'Обновления приложения', value: marketing, onChange: setMarketing },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1">
              <p className="text-white text-sm">{item.label}</p>
              <p className="text-text-muted text-xs">{item.desc}</p>
            </div>
            <button
              onClick={() => item.onChange(!item.value)}
              className={`w-11 h-6 rounded-full transition-colors relative ${item.value ? 'bg-rose-gold' : 'bg-white/10'}`}
            >
              <motion.div
                animate={{ x: item.value ? 22 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
              />
            </button>
          </div>
        ))}
      </GlassCard>
      <p className="text-text-muted text-xs text-center">Напоминания работают пока приложение открыто в браузере</p>
    </div>
  )
}

function PrivacyContent() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display font-bold text-white">Конфиденциальность</h3>
      <GlassCard className="p-4 space-y-3">
        <p className="text-white text-sm font-semibold">Твои данные</p>
        <p className="text-text-muted text-xs">
          Мы храним только необходимые данные: имя, email и фото профиля. Мы никогда не передаём данные третьим лицам.
        </p>
        <p className="text-white text-sm font-semibold mt-3">Данные клиентов</p>
        <p className="text-text-muted text-xs">
          Информация о клиентах хранится в зашифрованной базе данных. Только ты имеешь доступ к своим клиентам и записям.
        </p>
        <p className="text-white text-sm font-semibold mt-3">AI-анализы</p>
        <p className="text-text-muted text-xs">
          Фотографии для AI-анализа обрабатываются локально на устройстве. Снимки не отправляются на серверы без согласия.
        </p>
      </GlassCard>
      <GlassCard className="p-4 border border-red-500/20">
        <p className="text-white text-sm font-semibold mb-2">Удалить аккаунт</p>
        <p className="text-text-muted text-xs mb-3">
          Удаление аккаунта приведёт к безвозвратной потере всех данных, клиентов и записей.
        </p>
        <button className="text-red-400 text-xs hover:underline">Запросить удаление аккаунта</button>
      </GlassCard>
    </div>
  )
}

function HelpContent() {
  const faqs = [
    {
      q: 'Как клиенты находят меня?',
      a: 'Покажи клиенту свой QR-код из раздела «Мой QR-код» в профиле. После сканирования клиент автоматически привяжется к тебе.',
    },
    {
      q: 'Как добавить запись в календарь?',
      a: 'Перейди в раздел «Календарь», выбери нужную дату и нажми кнопку «+ Запись». Заполни имя клиента, услугу и время.',
    },
    {
      q: 'Как работает AI-анализ?',
      a: 'AI анализирует 478 точек лица через камеру. На основе формы глаз, расположения и пропорций подбирается подходящий эффект ресниц.',
    },
    {
      q: 'Могут ли клиенты видеть мои заметки?',
      a: 'Нет! Заметки в карточке клиента видишь только ты. Клиенты не имеют к ним доступа.',
    },
    {
      q: 'Как настроить напоминания?',
      a: 'В разделе «Уведомления» включи напоминания. Они придут за 1 час до визита клиента, пока приложение открыто.',
    },
  ]

  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-display font-bold text-white">Помощь и поддержка</h3>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <button key={i} className="w-full text-left" onClick={() => setOpen(open === i ? null : i)}>
            <GlassCard className="p-3">
              <div className="flex items-center gap-2">
                <p className="text-white text-sm flex-1">{faq.q}</p>
                <motion.span animate={{ rotate: open === i ? 90 : 0 }} className="text-text-muted shrink-0">›</motion.span>
              </div>
              <AnimatePresence>
                {open === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-text-muted text-xs mt-2 overflow-hidden"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </GlassCard>
          </button>
        ))}
      </div>
      <GlassCard className="p-4 text-center">
        <p className="text-white text-sm font-semibold mb-1">Нужна помощь?</p>
        <p className="text-text-muted text-xs mb-3">Напиши нам в Telegram — ответим быстро</p>
        <a
          href="https://t.me/lashartvisionsupport"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyber-pink text-sm font-semibold hover:underline"
        >
          @lashartvisionsupport
        </a>
      </GlassCard>
    </div>
  )
}
