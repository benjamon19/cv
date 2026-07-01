import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import StepIndicator from './StepIndicator'
import ThemeSelector from '../ThemeSelector'

interface Props {
  step: number
  steps: string[]
  children: ReactNode
  theme: 'light' | 'dark' | 'system'
  onChangeTheme: (theme: 'light' | 'dark' | 'system') => void
}

export default function WizardLayout({ step, steps, children, theme, onChangeTheme }: Props) {
  const progress = Math.round(((step + 1) / steps.length) * 100)
  const barRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.to(barRef.current, { width: `${progress}%`, duration: 0.6, ease: 'power2.out' })
  }, [progress])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-200">

      {/* Full-width progress bar — Antigravity style, pinned to very top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-zinc-100 dark:bg-zinc-900 z-50">
        <div
          ref={barRef}
          className="h-full bg-zinc-900 dark:bg-zinc-100"
          style={{ width: 0 }}
        />
      </div>

      {/* Top nav */}
      <header className="relative z-40 mt-[3px] flex items-center justify-between px-6 sm:px-10 h-14 bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-200">
        <div className="w-10 sm:w-16" /> {/* spacer to balance toggle */}
        
        {/* Step label */}
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums text-center">
          Paso {step + 1} de {steps.length} — {steps[step]}
        </p>

        {/* Theme Toggle Button */}
        <div className="flex justify-end w-10 sm:w-16">
          <ThemeSelector theme={theme} onChangeTheme={onChangeTheme} />
        </div>
      </header>

      {/* Page content */}
      <main className="py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Step indicator */}
          <div className="mb-8">
            <StepIndicator currentStep={step} steps={steps} />
          </div>

          {/* Main card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-850 shadow-sm overflow-hidden transition-colors duration-200">
            {children}
          </div>

          {/* Privacy note */}
          <p className="mt-5 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Tus datos nunca se almacenan · Solo se usan para generar el documento
          </p>
        </div>
      </main>
    </div>
  )
}
