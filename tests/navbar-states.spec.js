import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/'
const LOCAL_URL = 'http://127.0.0.1:5190/'
const SCREENSHOT_DIR = 'tests/screenshots/navbar/states'

function navLinkLocator(page, label) {
  return page.locator('.navbar__links a', { hasText: label }).first()
}

async function getNavLinkStyles(locator) {
  return locator.evaluate((link) => {
    const styles = getComputedStyle(link)
    return {
      color: styles.color,
      textDecoration: styles.textDecorationLine,
      fontWeight: styles.fontWeight,
      borderBottomWidth: styles.borderBottomWidth,
    }
  })
}

async function getProductionNavLinkStyles(page, label) {
  return page.evaluate((label) => {
    const link = [...document.querySelectorAll('a')].find(
      (anchor) =>
        anchor.textContent?.trim() === label && anchor.getBoundingClientRect().top < 80
    )
    if (!link) return null
    const styles = getComputedStyle(link)
    return {
      color: styles.color,
      textDecoration: styles.textDecorationLine,
    }
  }, label)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-002 navbar — estados interactivos', () => {
  test('producción: default, hover y página activa', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const homeDefault = await getProductionNavLinkStyles(page, 'Sobre el Foro')
    expect(homeDefault).toMatchObject({
      color: 'rgb(0, 0, 0)',
      textDecoration: 'none',
    })

    const prodLosPolos = page.locator('a').filter({ hasText: /^Los Polos$/ }).first()
    await prodLosPolos.hover()
    const homeHover = await getProductionNavLinkStyles(page, 'Los Polos')
    expect(homeHover).toMatchObject({
      color: 'rgb(122, 122, 122)',
      textDecoration: 'underline',
    })

    await page.goto(`${PRODUCTION_URL}sobre-el-foro`, { waitUntil: 'networkidle' })
    await page.mouse.move(0, 0)
    const active = await getProductionNavLinkStyles(page, 'Sobre el Foro')
    const inactive = await getProductionNavLinkStyles(page, 'Los Polos')
    expect(active).toMatchObject({
      color: 'rgb(17, 17, 17)',
      textDecoration: 'underline',
    })
    expect(inactive).toMatchObject({
      color: 'rgb(0, 0, 0)',
      textDecoration: 'none',
    })

    await page.locator('a').filter({ hasText: /^Sobre el Foro$/ }).first().hover()
    const activeHover = await getProductionNavLinkStyles(page, 'Sobre el Foro')
    expect(activeHover).toMatchObject({
      color: 'rgb(122, 122, 122)',
      textDecoration: 'underline',
    })
  })

  test('local replica estados de links del nav', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.locator('.navbar').waitFor()

    const localSobreElForo = navLinkLocator(page, 'Sobre el Foro')
    const defaultStyle = await getNavLinkStyles(localSobreElForo)
    expect(defaultStyle).toMatchObject({
      color: 'rgb(0, 0, 0)',
      textDecoration: 'none',
    })

    const localLosPolos = navLinkLocator(page, 'Los Polos')
    await localLosPolos.hover()
    await page.waitForTimeout(50)
    const hoverStyle = await getNavLinkStyles(localLosPolos)
    expect(hoverStyle).toMatchObject({
      color: 'rgb(122, 122, 122)',
      textDecoration: 'underline',
    })

    await page.goto(`${LOCAL_URL}sobre-el-foro`, { waitUntil: 'networkidle' })
    await page.locator('.navbar').waitFor()
    const activeStyle = await getNavLinkStyles(navLinkLocator(page, 'Sobre el Foro'))
    expect(activeStyle).toMatchObject({
      color: 'rgb(17, 17, 17)',
      textDecoration: 'underline',
    })
  })

  test('capturas hover desktop prod vs local', async ({ page }) => {
    const clip = { x: 200, y: 0, width: 600, height: 64 }

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    await page.locator('a').filter({ hasText: /^Publicaciones$/ }).first().hover()
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'production-hover-publicaciones.png'),
      clip,
    })

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.locator('.navbar__links a', { hasText: 'Publicaciones' }).hover()
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'local-hover-publicaciones.png'),
      clip,
    })
  })
})
