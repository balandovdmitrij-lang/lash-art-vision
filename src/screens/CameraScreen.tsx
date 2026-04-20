import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { NeonButton } from '../components/ui/NeonButton'
import { useAppStore } from '../store/appStore'

export function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [capturing, setCapturing] = useState(false)

  const setScreen = useAppStore((s) => s.setScreen)
  const setPhoto = useAppStore((s) => s.setPhoto)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const startCamera = async () => {
    setCameraError('')
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      if (videoRef.current) {
        const video = videoRef.current
        video.srcObject = stream
        video.onloadedmetadata = async () => {
          try {
            await video.play()
          } catch {
            // autoplay may be blocked, still show video
          }
          setCameraActive(true)
        }
      }
    } catch (e) {
      const msg =
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'Нет разрешения на камеру. Разреши доступ в настройках браузера.'
          : e instanceof DOMException && e.name === 'NotFoundError'
          ? 'Камера не найдена на устройстве.'
          : 'Камера недоступна. Используй загрузку из галереи.'
      setCameraError(msg)
    }
  }

  const capture = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !cameraActive) return

    setCapturing(true)
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    // Mirror selfie
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    stopCamera()
    setPhoto(dataUrl)
    setScreen('validation')
  }, [cameraActive, setPhoto, setScreen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const url = ev.target?.result as string
      stopCamera()
      setPhoto(url)
      setScreen('validation')
    }
    reader.onerror = () => setCameraError('Ошибка чтения файла. Попробуй ещё раз.')
    reader.readAsDataURL(file)
  }

  return (
    <div className="h-full flex flex-col bg-obsidian relative">
      {/* Camera preview */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)', display: cameraActive ? 'block' : 'none' }}
        />

        {!cameraActive && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 rounded-full border-2 border-transparent border-t-cyber-pink border-r-rose-gold"
            />
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 gap-4">
            <span className="text-4xl">📷</span>
            <p className="text-text-muted text-sm text-center">{cameraError}</p>
            <NeonButton variant="secondary" onClick={startCamera}>
              Попробовать снова
            </NeonButton>
          </div>
        )}

        {/* Face guide overlay */}
        {cameraActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="border-2 border-cyber-pink/50 rounded-full"
              style={{ width: '65%', height: '80%' }}
            >
              {/* Corner accents */}
              {[
                'top-0 left-0 border-t-2 border-l-2 rounded-tl-2xl',
                'top-0 right-0 border-t-2 border-r-2 rounded-tr-2xl',
                'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-2xl',
                'bottom-0 right-0 border-b-2 border-r-2 rounded-br-2xl',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-cyber-pink ${cls}`} />
              ))}
            </div>
            <p className="absolute bottom-[12%] text-xs text-white/70 tracking-wide">
              Центрируй лицо в рамке
            </p>
          </div>
        )}

        {/* Scanning animation */}
        {cameraActive && (
          <motion.div
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 right-0 h-0.5 pointer-events-none opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, #E91E8C 50%, transparent)',
              boxShadow: '0 0 12px 2px rgba(233, 30, 140, 0.5)',
            }}
          />
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center p-4">
          <button
            onClick={() => { stopCamera(); setScreen('prepare') }}
            className="w-9 h-9 glass rounded-full flex items-center justify-center text-white"
          >
            ←
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="glass border-t border-white/5 px-6 py-5 flex items-center justify-between gap-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Gallery button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="w-14 h-14 glass rounded-2xl flex items-center justify-center text-2xl border border-white/10"
        >
          🖼
        </button>

        {/* Capture button */}
        <motion.button
          onClick={capture}
          disabled={!cameraActive || capturing}
          whileTap={{ scale: 0.92 }}
          className="w-20 h-20 rounded-full border-4 border-cyber-pink flex items-center justify-center disabled:opacity-40 shadow-neon"
        >
          <div className="w-14 h-14 rounded-full bg-cyber-pink" />
        </motion.button>

        {/* Flip placeholder (for symmetry) */}
        <div className="w-14 h-14" />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
