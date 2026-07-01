// Validación de formulario en el frontend. Es un complemento a la validación
// de Pydantic que ya existe en el backend (EmailStr y regex de teléfono):
// no la reemplaza, solo da feedback inmediato al usuario antes del round-trip.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/
const DOMAIN_SHAPE_REGEX = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i
const PROFILE_FIELD_REGEX = /^\w[\w.~:/?#[\]@!$&'()*+,;=%-]*$/
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

export function validateRequired(value: string, label: string): string | null {
  return value.trim() ? null : `${label} es obligatorio.`
}

export function validateEmail(value: string): string | null {
  const v = value.trim()
  if (!v) return 'El email es obligatorio.'
  if (!EMAIL_REGEX.test(v)) return 'Ingresa un email válido, ej: nombre@dominio.com'
  return null
}

export function validatePhone(value: string): string | null {
  const v = value.trim()
  if (!v) return 'El teléfono es obligatorio.'
  if (!v.startsWith('+')) {
    return 'El número de teléfono no es válido. Debe incluir el código de país, por ejemplo: +56 9 1234 5678'
  }
  const digits = v.replace(/\D/g, '')
  if (digits.length < 7) return 'El teléfono debe tener al menos 7 dígitos.'
  if (!PHONE_REGEX.test(v)) return 'Formato inválido. Usa solo dígitos y +, -, (, ).'
  return null
}

export function validateUrl(value: string, label: string): string | null {
  const v = value.trim()
  if (!v) return null // campo opcional
  if (!PROFILE_FIELD_REGEX.test(v)) {
    return `${label} no tiene un formato válido. Ingresá una URL sin espacios ni caracteres especiales.`
  }
  if (!DOMAIN_SHAPE_REGEX.test(v)) {
    return `${label} no parece una URL válida.`
  }
  return null
}

export function validateProfileField(value: string, label: string): string | null {
  const v = value.trim()
  if (!v) return null // campo opcional
  if (!PROFILE_FIELD_REGEX.test(v)) {
    return `${label} no tiene un formato válido. Ingresá una URL o nombre de usuario sin espacios ni caracteres especiales.`
  }
  return null
}

export function validateSummary(value: string, minLength = 40, maxLength = 600): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'El resumen es obligatorio.'
  if (trimmed.length < minLength) return `Escribe al menos ${minLength} caracteres para un resumen efectivo.`
  if (value.length > maxLength) return `El resumen no puede superar los ${maxLength} caracteres.`
  return null
}

export function isValidDateFormat(value: string): boolean {
  return DATE_REGEX.test(value.trim())
}

function toComparable(value: string): number {
  return Number(value.trim().replace('-', ''))
}

function currentMonthComparable(): number {
  const now = new Date()
  return now.getFullYear() * 100 + (now.getMonth() + 1)
}

export interface DateRangeErrors {
  startDate: string | null
  endDate: string | null
}

/** Fechas de experiencia laboral: inicio obligatorio, fin obligatorio salvo "actual", sin fechas futuras. */
export function validateExperienceDates(startDate: string, endDate: string, current: boolean): DateRangeErrors {
  const nowKey = currentMonthComparable()
  const start = startDate.trim()
  const end = endDate.trim()

  let startError: string | null = null
  if (!start) {
    startError = 'La fecha de inicio es obligatoria.'
  } else if (!isValidDateFormat(start)) {
    startError = 'Formato inválido. Usa AAAA-MM.'
  } else if (toComparable(start) > nowKey) {
    startError = 'La fecha de inicio no puede ser futura.'
  }

  let endError: string | null = null
  if (!current) {
    if (!end) {
      endError = 'La fecha de fin es obligatoria (o marca "Posición actual").'
    } else if (!isValidDateFormat(end)) {
      endError = 'Formato inválido. Usa AAAA-MM.'
    } else if (toComparable(end) > nowKey) {
      endError = 'La fecha de fin no puede ser futura.'
    } else if (!startError && isValidDateFormat(start) && toComparable(start) > toComparable(end)) {
      endError = 'La fecha de fin debe ser posterior a la de inicio.'
    }
  }

  return { startDate: startError, endDate: endError }
}

/** Fechas de educación: inicio obligatorio, fin opcional (estudios en curso), pero coherente si está presente. */
export function validateEducationDates(startDate: string, endDate: string): DateRangeErrors {
  const start = startDate.trim()
  const end = endDate.trim()

  let startError: string | null = null
  if (!start) {
    startError = 'La fecha de inicio es obligatoria.'
  } else if (!isValidDateFormat(start)) {
    startError = 'Formato inválido. Usa AAAA-MM.'
  }

  let endError: string | null = null
  if (end) {
    if (!isValidDateFormat(end)) {
      endError = 'Formato inválido. Usa AAAA-MM.'
    } else if (!startError && isValidDateFormat(start) && toComparable(start) > toComparable(end)) {
      endError = 'La fecha de fin debe ser posterior a la de inicio.'
    }
  }

  return { startDate: startError, endDate: endError }
}
