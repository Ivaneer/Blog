import React, { useEffect, useRef } from 'react'

const density = ' .:-=+*#%@'

const MASS = 3
const DAMP = 0.85
const MAX_SPEED = 6
const RADIUS = 2
const DECAY = 0.85

const cellW = 18
const cellH = 24

const AsciiTrailDyna = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef<Float32Array>()
  const colsRef = useRef(0)
  const rowsRef = useRef(0)
  const aspectRef = useRef(1)

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

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      target.x = ((e.clientX - rect.left) / rect.width) * cols
      target.y = ((e.clientY - rect.top) / rect.height) * rows
    }

    window.addEventListener('mousemove', onMouseMove)

    const draw = () => {
      // Suavizar movimiento del cursor
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

      // Limitar la velocidad máxima
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
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundColor: 'transparent',
      }}
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
    let e2 = 2 * err
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
