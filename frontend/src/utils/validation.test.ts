import { describe, it, expect } from 'vitest'
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateUrl,
  validateProfileField,
  validateSummary,
  validateExperienceDates,
  validateEducationDates
} from './validation'

describe('Frontend Form Validation Suite', () => {
  describe('validateRequired', () => {
    it('should validate non-empty strings', () => {
      expect(validateRequired('Juan Pérez', 'Nombre')).toBeNull()
      expect(validateRequired('   ', 'Nombre')).toBe('Nombre es obligatorio.')
      expect(validateRequired('', 'Nombre')).toBe('Nombre es obligatorio.')
    })
  })

  describe('validateEmail', () => {
    it('should allow valid emails including tags and subdomains', () => {
      expect(validateEmail('juan.perez@example.com')).toBeNull()
      expect(validateEmail('juan+test@sub.example.com')).toBeNull()
      expect(validateEmail('juan@domain.co.uk')).toBeNull()
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('juan.perez')).not.toBeNull()
      expect(validateEmail('juan@')).not.toBeNull()
      expect(validateEmail('   ')).toBe('El email es obligatorio.')
    })
  })

  describe('validatePhone', () => {
    it('should reject Chilean and other phone numbers without leading + country code', () => {
      expect(validatePhone('961234567')).toContain('Debe incluir el código de país')
      expect(validatePhone('223456789')).toContain('Debe incluir el código de país')
    })

    it('should accept valid international phone numbers starting with +', () => {
      expect(validatePhone('+56 9 1234 5678')).toBeNull()
      expect(validatePhone('+1-555-123-4567')).toBeNull()
      expect(validatePhone('+56912345678')).toBeNull()
    })

    it('should reject too short or invalid character formats', () => {
      expect(validatePhone('+56')).toContain('al menos 7 dígitos')
      expect(validatePhone('+56 9 abc 12345')).toContain('Formato inválido')
    })
  })

  describe('validateProfileField (for LinkedIn and GitHub)', () => {
    it('should accept raw usernames', () => {
      expect(validateProfileField('juanperez', 'LinkedIn')).toBeNull()
      expect(validateProfileField('juan-perez_123', 'LinkedIn')).toBeNull()
    })

    it('should accept typical profile URLs', () => {
      expect(validateProfileField('linkedin.com/in/juanperez', 'LinkedIn')).toBeNull()
      expect(validateProfileField('https://github.com/juanperez', 'GitHub')).toBeNull()
      expect(validateProfileField('github.com/juanperez?tab=repositories', 'GitHub')).toBeNull()
    })

    it('should reject usernames/URLs with spaces or special control characters', () => {
      expect(validateProfileField('juan perez', 'LinkedIn')).not.toBeNull()
      expect(validateProfileField('juan\x00perez', 'LinkedIn')).not.toBeNull()
    })

    it('should return null for optional empty values', () => {
      expect(validateProfileField('', 'LinkedIn')).toBeNull()
      expect(validateProfileField('   ', 'LinkedIn')).toBeNull()
    })
  })

  describe('validateUrl (for Website)', () => {
    it('should accept valid domains with and without scheme', () => {
      expect(validateUrl('mywebsite.com', 'Website')).toBeNull()
      expect(validateUrl('https://mywebsite.com', 'Website')).toBeNull()
      expect(validateUrl('http://sub.domain.co.uk/path?q=1', 'Website')).toBeNull()
    })

    it('should reject websites with invalid characters or shape', () => {
      expect(validateUrl('not-a-website', 'Website')).not.toBeNull()
      expect(validateUrl('http://mywebsite', 'Website')).not.toBeNull()
      expect(validateUrl('mywebsite.com\x00', 'Website')).not.toBeNull()
    })

    it('should return null for optional empty values', () => {
      expect(validateUrl('', 'Website')).toBeNull()
    })
  })

  describe('validateSummary', () => {
    it('should validate character limits', () => {
      const shortSummary = 'Demasiado corto.'
      const longSummary = 'A'.repeat(601)
      const validSummary = 'Esta es una descripción válida y con la longitud mínima necesaria para el CV.'

      expect(validateSummary(shortSummary)).toContain('Escribe al menos')
      expect(validateSummary(longSummary)).toContain('no puede superar')
      expect(validateSummary(validSummary)).toBeNull()
    })
  })

  describe('Date Ranges', () => {
    it('should validate experience dates and ensure end date is not before start date', () => {
      const result1 = validateExperienceDates('2022-01', '2021-12', false)
      expect(result1.endDate).toContain('debe ser posterior a la de inicio')

      const result2 = validateExperienceDates('2022-01', '', true)
      expect(result2.startDate).toBeNull()
      expect(result2.endDate).toBeNull()
    })

    it('should validate education dates', () => {
      const result1 = validateEducationDates('2020-03', '2024-12')
      expect(result1.startDate).toBeNull()
      expect(result1.endDate).toBeNull()

      const result2 = validateEducationDates('2022-03', '2021-12')
      expect(result2.endDate).toContain('debe ser posterior a la de inicio')
    })
  })
})
