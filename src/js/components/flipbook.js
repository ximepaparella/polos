import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import '../../vendor/pdflipbook.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker
window.pdfjsLib = pdfjsLib

const ZOOM_STEPS = [1, 1.25, 1.5, 2, 2.5, 3]

function getPDFlipbook() {
  return window.PDFlipbook
}

/**
 * Wrapper around vendored PDFlipbook.
 * Replaces StPageFlip (no zoom, cropped pages) with in-place zoom/pan and fitted pages.
 */
export class Flipbook {
  constructor(containerId, pdfUrl, options = {}) {
    this.container = document.getElementById(containerId)
    this.pdfUrl = pdfUrl
    this.options = options
    this.book = null
    this.totalPages = 0

    this.handleReady = (event) => {
      this.totalPages = event.detail?.pages || this.book?.numPages || 0
      const page = this.book?.currentPage?.() || 1
      this.updatePageCounter(page)
      this.updateZoomControls(this.book?.zoom || 1)
    }

    this.handlePageChange = (event) => {
      if (event.detail?.pages) {
        this.totalPages = event.detail.pages
      }
      this.updatePageCounter(event.detail?.page || 1)
    }

    this.handleZoomChange = (event) => {
      this.updateZoomControls(event.detail?.zoom)
    }

    this.handleError = () => {
      this.showError()
    }

    this.handleFullscreenChange = () => {
      this.updateFullscreenButton()
    }
  }

  async init() {
    if (!this.container) {
      return
    }

    const PDFlipbook = getPDFlipbook()

    if (!PDFlipbook?.create) {
      this.showError()
      return
    }

    this.container.addEventListener('flipbook:ready', this.handleReady)
    this.container.addEventListener('flipbook:pagechange', this.handlePageChange)
    this.container.addEventListener('flipbook:zoomchange', this.handleZoomChange)
    this.container.addEventListener('flipbook:error', this.handleError)

    try {
      this.book = PDFlipbook.create(this.container, {
        url: this.pdfUrl,
        startPage: 1,
        displayMode: 'double',
        zoomSteps: ZOOM_STEPS,
        controls: false,
        arrows: false,
        pageNumbers: false,
        shadow: 'none',
        padding: 8,
        maxScale: 2.5,
        ...this.options,
      })

      const statusText = this.container.querySelector('.fb-status-text')

      if (statusText) {
        statusText.textContent = 'Cargando revista...'
      }

      this.initControls()
    } catch (error) {
      console.error('Error iniciando flipbook:', error)
      this.showError()
    }
  }

  initControls() {
    const controls = document.getElementById('flipbook-controls')

    if (!controls) {
      return
    }

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      this.book?.prev()
    })

    document.getElementById('btn-next')?.addEventListener('click', () => {
      this.book?.next()
    })

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      this.book?.zoomIn()
    })

    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      this.book?.zoomOut()
    })

    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      this.book?.toggleFullscreen()
    })

    document.addEventListener('fullscreenchange', this.handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange)
    this.updateZoomControls(1)
    this.updateFullscreenButton()
  }

  isSectionFullscreen() {
    const section = this.container?.closest('[data-flipbook-fs]')
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement
    return Boolean(section && fsEl && (fsEl === section || section.contains(fsEl)))
  }

  updateFullscreenButton() {
    const btn = document.getElementById('btn-fullscreen')

    if (!btn) {
      return
    }

    const active = this.isSectionFullscreen() || Boolean(this.book?.fsFake)
    btn.textContent = active ? 'Salir de pantalla completa' : 'Pantalla completa'
    btn.setAttribute('aria-label', btn.textContent)
  }

  updatePageCounter(current) {
    const counter = document.getElementById('page-counter')

    if (counter && this.totalPages) {
      counter.textContent = `${current} / ${this.totalPages}`
    }
  }

  updateZoomControls(zoom = this.book?.zoom) {
    const level = typeof zoom === 'number' ? zoom : 1
    const label = document.getElementById('zoom-level')
    const zoomIn = document.getElementById('btn-zoom-in')
    const zoomOut = document.getElementById('btn-zoom-out')
    const maxZoom = ZOOM_STEPS[ZOOM_STEPS.length - 1]

    if (label) {
      label.textContent = `${Math.round(level * 100)}%`
    }

    if (zoomIn) {
      zoomIn.disabled = level >= maxZoom - 0.01
    }

    if (zoomOut) {
      zoomOut.disabled = level <= 1.01
    }
  }

  showError() {
    this.container.removeEventListener('flipbook:ready', this.handleReady)
    this.container.removeEventListener('flipbook:pagechange', this.handlePageChange)
    this.container.removeEventListener('flipbook:zoomchange', this.handleZoomChange)
    this.container.removeEventListener('flipbook:error', this.handleError)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange)

    try {
      this.book?.destroy()
    } catch {
      // ignore teardown errors
    }

    this.book = null
    this.container.innerHTML = `
      <div class="flipbook-error" role="alert">
        <p>No se pudo cargar la revista. Por favor intentá descargar el PDF directamente.</p>
      </div>
    `
  }

  destroy() {
    this.container?.removeEventListener('flipbook:ready', this.handleReady)
    this.container?.removeEventListener('flipbook:pagechange', this.handlePageChange)
    this.container?.removeEventListener('flipbook:zoomchange', this.handleZoomChange)
    this.container?.removeEventListener('flipbook:error', this.handleError)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange)
    this.book?.destroy()
    this.book = null
  }
}
