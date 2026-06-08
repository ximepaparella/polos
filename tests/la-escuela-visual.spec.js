import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/la-escuela'
const LOCAL_URL = 'http://127.0.0.1:5190/la-escuela'
const SCREENSHOT_DIR = 'tests/screenshots/la-escuela'

async function getPageMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
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

    const h1 = isLocal
      ? document.querySelector('.escuela-hero__title')
      : document.querySelector('h1')

    const acercaTitle = isLocal
      ? document.querySelector('.escuela-acerca__title')
      : [...document.querySelectorAll('h3')].find((el) =>
          el.textContent?.includes('Acerca de la escuela')
        )

    const objetivoPanel = isLocal
      ? document.querySelector('.escuela-objetivo')
      : [...document.querySelectorAll('div')].find(
          (el) =>
            getComputedStyle(el).backgroundColor === 'rgb(242, 242, 242)' &&
            el.textContent?.includes('El objetivo de la EPFCL') &&
            el.getBoundingClientRect().height > 500
        )

    const colagePanel = isLocal
      ? document.querySelector('.escuela-colage')
      : [...document.querySelectorAll('div')].find(
          (el) =>
            getComputedStyle(el).backgroundColor === 'rgb(242, 242, 242)' &&
            el.textContent?.includes('COLAGE') &&
            el.getBoundingClientRect().height > 500
        )

    const ctaTitle = isLocal
      ? document.querySelector('.escuela-publicaciones-cta__title')
      : [...document.querySelectorAll('h2')].find((el) =>
          el.textContent?.includes('LEÉ NUESTRAS PUBLICACIONES')
        )

    return {
      h1: read(h1),
      acercaTitle: read(acercaTitle),
      objetivoPanel: read(objetivoPanel),
      colagePanel: read(colagePanel),
      ctaTitle: read(ctaTitle),
      imageCount: isLocal
        ? document.querySelectorAll('.escuela-objetivo__image, .escuela-colage__image').length
        : 0,
      responsableCount: isLocal
        ? document.querySelectorAll('.escuela-colage__person').length
        : 0,
      principiosHref: isLocal
        ? document.querySelector('.escuela-hero__cta')?.getAttribute('href')
        : null,
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-013 la-escuela — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.h1.fontSize).toBe('72px')
    expect(prod.acercaTitle.fontSize).toBe('32px')
    expect(prod.objetivoPanel.backgroundColor).toBe('rgb(242, 242, 242)')
    expect(prod.ctaTitle.color).toBe('rgb(255, 255, 255)')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.h1.fontSize).toBe('72px')
    expect(local.acercaTitle.fontSize).toBe('32px')
    expect(local.objetivoPanel.backgroundColor).toBe('rgb(242, 242, 242)')
    expect(local.colagePanel.backgroundColor).toBe('rgb(242, 242, 242)')
    expect(local.ctaTitle.fontSize).toBe('52px')
    expect(local.ctaTitle.color).toBe('rgb(255, 255, 255)')
    expect(local.imageCount).toBe(2)
    expect(local.responsableCount).toBe(4)
    expect(local.principiosHref).toContain('epPrincipes2022.pdf')
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.h1.fontSize).toBe('32px')
    expect(prod.acercaTitle.fontSize).toBe('22px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.h1.fontSize).toBe('32px')
    expect(local.acercaTitle.fontSize).toBe('22px')
  })

  test('captura hero desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })
      const hero = url === LOCAL_URL
        ? page.locator('.escuela-hero')
        : page.locator('h1').first()

      await hero.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)

      const box = await hero.evaluate((el) => {
        const target =
          el.classList?.contains('escuela-hero')
            ? el
            : el.closest('div')?.parentElement
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
