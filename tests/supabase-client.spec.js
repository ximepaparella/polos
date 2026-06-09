import { test, expect } from '@playwright/test'
import {
  formatFecha,
  getPublicaciones,
  getPublicacionBySlug,
  getPublicacionesAdyacentes,
  getEventos,
  supabase,
} from '../src/js/supabase-client.js'

test.describe('SPEC-004 supabase-client', () => {
  test('formatFecha formatea fechas ISO en español', () => {
    const formatted = formatFecha('2026-01-21')
    expect(formatted).toMatch(/21/)
    expect(formatted).toMatch(/2026/)
    expect(formatted.toLowerCase()).toMatch(/ene/)
  })

  test('exporta cliente y helpers', () => {
    expect(typeof getPublicaciones).toBe('function')
    expect(typeof getPublicacionBySlug).toBe('function')
    expect(typeof getPublicacionesAdyacentes).toBe('function')
    expect(typeof getEventos).toBe('function')
    expect(typeof formatFecha).toBe('function')
    expect(supabase === null || typeof supabase.from === 'function').toBe(true)
  })

  test('helpers devuelven valores seguros sin variables de entorno', async () => {
    await expect(getPublicaciones()).resolves.toEqual([])
    await expect(getPublicacionBySlug('test')).resolves.toBeNull()
    await expect(getPublicacionesAdyacentes('test', '2026-01-01')).resolves.toEqual({
      prev: null,
      next: null,
    })
    await expect(getEventos()).resolves.toEqual([])
  })
})
