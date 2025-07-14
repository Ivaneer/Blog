// src/components/AsciiTrailDyna.tsx
import React, { useEffect, useRef } from 'react'

const density = ' .:-=+*#%@'

const MASS = 3
const DAMP = 0.85
const MAX_SPEED = 6
const RADIUS = 2
const DECAY = 0.85

const EXPLOSION_GROWTH = 0.8
const EXPLOSION_DECAY = 0.98
const EXPLOSION_WIDTH = 1.2

const cellW = 18
const cellH = 24

type Wave = {
  x: number
  y: number
  radius: number
  energy: number
}

const AsciiTrailDyna = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef<Float32Array>()
  const colsRef = useRef(0)
  const rowsRef = useRef(0)
  const aspectRef = useRef(1)
  const waves = useRef<Wave[]>([])

  const dyna = useRef({
    pos: { x: 0, y: 0 },
    pre: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cols = Math.floor(canvas.width / cellW)
    const rows = Math.floor(canvas.height / cellH)
    colsRef.current = cols
    rowsRef.current = rows
    aspectRef.current = canvas.width / canvas.height

    bufferRef.current = new Float32Array(cols * rows)

    const state = dyna.current
    state.pos = { x: cols / 2, y: rows / 2 }
    state.pre = { ...state.pos }

    let mouse = { x: state.pos.x, y: state.pos.y }
    let target = { ...mouse }
    let activated = false

    const onMouseMove = (e: MouseEvent) => {
      if (!activated) activated = true
      const rect = canvas.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width) * cols
      target.y = ((e.clientY - rect.top) / rect.height) * rows
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = ((e.clientX - rect.left) / rect.width) * cols
      const cy = ((e.clientY - rect.top) / rect.height) * rows
      waves.current.push({ x: cx, y: cy, radius: 0, energy: 1 })
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onClick)

    const draw = () => {
      if (!activated) {
        requestAnimationFrame(draw)
        return
      }

      // Movimiento del trail
      mouse.x += (target.x - mouse.x) * 0.5
      mouse.y += (target.y - mouse.y) * 0.5

      const force = {
        x: mouse.x - state.pos.x,
        y: mouse.y - state.pos.y,
      }

      const acc = {
        x: force.x / MASS,
        y: force.y / MASS,
      }

      state.vel.x = (state.vel.x + acc.x) * DAMP
      state.vel.y = (state.vel.y + acc.y) * DAMP

      const speed = Math.sqrt(state.vel.x ** 2 + state.vel.y ** 2)
      if (speed > MAX_SPEED) {
        const scale = MAX_SPEED / speed
        state.vel.x *= scale
        state.vel.y *= scale
      }

      state.pre = { ...state.pos }
      state.pos.x += state.vel.x
      state.pos.y += state.vel.y

      const points = getLine(state.pre, state.pos)
      const buffer = bufferRef.current!
      const aspect = aspectRef.current
      const cols = colsRef.current
      const rows = rowsRef.current

      // Trail básico
      for (const p of points) {
        const sx = Math.max(0, p.x - RADIUS)
        const ex = Math.min(cols, p.x + RADIUS)
        const sy = Math.floor(Math.max(0, p.y - RADIUS * aspect))
        const ey = Math.floor(Math.min(rows, p.y + RADIUS * aspect))

        for (let j = sy; j < ey; j++) {
          for (let i = sx; i < ex; i++) {
            const x = p.x - i
            const y = (p.y - j) / aspect
            const l = 1 - Math.sqrt(x * x + y * y) / RADIUS
            const idx = i + cols * j
            if (l > 0) buffer[idx] = Math.max(buffer[idx], l)
          }
        }
      }

      // Actualizar y aplicar ondas
      for (const wave of waves.current) {
        wave.radius += EXPLOSION_GROWTH
        wave.energy *= EXPLOSION_DECAY

        if (wave.energy < 0.01) continue

        const sx = Math.max(0, Math.floor(wave.x - wave.radius - EXPLOSION_WIDTH))
        const ex = Math.min(cols, Math.floor(wave.x + wave.radius + EXPLOSION_WIDTH))
        const sy = Math.max(0, Math.floor(wave.y - (wave.radius + EXPLOSION_WIDTH) * aspect))
        const ey = Math.min(rows, Math.floor(wave.y + (wave.radius + EXPLOSION_WIDTH) * aspect))

        for (let y = sy; y < ey; y++) {
          for (let x = sx; x < ex; x++) {
            const dx = x - wave.x
            const dy = (y - wave.y) / aspect
            const dist = Math.sqrt(dx * dx + dy * dy)
            const delta = Math.abs(dist - wave.radius)
            if (delta < EXPLOSION_WIDTH) {
              const idx = x + cols * y
              const intensity = (1 - delta / EXPLOSION_WIDTH) * wave.energy
              buffer[idx] = Math.max(buffer[idx], intensity)
            }
          }
        }
      }

      // Limpiar ondas muertas
      waves.current = waves.current.filter((w) => w.energy > 0.01)

      // Render del buffer
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${cellH - 6}px monospace`
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#05df72'

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = x + cols * y
          let v = buffer[idx]
          buffer[idx] *= DECAY
          if (v > 0.05) {
            v = Math.min(v, 0.9)
            const charIndex = Math.floor(v * (density.length - 1))
            const char = density[charIndex]
            ctx.fillText(char, x * cellW, y * cellH)
          }
        }
      }

      requestAnimationFrame(draw)
    }

    requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-0 bg-transparent"
    />
  )
}

function getLine(a: { x: number; y: number }, b: { x: number; y: number }) {
  let x0 = Math.floor(a.x)
  let y0 = Math.floor(a.y)
  const x1 = Math.floor(b.x)
  const y1 = Math.floor(b.y)
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy

  const points = []
  while (true) {
    points.push({ x: x0, y: y0 })
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
  return points
}

export default AsciiTrailDyna
