import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/sobre-el-foro'
const LOCAL_URL = 'http://127.0.0.1:5190/sobre-el-foro'
const SCREENSHOT_DIR = 'tests/screenshots/sobre-el-foro'

async function getPageMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
    const h1 = document.querySelector('h1')
    const introPanel = isLocal
      ? document.querySelector('.sobre-intro-panel')
      : [...document.querySelectorAll('div')].find(
          (el) =>
            getComputedStyle(el).backgroundColor === 'rgb(242, 242, 242)' &&
            el.textContent?.includes('espacio abierto al debate') &&
            el.getBoundingClientRect().height < 500
        )

    const miembrosTitle = isLocal
      ? document.querySelector('.miembros-section__title')
      : [...document.querySelectorAll('p')].find((el) => el.textContent?.trim() === 'Miembros')

    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        backgroundColor: s.backgroundColor,
        color: s.color,
      }
    }

    return {
      h1: read(h1),
      introPanel: read(introPanel),
      miembrosTitle: read(miembrosTitle),
      memberCount: isLocal ? document.querySelectorAll('#miembros-list li').length : 0,
      coordCount: isLocal ? document.querySelectorAll('.coordinacion__item').length : 0,
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-011 sobre-el-foro — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.h1.fontSize).toBe('72px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.h1.fontSize).toBe('72px')
    expect(local.introPanel.backgroundColor).toBe('rgb(242, 242, 242)')
    expect(local.memberCount).toBe(143)
    expect(local.coordCount).toBe(6)
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.h1.fontSize).toBe('32px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.h1.fontSize).toBe('32px')
  })

  test('captura hero desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })
      const hero = url === LOCAL_URL ? page.locator('.page-hero') : page.locator('h1').first()
      await hero.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
      const box = await (url === LOCAL_URL ? page.locator('.page-hero') : page.locator('h1').first()).evaluate((el) => {
        const target = el.classList?.contains('page-hero') ? el : el.closest('div')?.parentElement
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
