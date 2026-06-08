import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/eventos'
const LOCAL_URL = 'http://127.0.0.1:5190/eventos'
const SCREENSHOT_DIR = 'tests/screenshots/eventos'

async function getPageMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        padding: s.padding,
        gridTemplateColumns: s.gridTemplateColumns,
      }
    }

    const title = isLocal
      ? document.querySelector('.eventos-hero__title')
      : [...document.querySelectorAll('h2')].find((el) =>
          el.textContent?.includes('Nuestros próximos eventos')
        )

    const subtitle = isLocal
      ? document.querySelector('.eventos-hero__subtitle')
      : [...document.querySelectorAll('h5')].find((el) =>
          el.textContent?.includes('Descubre nuestros próximos eventos')
        )

    const cardTitle = isLocal
      ? document.querySelector('.card-publicacion__title')
      : [...document.querySelectorAll('h6')].find((el) =>
          el.textContent?.includes('Simposio Interamericano')
        )

    const ctaTitle = isLocal
      ? document.querySelector('.eventos-instagram-cta__title')
      : [...document.querySelectorAll('h2')].find((el) =>
          el.textContent?.includes('SEGUÍ NUESTRAS ACTUALIZACIONES')
        )

    const pageSection = isLocal ? document.querySelector('.eventos-main') : null
    const grid = isLocal ? document.querySelector('.eventos-grid') : null
    const heroMark = isLocal ? document.querySelector('.eventos-hero__mark') : null
    const ctaText = isLocal ? document.querySelector('.eventos-instagram-cta__text') : null

    return {
      title: read(title),
      subtitle: read(subtitle),
      cardTitle: read(cardTitle),
      ctaTitle: read(ctaTitle),
      pagePadding: pageSection ? read(pageSection).padding : null,
      hasHeroMark: Boolean(heroMark),
      hasCtaText: Boolean(ctaText?.textContent?.includes('enterarte')),
      gridColumns: grid ? read(grid).gridTemplateColumns.split(' ').length : 0,
      eventCount: isLocal
        ? document.querySelectorAll('.card-publicacion:not(.card-publicacion__skeleton)').length
        : [...document.querySelectorAll('h6')].filter(
            (el) =>
              el.getBoundingClientRect().top > 400 &&
              el.getBoundingClientRect().top < 1600 &&
              !el.textContent?.includes('Contacto')
          ).length,
      hasInstagramCta: isLocal
        ? Boolean(document.querySelector('.eventos-instagram-cta__cta'))
        : Boolean(
            [...document.querySelectorAll('a,p')].find((el) =>
              el.textContent?.toLowerCase().includes('instagram')
            )
          ),
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-020 eventos — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.title.fontSize).toBe('52px')
    expect(prod.subtitle.fontSize).toBe('18px')
    expect(prod.cardTitle.fontSize).toBe('22px')
    expect(prod.eventCount).toBeGreaterThanOrEqual(5)
    expect(prod.ctaTitle.color).toBe('rgb(255, 255, 255)')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => {
      const grid = document.getElementById('eventos-grid')
      return grid && grid.querySelectorAll('.card-publicacion:not(.card-publicacion__skeleton)').length >= 5
    })

    const local = await getPageMetrics(page, true)
    expect(local.pagePadding).toContain('112px')
    expect(local.title.fontSize).toBe('52px')
    expect(local.subtitle.fontSize).toBe('18px')
    expect(local.cardTitle.fontSize).toBe('22px')
    expect(local.gridColumns).toBe(2)
    expect(local.eventCount).toBe(5)
    expect(local.hasInstagramCta).toBe(true)
    expect(local.hasHeroMark).toBe(true)
    expect(local.hasCtaText).toBe(true)
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.title.fontSize).toBe('33px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => document.querySelectorAll('.card-publicacion:not(.card-publicacion__skeleton)').length >= 5)

    const local = await getPageMetrics(page, true)
    expect(local.title.fontSize).toBe('33px')
    expect(local.subtitle.fontSize).toBe('14px')
    expect(local.gridColumns).toBe(1)
  })

  test('captura hero desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })

      if (url === LOCAL_URL) {
        await page.waitForFunction(() => document.querySelectorAll('.card-publicacion:not(.card-publicacion__skeleton)').length >= 5)
      }

      const hero = url === LOCAL_URL
        ? page.locator('.eventos-main')
        : page.locator('h2').first()

      await hero.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)

      const box = await hero.evaluate((el) => {
        const target =
          el.classList?.contains('eventos-main')
            ? el
            : el.closest('div')?.parentElement
        const r = (target || el).getBoundingClientRect()
        return { y: Math.max(0, r.top + window.scrollY - 74), h: Math.min(r.height + 220, 720) }
      })

      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${prefix}-hero-desktop.png`),
        clip: { x: 0, y: box.y, width: 1440, height: box.h },
      })
    }
  })
})
