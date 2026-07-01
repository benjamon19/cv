// El backend (Render, plan free) se "duerme" tras inactividad y puede tardar
// ~50s o más en responder la primera request. Estas fases evitan que el
// usuario piense que la app está colgada durante ese cold-start.

export const WAKE_PHASE_MS = 8000
const MESSAGE_ROTATE_MS = 7000
// Constante de tiempo con la que la barra se acerca (asintóticamente) al máximo,
// sin llegar nunca al 100% hasta que la respuesta real llega.
const PROGRESS_APPROACH_MS = 45000
const MAX_PROGRESS_DURING_WAIT = 92

const INITIAL_MESSAGE = 'Generando tu CV...'

const WAKE_MESSAGES = [
  'El servidor está despertando, esto puede tardar hasta 1 minuto ⏳',
  'Compilando tu CV...',
  'Casi listo...',
  'El servidor estaba durmiendo, dale unos segundos más 🛌',
]

export interface LoadingState {
  message: string
  progress: number
}

export function getLoadingState(elapsedMs: number): LoadingState {
  if (elapsedMs < WAKE_PHASE_MS) {
    return {
      message: INITIAL_MESSAGE,
      progress: Math.min(15, (elapsedMs / WAKE_PHASE_MS) * 15),
    }
  }

  const wakeElapsed = elapsedMs - WAKE_PHASE_MS
  const index = Math.floor(wakeElapsed / MESSAGE_ROTATE_MS) % WAKE_MESSAGES.length
  const progress = 15 + (1 - Math.exp(-wakeElapsed / PROGRESS_APPROACH_MS)) * (MAX_PROGRESS_DURING_WAIT - 15)

  return {
    message: WAKE_MESSAGES[index],
    progress: Math.min(MAX_PROGRESS_DURING_WAIT, progress),
  }
}
