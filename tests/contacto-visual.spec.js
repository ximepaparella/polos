import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/contacto'
const LOCAL_URL = 'http://127.0.0.1:5190/contacto'
const SCREENSHOT_DIR = 'tests/screenshots/contacto'

async function getPageMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        padding: s.padding,
        backgroundColor: s.backgroundColor,
      }
    }

    const title = isLocal
      ? document.querySelector('.contacto-main__title')
      : [...document.querySelectorAll('h2')].find((el) => el.textContent?.trim() === 'Contacto')

    const ubicTitle = isLocal
      ? document.querySelector('.contacto-ubicaciones__title')
      : [...document.querySelectorAll('h2')].find((el) => el.textContent?.trim() === 'Ubicaciones')

    const poloName = isLocal
      ? document.querySelector('.contacto-polo--active .contacto-polo__name')
      : [...document.querySelectorAll('h4')].find((el) => el.textContent?.includes('Polo Buenos Aires'))

    const poloEmail = isLocal
      ? document.querySelector('.contacto-polo__email')
      : [...document.querySelectorAll('p')].find((el) =>
          el.textContent?.trim() === 'secretariafarp@gmail.com'
        )

    const mainSection = isLocal
      ? document.querySelector('.contacto-main')
      : [...document.querySelectorAll('div')].find(
          (el) =>
            getComputedStyle(el).padding === '132px 64px 189px' &&
            el.textContent?.includes('Contacto')
        )

    const ubicSection = isLocal
      ? document.querySelector('.contacto-ubicaciones')
      : [...document.querySelectorAll('div')].find(
          (el) =>
            getComputedStyle(el).padding === '112px 64px' &&
            el.textContent?.includes('Ubicaciones')
        )

    const activePolo = isLocal ? document.querySelector('.contacto-polo--active') : null

    return {
      title: read(title),
      ubicTitle: read(ubicTitle),
      poloName: read(poloName),
      poloEmail: read(poloEmail),
      mainSection: read(mainSection),
      ubicSection: read(ubicSection),
      hasMark: isLocal ? Boolean(document.querySelector('.contacto-main__mark')) : false,
      hasWave: isLocal ? Boolean(document.querySelector('.contacto-wave')) : false,
      activePoloBg: activePolo ? read(activePolo).backgroundColor : null,
      submitBg: isLocal
        ? read(document.querySelector('.contacto-form__submit'))?.backgroundColor
        : null,
      poloCount: isLocal
        ? document.querySelectorAll('.contacto-polo').length
        : [...document.querySelectorAll('h4')].filter((el) =>
            el.textContent?.startsWith('Polo ')
          ).length,
      hasForm: isLocal
        ? Boolean(document.getElementById('form-suscripcion'))
        : Boolean(document.querySelector('form') || document.querySelector('input[type="email"]')),
      hasMap: isLocal
        ? Boolean(document.querySelector('iframe[title*="Mapa"]'))
        : Boolean(document.querySelector('iframe')),
      officialEmailHref: isLocal
        ? document.querySelector('.contacto-main__email')?.getAttribute('href')
        : null,
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-014 contacto — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.title.fontSize).toBe('52px')
    expect(prod.ubicTitle.fontSize).toBe('52px')
    expect(prod.poloCount).toBe(6)
    expect(prod.hasForm).toBe(true)
    expect(prod.hasMap).toBe(true)

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.mainSection.padding).toBe('132px 64px 189px')
    expect(local.ubicSection.padding).toBe('112px 64px')
    expect(local.ubicSection.backgroundColor).toBe('rgb(210, 236, 251)')
    expect(local.title.fontSize).toBe('52px')
    expect(local.ubicTitle.fontSize).toBe('52px')
    expect(local.poloName.fontSize).toBe('22px')
    expect(local.poloEmail.fontSize).toBe('18px')
    expect(local.poloCount).toBe(6)
    expect(local.hasMark).toBe(true)
    expect(local.hasWave).toBe(true)
    expect(local.activePoloBg).toBe('rgb(255, 255, 255)')
    expect(local.submitBg).toBe('rgb(51, 51, 51)')
    expect(local.officialEmailHref).toBe('mailto:foroargcl@gmail.com')
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.title.fontSize).toBe('33px')
    expect(prod.ubicTitle.fontSize).toBe('33px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.title.fontSize).toBe('33px')
    expect(local.ubicTitle.fontSize).toBe('33px')
  })

  test('captura sección contacto desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })
      const section = url === LOCAL_URL
        ? page.locator('.contacto-main')
        : page.locator('h2').first()

      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)

      const box = await section.evaluate((el) => {
        const target =
          el.classList?.contains('contacto-main')
            ? el
            : el.closest('div')?.parentElement
        const r = (target || el).getBoundingClientRect()
        return { y: Math.max(0, r.top + window.scrollY - 74), h: Math.min(r.height + 20, 900) }
      })

      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${prefix}-main-desktop.png`),
        clip: { x: 0, y: box.y, width: 1440, height: box.h },
      })
    }
  })
})
