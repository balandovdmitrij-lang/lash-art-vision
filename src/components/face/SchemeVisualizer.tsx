import { useEffect, useRef } from 'react'

interface Props {
  zones: { zone: number; length: number }[]
  curl: string
}

export function SchemeVisualizer({ zones, curl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height

    ctx.clearRect(0, 0, W, H)

    // Draw fan scheme
    const centerX = W / 2
    const centerY = H - 10
    const maxLen = Math.max(...zones.map((z) => z.length))

    const totalZones = zones.length
    const fanAngle = Math.PI * 0.7
    const startAngle = Math.PI + Math.PI * 0.15

    zones.forEach((z, i) => {
      const t = totalZones === 1 ? 0.5 : i / (totalZones - 1)
      const angle = startAngle + fanAngle * t
      const len = (z.length / maxLen) * (H - 30)

      const curlFactor = curl === 'D' ? 0.35 : curl === 'C' ? 0.25 : 0.15

      // Draw lash as bezier curve
      const endX = centerX + Math.cos(angle) * len
      const endY = centerY + Math.sin(angle) * len
      const ctrlX = centerX + Math.cos(angle - curlFactor) * len * 0.6
      const ctrlY = centerY + Math.sin(angle - curlFactor) * len * 0.6

      const alpha = 0.5 + 0.5 * (1 - Math.abs(t - 0.5) * 2)
      ctx.strokeStyle = `rgba(233, 30, 140, ${alpha})`
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY)
      ctx.stroke()

      // Zone label
      ctx.fillStyle = '#9E9E9E'
      ctx.font = '9px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(`${z.length}`, endX, endY - 4)
    })

    // Lash line base
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, 8, Math.PI, 0)
    ctx.stroke()
  }, [zones, curl])

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={120}
      className="w-full"
      style={{ maxHeight: 120 }}
    />
  )
}
