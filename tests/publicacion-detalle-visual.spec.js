import { test, expect } from '@playwright/test'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const PRODUCTION_URL =
  'https://campolacanianoarg.org/publicaciones-facl/revista-de-psicoanalisis-de-la-epfcl-alsur'
const LOCAL_URL =
  'http://127.0.0.1:5190/publicaciones-facl?slug=revista-de-psicoanalisis-de-la-epfcl-alsur'
const SCREENSHOT_DIR = 'tests/screenshots/publicacion-detalle'

async function getPageMetrics(page, useLocal = false) {
  return page.evaluate((isLocal) => {
    const read = (el) => {
      if (!el) return null
      const s = getComputedStyle(el)
      return { fontSize: s.fontSize, fontWeight: s.fontWeight }
    }

    const title = isLocal
      ? document.querySelector('.publicacion-detalle__title')
      : [...document.querySelectorAll('h2')].find((el) => el.textContent?.includes('WITZ'))

    const subtitle = isLocal
      ? document.querySelector('.publicacion-detalle__subtitle')
      : [...document.querySelectorAll('h6')].find(
          (el) =>
            el.getBoundingClientRect().top > 400 &&
            el.getBoundingClientRect().top < 800 &&
            el.textContent?.includes('Revista de Psicoanálisis')
        )

    const download = [...document.querySelectorAll('a')].find((el) =>
      el.textContent?.includes('Descargar Publicación')
    )

    const downloadBtn = isLocal
      ? document.querySelector('.publicacion-detalle__download')
      : download

    return {
      title: read(title),
      titleTag: isLocal ? title?.tagName : null,
      subtitle: read(subtitle),
      hasDownload: Boolean(download),
      downloadWidth: downloadBtn
        ? Math.round(downloadBtn.getBoundingClientRect().width)
        : null,
      hasAvatar: isLocal ? Boolean(document.querySelector('.publicacion-detalle__avatar')) : false,
      dateColor: isLocal
        ? getComputedStyle(document.querySelector('.publicacion-detalle__date'))?.color
        : null,
      hasFlipbookControls: Boolean(document.getElementById('flipbook-controls')),
      hasNav: Boolean(document.querySelector('.publicacion-nav__link')),
      coverHeight: isLocal
        ? getComputedStyle(document.querySelector('.publicacion-detalle__cover-img'))?.height
        : null,
    }
  }, useLocal)
}

test.beforeAll(async () => {
  await mkdir(SCREENSHOT_DIR, { recursive: true })
})

test.describe('SPEC-022/023 publicacion-detalle — review vs producción', () => {
  test('métricas desktop alineadas a producción', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    await page.goto(PRODUCTION_URL, { waitUntil: 'networkidle' })
    const prod = await getPageMetrics(page, false)
    expect(prod.title.fontSize).toBe('52px')
    expect(prod.subtitle.fontSize).toBe('16px')
    expect(prod.hasDownload).toBe(true)

    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })
    await page.waitForFunction(() => document.querySelector('.publicacion-detalle__title'))

    const local = await getPageMetrics(page, true)
    expect(local.title.fontSize).toBe('52px')
    expect(local.titleTag).toBe('H2')
    expect(local.subtitle.fontSize).toBe('16px')
    expect(local.hasDownload).toBe(true)
    expect(local.downloadWidth).toBeGreaterThan(800)
    expect(local.hasAvatar).toBe(true)
    expect(local.dateColor).toBe('rgb(136, 136, 136)')
    expect(local.hasFlipbookControls).toBe(true)
    expect(local.hasNav).toBe(true)
    expect(local.coverHeight).toBe('314px')
  })

  test('flipbook carga páginas del PDF', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(LOCAL_URL, { waitUntil: 'networkidle' })

    await page.waitForFunction(
      () => {
        const counter = document.getElementById('page-counter')
        return counter && counter.textContent?.includes('/') && !counter.textContent?.includes('?')
      },
      { timeout: 120000 }
    )

    const counter = await page.locator('#page-counter').textContent()
    const totalPages = Number(counter.split('/')[1]?.trim())

    expect(totalPages).toBeGreaterThan(1)
    await expect(page.locator('.stf__parent')).toHaveCount(1)
  })

  test('captura detalle desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const [url, prefix] of [
      [PRODUCTION_URL, 'production'],
      [LOCAL_URL, 'local'],
    ]) {
      await page.goto(url, { waitUntil: 'networkidle' })

      if (url === LOCAL_URL) {
        await page.waitForFunction(() => document.querySelector('.publicacion-detalle__title'))
      }

      const section = url === LOCAL_URL
        ? page.locator('.publicacion-detalle__info')
        : page.locator('h2').first()

      await section.scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)

      const box = await section.evaluate((el) => {
        const target =
          el.classList?.contains('publicacion-detalle__info')
            ? el.parentElement
            : el.closest('div')?.parentElement
        const r = (target || el).getBoundingClientRect()
        return { y: Math.max(0, r.top + window.scrollY - 74), h: Math.min(r.height + 40, 700) }
      })

      await page.screenshot({
        path: join(SCREENSHOT_DIR, `${prefix}-info-desktop.png`),
        clip: { x: 0, y: box.y, width: 1440, height: box.h },
      })
    }
  })
})
