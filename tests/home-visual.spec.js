import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/'
const LOCAL_URL = 'http://127.0.0.1:5190/'
const SCREENSHOT_DIR = 'tests/screenshots/home'

async function getHomeMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
    const hero = isLocal
      ? document.querySelector('.hero')
      : [...document.querySelectorAll('div')].find((el) => {
          const h1 = el.querySelector('h1')
          return h1?.textContent?.includes('Bienvenido al Foro') && el.getBoundingClientRect().height > 600
        })

    const h1 = document.querySelector('h1')
    const pubCta = isLocal
      ? document.querySelector('.publicaciones-cta')
      : [...document.querySelectorAll('div')].find(
          (el) =>
            getComputedStyle(el).backgroundColor === 'rgb(238, 238, 238)' &&
            el.getBoundingClientRect().height > 400
        )

    const blogTitle = isLocal
      ? document.querySelector('.ultimas-publicaciones__title')
      : [...document.querySelectorAll('p,h2')].find(
          (el) => el.textContent?.trim() === 'Últimas publicaciones'
        )

    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        backgroundColor: s.backgroundColor,
        minHeight: s.minHeight,
        height: Math.round(el.getBoundingClientRect().height),
      }
    }

    return {
      hero: read(hero),
      h1: read(h1),
      pubCta: read(pubCta),
      blogTitle: read(blogTitle),
      cardCount: isLocal ? document.querySelectorAll('.card-publicacion').length : 0,
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-010 home — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getHomeMetrics(page, false)
    expect(prod.h1.fontSize).toBe('72px')
    expect(prod.h1.color).toBe('rgb(254, 255, 255)')
    expect(prod.pubCta.backgroundColor).toBe('rgb(238, 238, 238)')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getHomeMetrics(page, true)
    expect(local.h1.fontSize).toBe('72px')
    expect(local.h1.color).toBe('rgb(254, 255, 255)')
    expect(local.pubCta.backgroundColor).toBe('rgb(238, 238, 238)')
    expect(local.cardCount).toBeGreaterThanOrEqual(2)
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getHomeMetrics(page, false)
    expect(prod.h1.fontSize).toBe('32px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getHomeMetrics(page, true)
    expect(local.h1.fontSize).toBe('32px')
  })

  test('captura secciones desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })
      const hero = url === LOCAL_URL
        ? page.locator('.hero')
        : page.locator('h1').first()
      await hero.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
      const box = await (url === LOCAL_URL ? page.locator('.hero') : page.locator('h1').first()).evaluate((el) => {
        const target = el.classList?.contains('hero') ? el : el.closest('div')?.parentElement
        const r = (target || el).getBoundingClientRect()
        return { y: Math.max(0, r.top + window.scrollY - 74), h: Math.min(r.height + 20, 720) }
      })
      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${prefix}-hero-desktop.png`),
        clip: { x: 0, y: box.y, width: 1440, height: box.h },
      })
    }
  })
})
