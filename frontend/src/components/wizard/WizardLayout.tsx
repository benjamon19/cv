import type { ReactNode } from 'react'
import StepIndicator from './StepIndicator'

interface Props {
  step: number
  steps: string[]
  onBack?: () => void
  children: ReactNode
}

export default function WizardLayout({ step, steps, onBack, children }: Props) {
  const progress = Math.round(((step + 1) / steps.length) * 100)

  return (
    <div className="min-h-screen bg-white">

      {/* Full-width progress bar — Antigravity style, pinned to very top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-zinc-100 z-50">
        <div
          className="h-full bg-zinc-900 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top nav */}
      <header className="sticky top-[3px] z-40 flex items-center justify-between px-6 sm:px-10 h-14 bg-white/95 backdrop-blur-sm border-b border-zinc-100">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-zinc-900 tracking-tight">CV Inteligente</span>
        </div>

        {/* Step label (center) */}
        <p className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold text-zinc-400 hidden sm:block tabular-nums">
          Paso {step + 1} de {steps.length} — {steps[step]}
        </p>

        {/* Back to landing */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Salir
          </button>
        )}
      </header>

      {/* Page content */}
      <main className="py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Step indicator */}
          <div className="mb-8">
            <StepIndicator currentStep={step} steps={steps} />
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            {children}
          </div>

          {/* Privacy note */}
          <p className="mt-5 text-center text-xs text-zinc-400">
            Tus datos nunca se almacenan · Solo se usan para generar el documento
          </p>
        </div>
      </main>
    </div>
  )
}
