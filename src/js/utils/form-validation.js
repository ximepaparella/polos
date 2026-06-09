const HTML_TAG_PATTERN = /<[^>]*>/g
const NOMBRE_PATTERN = /^[\p{L}\p{M}\s'.-]+$/u
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LIMITS = {
  nombreMin: 2,
  nombreMax: 100,
  emailMax: 254,
}

/**
 * @param {string} honeypotValue
 * @returns {boolean}
 */
export function isHoneypotTriggered(honeypotValue) {
  return Boolean(honeypotValue?.trim())
}

/**
 * @param {string} nombre
 * @param {string} email
 * @returns {{ ok: true, nombre: string, email: string } | { ok: false, message: string }}
 */
export function validateSuscripcionForm(nombre, email) {
  const trimmedNombre = nombre.trim().replace(HTML_TAG_PATTERN, '')
  const trimmedEmail = email.trim().toLowerCase()

  if (trimmedNombre.length < LIMITS.nombreMin || trimmedNombre.length > LIMITS.nombreMax) {
    return { ok: false, message: 'Ingresá un nombre válido (2 a 100 caracteres).' }
  }

  if (!NOMBRE_PATTERN.test(trimmedNombre)) {
    return { ok: false, message: 'El nombre contiene caracteres no permitidos.' }
  }

  if (!trimmedEmail || trimmedEmail.length > LIMITS.emailMax) {
    return { ok: false, message: 'Ingresá un email válido.' }
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return { ok: false, message: 'Ingresá un email válido.' }
  }

  return { ok: true, nombre: trimmedNombre, email: trimmedEmail }
}
