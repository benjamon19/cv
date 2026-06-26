interface Props {
  onPrev?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
}

export default function NavigationButtons({
  onPrev,
  onNext,
  nextLabel = 'Siguiente',
  nextDisabled = false,
}: Props) {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-t border-zinc-100 mt-2">
      <button
        onClick={onPrev}
        disabled={!onPrev}
        className="
          inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
          text-zinc-600 bg-zinc-100 hover:bg-zinc-200
          disabled:opacity-0 disabled:pointer-events-none
          active:scale-95 transition-all duration-200
        "
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Atrás
      </button>

      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="
            inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold
            text-white bg-zinc-900 hover:bg-zinc-700 active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
            transition-all duration-200
          "
        >
          {nextLabel}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  )
}
