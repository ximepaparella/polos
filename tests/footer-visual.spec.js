import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL = 'https://campolacanianoarg.org/'
const LOCAL_URL = 'http://127.0.0.1:5190/'
const SCREENSHOT_DIR = 'tests/screenshots/footer'

async function getFooterMetrics(page, useLocalSelector = false) {
  return page.evaluate((useLocal) => {
    const footer = useLocal
      ? document.querySelector('.footer')
      : [...document.querySelectorAll('div')].find((el) => {
          const email = el.querySelector('h4')
          return (
            email?.textContent?.trim() === 'foroargcl@gmail.com' &&
            getComputedStyle(el).backgroundColor === 'rgb(242, 242, 242)'
          )
        })

    if (!footer) return null

    const fs = getComputedStyle(footer)
    const email = footer.querySelector(useLocal ? '.footer__email' : 'h4,a')
    const emailEl =
      email?.textContent?.includes('foroargcl') ?
        email :
        footer.querySelector('h4')
    const contactLabel = footer.querySelector(useLocal ? '.footer__contact-label' : 'h6,p,div')
    const mapaTitle = useLocal
      ? footer.querySelector('.footer__sitemap-title')
      : [...footer.querySelectorAll('p,div')].find(
          (el) => el.textContent?.trim() === 'Mapa del sitio' && el.childElementCount === 0
        )
    const links = useLocal
      ? [...footer.querySelectorAll('.footer__sitemap a')]
      : [...footer.querySelectorAll('a')].filter((a) =>
          ['Sobre el Foro', 'Eventos', 'Los Polos', 'Publicaciones', 'La Escuela', 'Contacto'].includes(
            a.textContent?.trim()
          )
        )

    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        color: s.color,
        textDecoration: s.textDecorationLine,
        backgroundColor: s.backgroundColor,
        paddingTop: s.paddingTop,
      }
    }

    const positions = links.map((a) => ({
      text: a.textContent?.trim(),
      left: Math.round(a.getBoundingClientRect().left),
      top: Math.round(a.getBoundingClientRect().top),
    }))

    return {
      footer: read(footer),
      email: read(emailEl),
      contactLabel: read(
        useLocal ?
          footer.querySelector('.footer__contact-label') :
          footer.querySelector('h6')
      ),
      sitemapTitle: read(mapaTitle),
      link: read(links[0]),
      linkOrder: links.map((a) => a.textContent?.trim()),
      positions,
      mark: useLocal ? read(footer.querySelector('.footer__mark')) : null,
    }
  }, useLocalSelector)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
  await mkdir(join(SCREENSHOT_DIR, 'states'), { recursive: true })
})

test.describe('SPEC-003 footer — review vs producción', () => {
  for (const [width, height, name] of [
    [1440, 900, 'desktop'],
    [375, 812, 'mobile'],
  ]) {
    test(`captura footer ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height })

      await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
      await page.getByText('foroargcl@gmail.com').last().scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      const prodFooter = await page.locator('h4').filter({ hasText: 'foroargcl@gmail.com' }).last()
      const prodBox = await prodFooter.evaluate((el) => {
        let n = el
        for (let i = 0; i < 12 && n; i++) {
          if (getComputedStyle(n).backgroundColor === 'rgb(242, 242, 242)') {
            const r = n.getBoundingClientRect()
            return { y: r.top, h: r.height }
          }
          n = n.parentElement
        }
        return { y: 500, h: 300 }
      })
      await page.screenshot({
        path: join(SCREENSHOT_DIR, `production-${name}.png`),
        clip: { x: 0, y: Math.max(0, prodBox.y - 10), width, height: Math.min(prodBox.h + 80, 400) },
      })

      await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
      await page.locator('.footer').scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
      const localBox = await page.locator('.footer').boundingBox()
      await page.screenshot({
        path: join(SCREENSHOT_DIR, `local-${name}.png`),
        clip: {
          x: 0,
          y: Math.max(0, (localBox?.y ?? 500) - 10),
          width,
          height: Math.min((localBox?.height ?? 300) + 20, 400),
        },
      })
    })
  }

  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    await page.getByText('foroargcl@gmail.com').last().scrollIntoViewIfNeeded()
    const prod = await getFooterMetrics(page, false)
    expect(prod).not.toBeNull()
    expect(prod.footer.backgroundColor).toBe('rgb(242, 242, 242)')
    expect(prod.footer.paddingTop).toBe('80px')
    expect(prod.email.fontSize).toBe('26px')
    expect(prod.contactLabel.fontSize).toBe('22px')
    expect(prod.sitemapTitle.fontSize).toBe('14px')
    expect(prod.link.fontSize).toBe('12px')
    expect(prod.linkOrder).toEqual([
      'Sobre el Foro',
      'Los Polos',
      'La Escuela',
      'Eventos',
      'Publicaciones',
      'Contacto',
    ])

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.locator('.footer').scrollIntoViewIfNeeded()
    const local = await getFooterMetrics(page, true)
    expect(local).not.toBeNull()
    expect(local.footer.backgroundColor).toBe('rgb(242, 242, 242)')
    expect(local.footer.paddingTop).toBe('80px')
    expect(local.email.fontSize).toBe('26px')
    expect(local.contactLabel.fontSize).toBe('22px')
    expect(local.sitemapTitle.fontSize).toBe('14px')
    expect(local.link.fontSize).toBe('12px')
    expect(local.linkOrder).toEqual([
      'Sobre el Foro',
      'Los Polos',
      'La Escuela',
      'Eventos',
      'Publicaciones',
      'Contacto',
    ])
  })

  test('métricas mobile alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    await page.getByText('foroargcl@gmail.com').last().scrollIntoViewIfNeeded()
    const prod = await getFooterMetrics(page, false)
    expect(prod.footer.paddingTop).toBe('32px')
    expect(prod.email.fontSize).toBe('16px')

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.locator('.footer').scrollIntoViewIfNeeded()
    const local = await getFooterMetrics(page, true)
    expect(local.footer.paddingTop).toBe('32px')
    expect(local.email.fontSize).toBe('16px')
  })

  test('estados hover email y sitemap (local)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.locator('.footer').scrollIntoViewIfNeeded()

    const email = page.locator('.footer__email a')
    await email.hover()
    await page.waitForTimeout(50)
    const emailHover = await email.evaluate((el) => ({
      color: getComputedStyle(el).color,
      textDecoration: getComputedStyle(el).textDecorationLine,
    }))
    expect(emailHover).toMatchObject({
      color: 'rgb(122, 122, 122)',
      textDecoration: 'underline',
    })

    const link = page.locator('.footer__sitemap a', { hasText: 'Eventos' })
    await link.hover()
    await page.waitForTimeout(50)
    const linkHover = await link.evaluate((el) => ({
      color: getComputedStyle(el).color,
      textDecoration: getComputedStyle(el).textDecorationLine,
    }))
    expect(linkHover).toMatchObject({
      color: 'rgb(122, 122, 122)',
      textDecoration: 'underline',
    })
  })
})
