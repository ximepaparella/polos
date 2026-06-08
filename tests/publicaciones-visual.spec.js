import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/publicaciones-facl'
const LOCAL_URL = 'http://127.0.0.1:5190/publicaciones-facl'
const SCREENSHOT_DIR = 'tests/screenshots/publicaciones'

async function getPageMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        textAlign: s.textAlign,
        backgroundImage: s.backgroundImage,
        backgroundColor: s.backgroundColor,
      }
    }

    const h1 = isLocal
      ? document.querySelector('.pub-hero__title')
      : document.querySelector('h1')

    const introTitle = isLocal
      ? document.querySelector('.pub-intro__title')
      : [...document.querySelectorAll('p')].find((el) =>
          el.textContent?.includes('Explora nuestras publicaciones destacadas')
        )

    const cardTitle = isLocal
      ? document.querySelector('.card-publicacion__title')
      : [...document.querySelectorAll('h4')].find((el) => el.textContent?.trim() === 'WITZ')

    const hero = isLocal ? document.querySelector('.pub-hero') : null
    const destacadas = isLocal ? document.querySelector('.pub-destacadas') : null
    const grid = isLocal ? document.querySelector('.publicaciones-grid') : null

    return {
      h1: read(h1),
      introTitle: read(introTitle),
      cardTitle: read(cardTitle),
      heroHasGradient: hero ? hero.style.backgroundImage !== '' || read(hero).backgroundImage.includes('gradient') : false,
      destacadasBg: destacadas ? read(destacadas).backgroundColor : null,
      gridDirection: grid ? getComputedStyle(grid).flexDirection : null,
      hasSearch: isLocal ? Boolean(document.querySelector('.pub-destacadas__search')) : false,
      introTitleTag: isLocal ? introTitle?.tagName : null,
      pubCount: isLocal
        ? document.querySelectorAll('.card-publicacion').length
        : [...document.querySelectorAll('h4')].filter(
            (el) =>
              el.getBoundingClientRect().top > 700 &&
              el.getBoundingClientRect().top < 1200 &&
              !el.textContent?.includes('@')
          ).length,
      hasHeroCtas: isLocal
        ? document.querySelectorAll('.pub-hero__ctas .btn').length
        : 0,
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-021 publicaciones — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.h1.fontSize).toBe('72px')
    expect(prod.introTitle.fontSize).toBe('48px')
    expect(prod.cardTitle.fontSize).toBe('26px')
    expect(prod.pubCount).toBe(2)

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => document.querySelectorAll('.card-publicacion').length >= 2)

    const local = await getPageMetrics(page, true)
    expect(local.h1.fontSize).toBe('72px')
    expect(local.h1.textAlign).toBe('center')
    expect(local.introTitle.fontSize).toBe('48px')
    expect(local.cardTitle.fontSize).toBe('26px')
    expect(local.heroHasGradient).toBe(true)
    expect(local.destacadasBg).toBe('rgb(242, 242, 242)')
    expect(local.gridDirection).toBe('row')
    expect(local.hasSearch).toBe(false)
    expect(local.introTitleTag).toBe('P')
    expect(local.pubCount).toBe(2)
    expect(local.hasHeroCtas).toBe(2)
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.h1.fontSize).toBe('32px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => document.querySelectorAll('.card-publicacion').length >= 2)

    const local = await getPageMetrics(page, true)
    expect(local.h1.fontSize).toBe('32px')
    expect(local.introTitle.fontSize).toBe('31px')
    expect(local.gridDirection).toBe('column')
  })

  test('captura hero desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })

      if (url === LOCAL_URL) {
        await page.waitForFunction(() => document.querySelectorAll('.card-publicacion').length >= 2)
      }

      const hero = url === LOCAL_URL
        ? page.locator('.pub-hero')
        : page.locator('h1').first()

      await hero.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)

      const box = await hero.evaluate((el) => {
        const target =
          el.classList?.contains('pub-hero')
            ? el
            : el.closest('div')?.parentElement
        const r = (target || el).getBoundingClientRect()
        return { y: Math.max(0, r.top + window.scrollY - 74), h: Math.min(r.height + 20, 620) }
      })

      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${prefix}-hero-desktop.png`),
        clip: { x: 0, y: box.y, width: 1440, height: box.h },
      })
    }
  })
})
