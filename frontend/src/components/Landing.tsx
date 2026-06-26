import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'

interface Props {
  onStart: () => void
}

// ─── Particle canvas (Antigravity-style coloured dashes) ─────────────────────

const PARTICLE_COLORS = [
  '#4285F4', '#EA4335', '#FBBC04', '#34A853',
  '#FF6D00', '#7C4DFF', '#00BCD4', '#E91E63',
]

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = Math.min(Math.floor(window.innerWidth / 10), 160)

    const particles = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2
      const dist = 80 + Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.55
      const cx = window.innerWidth / 2
      const cy = window.innerHeight * 0.42
      return {
        x: cx + Math.cos(angle) * dist * (0.5 + Math.random()),
        y: cy + Math.sin(angle) * dist * 0.6 * (0.5 + Math.random()),
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.25,
        len: 10 + Math.random() * 18,
        h: 2.5 + Math.random() * 2,
        rot: Math.random() * Math.PI * 2,
        drot: (Math.random() - 0.5) * 0.003,
        opacity: 0.55 + Math.random() * 0.45,
      }
    })

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const W = canvas.width
      const H = canvas.height
      particles.forEach(p => {
        p.x += p.dx
        p.y += p.dy
        p.rot += p.drot
        if (p.x > W + 30) p.x = -30
        if (p.x < -30) p.x = W + 30
        if (p.y > H + 30) p.y = -30
        if (p.y < -30) p.y = H + 30

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.len / 2, -p.h / 2, p.len, p.h)
        ctx.restore()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

// ─── CV Mockup card ───────────────────────────────────────────────────────────

function CVMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      <div className="rounded-2xl bg-[#111] overflow-hidden shadow-2xl">
        {/* top bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-[#1a1a1a] border-b border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          <span className="ml-3 text-xs text-white/30 font-mono">cv.pdf</span>
        </div>
        {/* body */}
        <div className="p-7 space-y-5">
          {/* header */}
          <div>
            <div className="h-5 bg-white/80 rounded w-3/5 mb-2" />
            <div className="flex gap-3">
              <div className="h-2.5 bg-indigo-400/60 rounded w-28" />
              <div className="h-2.5 bg-white/20 rounded w-20" />
              <div className="h-2.5 bg-white/20 rounded w-16" />
            </div>
          </div>
          <div className="h-px bg-white/10" />
          {/* experience */}
          <div>
            <div className="h-2 bg-indigo-400 rounded w-20 mb-3" />
            {[70, 55].map((w, i) => (
              <div key={i} className="mb-4 pl-3 border-l border-white/10">
                <div className="h-2.5 bg-white/70 rounded mb-1.5" style={{ width: `${w}%` }} />
                <div className="h-2 bg-white/30 rounded mb-2 w-2/5" />
                <div className="space-y-1">
                  {[90, 80, 65].slice(0, i + 2).map((lw, j) => (
                    <div key={j} className="h-1.5 bg-white/12 rounded" style={{ width: `${lw}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* skills */}
          <div>
            <div className="h-2 bg-indigo-400 rounded w-16 mb-3" />
            <div className="flex flex-wrap gap-1.5">
              {[32, 44, 28, 36, 52, 24].map((w, i) => (
                <div key={i} className="h-5 rounded-md bg-white/10 border border-white/10" style={{ width: `${w}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ATS Score mockup ─────────────────────────────────────────────────────────

function ATSMockup() {
  return (
    <div className="w-full max-w-sm rounded-2xl bg-[#0d0d0d] border border-white/8 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">ATS Score</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-semibold">Análisis en tiempo real</span>
        </div>
      </div>

      {/* Score ring */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#ffffff10" strokeWidth="7" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#4285F4" strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * 0.18}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-white leading-none">82</span>
            <span className="text-[9px] text-white/40 font-bold">/ 100</span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-white">Bueno</p>
          <p className="text-xs text-white/40 mt-1">3 mejoras posibles</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { label: 'Email y teléfono', ok: true },
          { label: 'Verbos de acción en logros', ok: true },
          { label: 'Mínimo 2 grupos de skills', ok: true },
          { label: 'Resumen sin clichés', ok: false },
          { label: 'LinkedIn incluido', ok: false },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
              {item.ok
                ? <div className="w-2 h-2 rounded-full bg-emerald-400" />
                : <div className="w-2 h-2 rounded-full bg-white/20" />
              }
            </div>
            <span className={`text-xs ${item.ok ? 'text-white/70' : 'text-white/30'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step flow mockup ─────────────────────────────────────────────────────────

function StepMockup() {
  const steps = [
    { n: '01', label: 'Datos Personales', done: true },
    { n: '02', label: 'Resumen', done: true },
    { n: '03', label: 'Experiencia & Educación', done: false, active: true },
    { n: '04', label: 'Habilidades', done: false },
    { n: '05', label: 'Plantilla & Formato', done: false },
  ]

  return (
    <div className="w-full max-w-sm rounded-2xl bg-[#0d0d0d] border border-white/8 overflow-hidden shadow-2xl">
      <div className="px-5 py-4 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Wizard</span>
        </div>
      </div>
      <div className="p-5 space-y-1">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={`flex items-center gap-3.5 px-3 py-3 rounded-xl transition-colors ${s.active ? 'bg-indigo-600/20 border border-indigo-500/30' : ''}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.done ? 'bg-emerald-500/20 text-emerald-400' : s.active ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/25'}`}>
              {s.done ? '✓' : s.n}
            </div>
            <span className={`text-sm font-medium ${s.active ? 'text-white' : s.done ? 'text-white/50' : 'text-white/25'}`}>
              {s.label}
            </span>
            {s.active && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Landing component ───────────────────────────────────────────────────

export default function Landing({ onStart }: Props) {
  return (
    <div className="bg-white text-zinc-900 overflow-x-hidden">

      {/* ── STICKY NAV ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 bg-white/85 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">CV Inteligente</span>
        </div>

        <button
          onClick={onStart}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-700 active:scale-95 transition-all duration-200"
        >
          <Download className="w-3 h-3" />
          Crear CV
        </button>
      </header>

      {/* ── HERO (viewport height) ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <ParticleCanvas />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="font-semibold text-base text-zinc-800 tracking-tight">CV Inteligente</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.65 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-bold text-zinc-900 leading-[1.04] tracking-tighter"
          >
            Crea el CV que
            <br />
            te consigue la
            <br />
            entrevista.
          </motion.h1>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.55 }}
            className="mt-10 flex items-center justify-center gap-3 flex-wrap"
          >
            <button
              onClick={onStart}
              className="group flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-700 active:scale-95 transition-all duration-200"
            >
              Crear mi CV gratis
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-zinc-400 hover:bg-zinc-50 active:scale-95 transition-all duration-200"
            >
              Ver cómo funciona
            </button>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <div className="w-5 h-8 rounded-full border-2 border-zinc-300 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-zinc-400"
            />
          </div>
        </motion.div>
      </section>

      {/* ── INTRO PARAGRAPH ── */}
      <section className="py-24 sm:py-32 px-8 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-3xl sm:text-4xl font-medium text-zinc-800 leading-snug tracking-tight"
          >
            CV Inteligente es tu generador de currículum profesional,
            pensado para que cualquier persona pueda crear un CV
            que pase los filtros ATS y llegue a las manos correctas.{' '}
            <span className="text-zinc-400">Sin registros, sin suscripciones.</span>
          </motion.p>
        </div>
      </section>

      {/* ── FEATURE 1: Wizard de 5 pasos ── */}
      <section className="py-20 px-8 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Paso a paso</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-tight mb-6">
              Wizard guiado
              <br />
              de 5 pasos.
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed mb-8">
              Desde tus datos personales hasta la plantilla final.
              Cada paso tiene autocompletado inteligente, sugerencias de verbos
              y validación en tiempo real.
            </p>
            <button
              onClick={onStart}
              className="group flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:gap-3 transition-all duration-200"
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <StepMockup />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE 2: ATS Score (reversed) ── */}
      <section className="py-20 px-8 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="order-2 lg:order-1 flex justify-center lg:justify-start"
          >
            <ATSMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Optimización ATS</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-tight mb-6">
              Puntuación ATS
              <br />
              en tiempo real.
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed mb-8">
              Detectamos clichés, verificamos verbos de acción en tus logros
              y calculamos una puntuación de compatibilidad con sistemas ATS
              mientras completas el formulario.
            </p>
            <button
              onClick={onStart}
              className="group flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:gap-3 transition-all duration-200"
            >
              Optimizar mi CV
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE 3: Output ── */}
      <section className="py-20 px-8 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Salida profesional</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-tight mb-6">
              4 plantillas.
              <br />
              PDF y PNG.
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed mb-8">
              Elige entre Classic, Engineering, SB2Nov y ModernCV — todas
              generadas con RenderCV para una tipografía y composición impecables.
              Descarga en PDF o imagen de alta resolución.
            </p>
            <button
              onClick={onStart}
              className="group flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:gap-3 transition-all duration-200"
            >
              Ver plantillas
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <CVMockup />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ROW ── */}
      <section className="py-20 px-8 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-zinc-100 rounded-2xl overflow-hidden">
            {[
              { value: '5', label: 'Pasos simples' },
              { value: '4', label: 'Plantillas premium' },
              { value: '< 10s', label: 'Generación de PDF' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`px-10 py-10 ${i < 2 ? 'border-b sm:border-b-0 sm:border-r border-zinc-100' : ''}`}
              >
                <p className="text-5xl font-bold text-zinc-900 mb-2">{stat.value}</p>
                <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section className="relative overflow-hidden bg-zinc-950 py-32 px-8">
        {/* dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight mb-8"
          >
            Tu próximo trabajo
            <br />
            empieza aquí.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.55 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <button
              onClick={onStart}
              className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-zinc-900 font-bold text-sm hover:bg-zinc-100 active:scale-95 transition-all duration-200"
            >
              Crear mi CV gratis
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </motion.div>
          <p className="mt-6 text-zinc-600 text-sm">
            Sin registro · Sin suscripción · Gratis para siempre
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-zinc-100 pt-16 pb-0 px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-16">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Producto</p>
              <ul className="space-y-2.5">
                {['Cómo funciona', 'Plantillas', 'ATS Score', 'Descargar'].map(l => (
                  <li key={l}>
                    <button onClick={onStart} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Formatos</p>
              <ul className="space-y-2.5">
                {['PDF', 'PNG', 'Classic', 'Engineering', 'ModernCV'].map(l => (
                  <li key={l}><span className="text-sm text-zinc-500">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Stack</p>
              <ul className="space-y-2.5">
                {['React + TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'FastAPI', 'RenderCV'].map(l => (
                  <li key={l}><span className="text-sm text-zinc-500">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Privacidad</p>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Tus datos nunca se almacenan. Todo el procesamiento ocurre en tu máquina.
              </p>
            </div>
          </div>
        </div>

        {/* Giant brand name — Antigravity style */}
        <div className="border-t border-zinc-100 overflow-hidden">
          <p
            className="font-extrabold text-zinc-900 leading-none select-none"
            style={{ fontSize: 'clamp(60px, 14vw, 200px)', letterSpacing: '-0.04em' }}
          >
            CV Inteligente
          </p>
        </div>
      </footer>

    </div>
  )
}
