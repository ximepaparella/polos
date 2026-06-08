import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/los-polos'
const LOCAL_URL = 'http://127.0.0.1:5190/los-polos'
const SCREENSHOT_DIR = 'tests/screenshots/los-polos'

async function getPageMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        backgroundColor: s.backgroundColor,
        padding: s.padding,
      }
    }

    const hero = isLocal
      ? document.querySelector('.polos-hero')
      : [...document.querySelectorAll('div')].find(
          (el) =>
            getComputedStyle(el).backgroundColor === 'rgb(242, 242, 242)' &&
            el.textContent?.includes('Polos del Campo Lacaniano en Argentina') &&
            el.getBoundingClientRect().height < 650
        )

    const title = isLocal
      ? document.querySelector('.polos-hero__title')
      : [...document.querySelectorAll('h2')].find((el) =>
          el.textContent?.includes('Polos del Campo Lacaniano en Argentina')
        )

    const subtitle = isLocal
      ? document.querySelector('.polos-hero__subtitle')
      : [...document.querySelectorAll('h5')].find((el) =>
          el.textContent?.includes('se localizan en diferentes regiones')
        )

    const miembrosTitle = isLocal
      ? document.querySelector('.polos-miembros__title')
      : [...document.querySelectorAll('p')].find((el) => el.textContent?.trim() === 'Miembros')

    const poloNames = isLocal
      ? [...document.querySelectorAll('.polos-polo__name')]
      : [...document.querySelectorAll('h4')].filter((el) =>
          el.textContent?.startsWith('Polo ')
        )

    const memberSample = isLocal
      ? document.querySelector('.polos-polo__member')
      : [...document.querySelectorAll('p')].find((el) =>
          el.textContent?.startsWith('Abínzano')
        )

    const equipoLabel = isLocal
      ? document.querySelector('.polos-miembros__label')
      : [...document.querySelectorAll('p')].find((el) => el.textContent?.trim() === 'Equipo')

    return {
      hero: read(hero),
      title: read(title),
      subtitle: read(subtitle),
      equipoLabel: read(equipoLabel),
      miembrosTitle: read(miembrosTitle),
      poloName: read(poloNames[0]),
      member: read(memberSample),
      poloCount: poloNames.length,
      memberCount: isLocal
        ? document.querySelectorAll('.polos-polo__member').length
        : 0,
      poloArticleCount: isLocal ? document.querySelectorAll('.polos-polo').length : 0,
      logoCount: isLocal ? document.querySelectorAll('.polos-hero__logos-track img').length : 0,
      hasErroneousSubtitle: isLocal
        ? Boolean(document.querySelector('.polos-miembros__subtitle'))
        : false,
      membersGridColumns: isLocal
        ? getComputedStyle(document.querySelector('.polos-polo__members')).gridTemplateColumns.split(' ').length
        : 0,
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-012 los-polos — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.title.fontSize).toBe('52px')
    expect(prod.subtitle.fontSize).toBe('18px')
    expect(prod.miembrosTitle.fontSize).toBe('52px')
    expect(prod.poloCount).toBe(6)

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.hero.backgroundColor).toBe('rgb(242, 242, 242)')
    expect(local.hero.padding).toBe('71px 64px 112px')
    expect(local.title.fontSize).toBe('52px')
    expect(local.subtitle.fontSize).toBe('18px')
    expect(local.poloName.fontSize).toBe('26px')
    expect(local.member.fontSize).toBe('18px')
    expect(local.poloCount).toBe(6)
    expect(local.memberCount).toBe(136)
    expect(local.poloArticleCount).toBe(6)
    expect(local.membersGridColumns).toBe(3)
    expect(local.equipoLabel.fontSize).toBe('14px')
    expect(local.logoCount).toBe(12)
    expect(local.hasErroneousSubtitle).toBe(false)
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.title.fontSize).toBe('33px')
    expect(prod.subtitle.fontSize).toBe('14px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    const local = await getPageMetrics(page, true)
    expect(local.title.fontSize).toBe('33px')
    expect(local.subtitle.fontSize).toBe('14px')
    expect(local.membersGridColumns).toBe(1)
  })

  test('captura hero desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })
      const hero = url === LOCAL_URL
        ? page.locator('.polos-hero')
        : page.locator('h2').first()

      await hero.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)

      const box = await hero.evaluate((el) => {
        const target =
          el.classList?.contains('polos-hero')
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
