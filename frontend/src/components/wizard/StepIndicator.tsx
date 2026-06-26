interface Props {
  currentStep: number
  steps: string[]
}

export default function StepIndicator({ currentStep, steps }: Props) {
  return (
    <nav aria-label="Progreso" className="flex items-center justify-between">
      {steps.map((label, i) => {
        const completed = i < currentStep
        const active = i === currentStep

        return (
          <div key={label} className="flex-1 flex items-center">
            {/* Connector line before (except first) */}
            {i > 0 && (
              <div
                className={`flex-1 h-px transition-colors duration-400 ${
                  completed ? 'bg-zinc-900' : 'bg-zinc-200'
                }`}
              />
            )}

            {/* Dot + label */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div
                className={`
                  transition-all duration-300 flex items-center justify-center
                  ${active
                    ? 'w-7 h-7 rounded-full bg-zinc-900 text-white text-xs font-bold ring-4 ring-zinc-900/10'
                    : completed
                    ? 'w-5 h-5 rounded-full bg-zinc-900 text-white'
                    : 'w-5 h-5 rounded-full bg-zinc-200'
                  }
                `}
              >
                {completed ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : active ? (
                  <span>{i + 1}</span>
                ) : null}
              </div>

              <span
                className={`
                  text-[10px] font-medium text-center leading-tight max-w-[68px] transition-colors duration-300
                  ${active ? 'text-zinc-900 font-semibold' : completed ? 'text-zinc-500' : 'text-zinc-300'}
                `}
              >
                {label}
              </span>
            </div>

            {/* Connector line after (except last) */}
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px transition-colors duration-400 ${
                  completed ? 'bg-zinc-900' : 'bg-zinc-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
