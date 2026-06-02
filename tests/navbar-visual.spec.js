import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/'
const LOCAL_URL = 'http://127.0.0.1:5190/'
const SCREENSHOT_DIR = 'tests/screenshots/navbar'

async function getHeaderNavStyles(page) {
  return page.evaluate(() => {
    const link = [...document.querySelectorAll('a')].find(
      (anchor) => anchor.textContent?.trim() === 'Sobre el Foro' && anchor.getBoundingClientRect().top < 80
    )
    if (!link) return null
    const styles = getComputedStyle(link)
    const bar = link.closest('.navbar') || link.parentElement?.parentElement?.parentElement
    const barStyles = bar ? getComputedStyle(bar) : null
    const logoImg =
      document.querySelector('.navbar__logo-img') ||
      document.querySelector('.navbar__logo img') ||
      [...document.querySelectorAll('a')].find((a) => !a.textContent?.trim() && a.getBoundingClientRect().top < 80)?.querySelector('img,svg')

    return {
      link: {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        fontFamily: styles.fontFamily,
        textTransform: styles.textTransform,
        letterSpacing: styles.letterSpacing,
        textDecoration: styles.textDecorationLine,
        borderBottomWidth: styles.borderBottomWidth,
      },
      bar: barStyles
        ? { height: barStyles.height, backgroundColor: barStyles.backgroundColor }
        : null,
      logoHeight: logoImg ? Math.round(logoImg.getBoundingClientRect().height) : null,
    }
  })
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-002 navbar — review vs producción', () => {
  test('captura header desktop (1440px)', async ({ page }) => {
    const clip = { x: 0, y: 0, width: 1440, height: 64 }

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    await page.getByRole('link', { name: 'Sobre el Foro' }).first().waitFor()
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'production-desktop-1440.png'),
      clip,
    })

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.locator('.navbar').waitFor()
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'local-desktop-1440.png'),
      clip,
    })
  })

  test('captura header mobile (375px)', async ({ page }) => {
    const clip = { x: 0, y: 0, width: 375, height: 64 }

    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'production-mobile-375.png'),
      clip,
    })

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.locator('.navbar').waitFor()
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'local-mobile-375.png'),
      clip,
    })
  })

  test('tipografía y métricas del nav alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const production = await getHeaderNavStyles(page)
    expect(production).not.toBeNull()

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getHeaderNavStyles(page)
    expect(local).not.toBeNull()

    expect(local.link.fontSize).toBe(production.link.fontSize)
    expect(local.link.fontWeight).toBe(production.link.fontWeight)
    expect(local.link.textTransform).toBe('none')
    expect(production.link.textTransform).toBe('none')
    expect(local.link.borderBottomWidth).toBe('0px')
    expect(local.bar.height).toBe('64px')
    expect(local.logoHeight).toBeGreaterThanOrEqual(38)
    expect(local.logoHeight).toBeLessThanOrEqual(42)
  })
})
