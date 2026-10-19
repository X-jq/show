import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  phase: number
  speed: number
  layer: number
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

/** 全站星空背景：星星闪烁 + 流星 + 滚动视差，支持降级 */
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let stars: Star[] = []
    let meteors: Meteor[] = []
    let nextMeteor = 0

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#E6EAF2'
      for (const s of stars) {
        ctx.globalAlpha = s.baseAlpha
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // 粒子数：移动端 ≤ 80，桌面 ≤ 200
      const count = Math.min(w < 768 ? 80 : 200, Math.floor((w * h) / 9000))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3,
        layer: Math.random() * 0.8 + 0.2,
      }))
      meteors = []
      nextMeteor = performance.now() + 8000 + Math.random() * 7000
      if (reduced) drawStatic()
    }

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      const scrollY = window.scrollY

      // 星星：呼吸闪烁 + 按层级视差
      ctx.fillStyle = '#E6EAF2'
      for (const s of stars) {
        const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(t * 0.001 * s.speed + s.phase))
        const y = (((s.y - scrollY * 0.1 * s.layer) % h) + h) % h
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.beginPath()
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // 流星：每 8-15 秒一颗
      if (t >= nextMeteor) {
        nextMeteor = t + 8000 + Math.random() * 7000
        meteors.push({
          x: Math.random() * w * 0.7 + w * 0.15,
          y: -20,
          vx: -(2.4 + Math.random() * 1.6),
          vy: 2.4 + Math.random() * 1.6,
          life: 0,
          maxLife: 90,
        })
      }
      meteors = meteors.filter((m) => m.life < m.maxLife)
      for (const m of meteors) {
        m.x += m.vx
        m.y += m.vy
        m.life++
        const fade = 1 - m.life / m.maxLife
        const tail = 12
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * tail, m.y - m.vy * tail)
        grad.addColorStop(0, `rgba(230, 234, 242, ${0.9 * fade})`)
        grad.addColorStop(1, 'rgba(230, 234, 242, 0)')
        ctx.globalAlpha = 1
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(m.x, m.y)
        ctx.lineTo(m.x - m.vx * tail, m.y - m.vy * tail)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)

    // prefers-reduced-motion：静态星空，不启动动画循环
    if (reduced) {
      return () => window.removeEventListener('resize', resize)
    }

    raf = requestAnimationFrame(tick)
    // 页面不可见时暂停渲染
    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(tick)
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}
