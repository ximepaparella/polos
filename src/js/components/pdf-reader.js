import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const ZOOM_STEPS = [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3]
const MIN_ZOOM = ZOOM_STEPS[0]
const MAX_ZOOM = ZOOM_STEPS[ZOOM_STEPS.length - 1]
const VIEWPORT_PADDING = 8

function nearestZoomStep(value) {
  let best = ZOOM_STEPS[0]
  let bestDist = Math.abs(value - best)

  for (const step of ZOOM_STEPS) {
    const dist = Math.abs(value - step)
    if (dist < bestDist) {
      best = step
      bestDist = dist
    }
  }

  return best
}

function clampZoom(value) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

/**
 * Mobile-first single-page PDF reader.
 * Renders one page at a time with fit-width base scale, button/pinch zoom and pan via scroll.
 */
export class PdfReader {
  constructor(containerId, pdfUrl, options = {}) {
    this.container = document.getElementById(containerId)
    this.pdfUrl = pdfUrl
    this.options = options
    this.pdf = null
    this.totalPages = 0
    this.currentPage = 1
    this.zoom = 1
    this.renderTask = null
    this.renderGeneration = 0
    this.viewportEl = null
    this.canvas = null
    this.statusEl = null
    this.pinch = null
    this.fsFake = false

    this.handleFullscreenChange = () => {
      this.updateFullscreenButton()
      this.scheduleRender()
    }

    this.handleResize = () => {
      this.scheduleRender()
    }

    this.handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        event.preventDefault()
        const [a, b] = event.touches
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
        this.pinch = {
          baseDist: dist || 1,
          baseZoom: this.zoom,
        }
      }
    }

    this.handleTouchMove = (event) => {
      if (!this.pinch || event.touches.length < 2) {
        return
      }

      event.preventDefault()
      const [a, b] = event.touches
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      const next = clampZoom(this.pinch.baseZoom * (dist / this.pinch.baseDist))
      this.zoom = next
      this.updateZoomControls(next)

      if (this.canvas) {
        const live = next / this.pinch.baseZoom
        this.canvas.style.transform = `scale(${live})`
        this.canvas.style.transformOrigin = 'center top'
      }
    }

    this.handleTouchEnd = (event) => {
      if (!this.pinch) {
        return
      }

      if (event.touches.length >= 2) {
        return
      }

      this.pinch = null

      if (this.canvas) {
        this.canvas.style.transform = ''
        this.canvas.style.transformOrigin = ''
      }

      this.setZoom(nearestZoomStep(this.zoom), { snap: true })
    }
  }

  async init() {
    if (!this.container) {
      return
    }

    this.container.classList.add('pdf-reader')
    this.container.setAttribute('role', 'region')
    this.container.setAttribute('aria-label', 'Lector de PDF')
    this.container.innerHTML = `
      <div class="pdf-reader__status" data-pdf-status>
        <div class="pdf-reader__spinner" aria-hidden="true"></div>
        <p class="pdf-reader__status-text">Cargando revista...</p>
      </div>
      <div class="pdf-reader__viewport" data-pdf-viewport hidden>
        <div class="pdf-reader__stage">
          <canvas class="pdf-reader__canvas" data-pdf-canvas aria-label="Página del PDF"></canvas>
        </div>
      </div>
    `

    this.statusEl = this.container.querySelector('[data-pdf-status]')
    this.viewportEl = this.container.querySelector('[data-pdf-viewport]')
    this.canvas = this.container.querySelector('[data-pdf-canvas]')

    this.initControls()
    this.bindGestures()
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('fullscreenchange', this.handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange)

    try {
      const loadingTask = pdfjsLib.getDocument({
        url: this.pdfUrl,
        withCredentials: false,
      })
      this.pdf = await loadingTask.promise
      this.totalPages = this.pdf.numPages
      this.currentPage = 1

      if (this.statusEl) {
        this.statusEl.hidden = true
      }

      if (this.viewportEl) {
        this.viewportEl.hidden = false
      }

      this.updatePageCounter()
      this.updateZoomControls()
      await this.renderPage(this.currentPage)
    } catch (error) {
      console.error('Error iniciando pdf-reader:', error)
      this.showError()
    }
  }

  initControls() {
    document.getElementById('btn-prev')?.addEventListener('click', () => {
      this.prev()
    })

    document.getElementById('btn-next')?.addEventListener('click', () => {
      this.next()
    })

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.zoomIn()
    })

    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.zoomOut()
    })

    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      this.toggleFullscreen()
    })

    this.updateZoomControls()
    this.updateFullscreenButton()
    this.updatePageCounter()
  }

  bindGestures() {
    if (!this.viewportEl) {
      return
    }

    this.viewportEl.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    this.viewportEl.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    this.viewportEl.addEventListener('touchend', this.handleTouchEnd)
    this.viewportEl.addEventListener('touchcancel', this.handleTouchEnd)
  }

  async prev() {
    if (this.currentPage <= 1) {
      return
    }

    this.currentPage -= 1
    this.updatePageCounter()
    await this.renderPage(this.currentPage)
  }

  async next() {
    if (this.currentPage >= this.totalPages) {
      return
    }

    this.currentPage += 1
    this.updatePageCounter()
    await this.renderPage(this.currentPage)
  }

  zoomIn() {
    const next = ZOOM_STEPS.find((step) => step > this.zoom + 0.01) || MAX_ZOOM
    this.setZoom(next)
  }

  zoomOut() {
    const previous = [...ZOOM_STEPS].reverse().find((step) => step < this.zoom - 0.01) || MIN_ZOOM
    this.setZoom(previous)
  }

  setZoom(value, { snap = true, render = true } = {}) {
    this.zoom = clampZoom(snap ? nearestZoomStep(value) : value)
    this.updateZoomControls()

    if (render) {
      this.scheduleRender()
    }
  }

  scheduleRender() {
    if (this._renderTimer) {
      clearTimeout(this._renderTimer)
    }

    this._renderTimer = setTimeout(() => {
      this._renderTimer = null
      this.renderPage(this.currentPage)
    }, 80)
  }

  async renderPage(pageNum) {
    if (!this.pdf || !this.canvas || !this.viewportEl) {
      return
    }

    const generation = ++this.renderGeneration

    if (this.renderTask) {
      try {
        this.renderTask.cancel()
      } catch {
        // ignore cancel errors
      }
      this.renderTask = null
    }

    try {
      const page = await this.pdf.getPage(pageNum)

      if (generation !== this.renderGeneration) {
        return
      }

      const unscaled = page.getViewport({ scale: 1 })
      const availableWidth = Math.max(
        120,
        this.viewportEl.clientWidth - VIEWPORT_PADDING * 2
      )
      const fitScale = availableWidth / unscaled.width
      const scale = fitScale * this.zoom
      const viewport = page.getViewport({ scale })
      const outputScale = window.devicePixelRatio || 1

      this.canvas.width = Math.floor(viewport.width * outputScale)
      this.canvas.height = Math.floor(viewport.height * outputScale)
      this.canvas.style.width = `${Math.floor(viewport.width)}px`
      this.canvas.style.height = `${Math.floor(viewport.height)}px`
      this.canvas.style.transform = ''

      const context = this.canvas.getContext('2d', { alpha: false })
      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null

      this.renderTask = page.render({
        canvasContext: context,
        viewport,
        transform,
      })

      await this.renderTask.promise

      if (generation !== this.renderGeneration) {
        return
      }

      this.renderTask = null
      this.viewportEl.scrollTop = 0
      this.viewportEl.scrollLeft = 0
    } catch (error) {
      if (error?.name === 'RenderingCancelledException') {
        return
      }

      console.error('Error renderizando página PDF:', error)
      this.showError()
    }
  }

  updatePageCounter() {
    const counter = document.getElementById('page-counter')

    if (!counter) {
      return
    }

    if (!this.totalPages) {
      counter.textContent = '1 / ?'
      return
    }

    counter.textContent = `${this.currentPage} / ${this.totalPages}`
  }

  updateZoomControls(zoom = this.zoom) {
    const level = typeof zoom === 'number' ? zoom : 1
    const label = document.getElementById('zoom-level')
    const zoomIn = document.getElementById('btn-zoom-in')
    const zoomOut = document.getElementById('btn-zoom-out')

    if (label) {
      label.textContent = `${Math.round(level * 100)}%`
    }

    if (zoomIn) {
      zoomIn.disabled = level >= MAX_ZOOM - 0.01
    }

    if (zoomOut) {
      zoomOut.disabled = level <= MIN_ZOOM + 0.01
    }
  }

  getSection() {
    return this.container?.closest('[data-flipbook-fs]')
  }

  isSectionFullscreen() {
    const section = this.getSection()
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement
    return Boolean(section && fsEl && (fsEl === section || section.contains(fsEl)))
  }

  async toggleFullscreen() {
    const section = this.getSection()

    if (!section) {
      return
    }

    if (this.isSectionFullscreen() || this.fsFake) {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {})
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      }

      section.classList.remove('fb-fake-fs')
      this.fsFake = false
      this.updateFullscreenButton()
      this.scheduleRender()
      return
    }

    try {
      if (section.requestFullscreen) {
        await section.requestFullscreen()
      } else if (section.webkitRequestFullscreen) {
        section.webkitRequestFullscreen()
      } else {
        section.classList.add('fb-fake-fs')
        this.fsFake = true
      }
    } catch {
      section.classList.add('fb-fake-fs')
      this.fsFake = true
    }

    this.updateFullscreenButton()
    this.scheduleRender()
  }

  updateFullscreenButton() {
    const btn = document.getElementById('btn-fullscreen')

    if (!btn) {
      return
    }

    const active = this.isSectionFullscreen() || this.fsFake
    btn.textContent = active ? 'Salir de pantalla completa' : 'Pantalla completa'
    btn.setAttribute('aria-label', btn.textContent)
  }

  showError() {
    this.teardownListeners()

    if (!this.container) {
      return
    }

    this.container.innerHTML = `
      <div class="pdf-reader__error flipbook-error" role="alert">
        <p>No se pudo cargar la revista. Por favor intentá descargar el PDF directamente.</p>
      </div>
    `
  }

  teardownListeners() {
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange)
    this.viewportEl?.removeEventListener('touchstart', this.handleTouchStart)
    this.viewportEl?.removeEventListener('touchmove', this.handleTouchMove)
    this.viewportEl?.removeEventListener('touchend', this.handleTouchEnd)
    this.viewportEl?.removeEventListener('touchcancel', this.handleTouchEnd)

    if (this._renderTimer) {
      clearTimeout(this._renderTimer)
      this._renderTimer = null
    }
  }

  destroy() {
    this.teardownListeners()

    if (this.renderTask) {
      try {
        this.renderTask.cancel()
      } catch {
        // ignore
      }
      this.renderTask = null
    }

    const section = this.getSection()
    section?.classList.remove('fb-fake-fs')

    if (this.pdf) {
      this.pdf.destroy()
      this.pdf = null
    }

    if (this.container) {
      this.container.classList.remove('pdf-reader')
      this.container.removeAttribute('role')
      this.container.removeAttribute('aria-label')
      this.container.innerHTML = ''
    }
  }
}
