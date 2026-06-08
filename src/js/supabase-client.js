import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase')
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// ─── PUBLICACIONES ───────────────────────────────────────────

/**
 * Trae todas las publicaciones activas, ordenadas por fecha DESC
 * @param {number|null} limit - cantidad máxima, default todas
 */
export async function getPublicaciones(limit = null) {
  if (!supabase) {
    return []
  }

  let query = supabase
    .from('publicaciones')
    .select('id, slug, titulo, subtitulo, descripcion, fecha, imagen_url, tags, issn')
    .eq('activo', true)
    .order('fecha', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching publicaciones:', error)
    return []
  }

  return data
}

/**
 * Trae una publicación por su slug
 * @param {string} slug
 */
export async function getPublicacionBySlug(slug) {
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase
    .from('publicaciones')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (error) {
    console.error('Error fetching publicacion:', error)
    return null
  }

  return data
}

/**
 * Trae la publicación anterior y siguiente (para nav prev/next)
 * @param {string} currentSlug
 * @param {string} currentFecha
 */
export async function getPublicacionesAdyacentes(currentSlug, currentFecha) {
  if (!supabase) {
    return { prev: null, next: null }
  }

  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase
      .from('publicaciones')
      .select('slug, titulo')
      .eq('activo', true)
      .lt('fecha', currentFecha)
      .order('fecha', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('publicaciones')
      .select('slug, titulo')
      .eq('activo', true)
      .gt('fecha', currentFecha)
      .order('fecha', { ascending: true })
      .limit(1)
      .single(),
  ])

  return { prev: prev || null, next: next || null }
}

// ─── EVENTOS ─────────────────────────────────────────────────

/**
 * Trae todos los eventos activos, ordenados por fecha_inicio ASC
 */
export async function getEventos() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('activo', true)
    .order('fecha_inicio', { ascending: true })

  if (error) {
    console.error('Error fetching eventos:', error)
    return []
  }

  return data
}

// ─── SUSCRIPTORES ─────────────────────────────────────────────

/**
 * Registra un suscriptor nuevo
 * @param {string} nombre
 * @param {string} email
 */
export async function suscribir(nombre, email) {
  if (!supabase) {
    return { ok: false, message: 'Error al registrar. Intentá nuevamente.' }
  }

  const { data, error } = await supabase
    .from('suscriptores')
    .insert([{ nombre: nombre.trim(), email: email.trim().toLowerCase() }])
    .select()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, message: 'Este email ya está registrado.' }
    }

    console.error('Error suscribiendo:', error)
    return { ok: false, message: 'Error al registrar. Intentá nuevamente.' }
  }

  return { ok: true, message: '¡Te suscribiste correctamente!' }
}

// ─── UTILIDADES ───────────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato legible en español
 * @param {string} dateString - "2026-01-21"
 * @returns {string} "21 ene 2026"
 */
export function formatFecha(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
