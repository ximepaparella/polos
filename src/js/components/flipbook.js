import { PageFlip } from 'page-flip'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export class Flipbook {
  constructor(containerId, pdfUrl, options = {}) {
    this.container = document.getElementById(containerId)
    this.pdfUrl = pdfUrl
    this.pageFlip = null
    this.totalPages = 0
    this.options = {
      width: options.width || 550,
      height: options.height || 733,
      size: 'stretch',
      minWidth: 280,
      maxWidth: 864,
      minHeight: 360,
      maxHeight: 733,
      showCover: true,
      mobileScrollSupport: true,
      useMouseEvents: true,
      ...options,
    }

    this.handleDisplayChange = () => {
      requestAnimationFrame(() => {
        this.enhanceCanvasResolution()
      })
    }
  }

  async init() {
    if (!this.container) {
      return
    }

    this.showLoading()

    try {
      const pdf = await pdfjsLib.getDocument(this.pdfUrl).promise
      this.totalPages = pdf.numPages

      const images = []

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        this.updateLoadingProgress(pageNum, pdf.numPages)
        const imageDataUrl = await this.renderPage(pdf, pageNum)
        images.push(imageDataUrl)
      }

      this.hideLoading()
      this.initPageFlip(images)
      this.initControls()
    } catch (error) {
      console.error('Error cargando PDF:', error)
      this.showError()
    }
  }

  getEstimatedBookWidth() {
    const sectionInner = this.container?.closest('.flipbook-section__inner')
    const containerWidth = sectionInner?.clientWidth || this.container?.clientWidth

    if (containerWidth) {
      return Math.min(this.options.maxWidth, containerWidth)
    }

    return Math.min(this.options.maxWidth, Math.max(this.options.width, window.innerWidth - 80))
  }

  getPdfRenderScale(page) {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5)
    const baseViewport = page.getViewport({ scale: 1 })
    const bookWidth = this.getEstimatedBookWidth()
    const pageDisplayWidth = bookWidth / 2
    const pageDisplayHeight = pageDisplayWidth * (this.options.height / this.options.width)
    const margin = 1.2

    const targetWidth = pageDisplayWidth * pixelRatio * margin
    const targetHeight = pageDisplayHeight * pixelRatio * margin

    const scaleX = targetWidth / baseViewport.width
    const scaleY = targetHeight / baseViewport.height

    return Math.min(Math.max(scaleX, scaleY, 1.5), 4)
  }

  async renderPage(pdf, pageNum) {
    const page = await pdf.getPage(pageNum)
    const scale = this.getPdfRenderScale(page)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = viewport.width
    canvas.height = viewport.height

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'

    await page.render({
      canvasContext: context,
      viewport,
    }).promise

    return canvas.toDataURL('image/jpeg', 0.95)
  }

  initPageFlip(images) {
    const flipContainer = document.createElement('div')
    flipContainer.id = 'flip-container'
    flipContainer.className = 'flipbook__container'
    this.container.appendChild(flipContainer)

    this.pageFlip = new PageFlip(flipContainer, this.options)
    this.pageFlip.on('init', () => {
      this.patchCanvasUpdate()
      requestAnimationFrame(() => {
        this.enhanceCanvasResolution()
      })
    })
    this.pageFlip.loadFromImages(images)
    this.patchCanvasUpdate()

    window.addEventListener('resize', this.handleDisplayChange)
    document.addEventListener('fullscreenchange', this.handleDisplayChange)

    this.pageFlip.on('flip', (event) => {
      this.updatePageCounter(event.data + 1)
    })
  }

  patchCanvasUpdate() {
    const ui = this.pageFlip?.getUI()

    if (!ui || ui._canvasDpiPatched) {
      return
    }

    const originalUpdate = ui.update.bind(ui)
    ui.update = () => {
      originalUpdate()
      this.enhanceCanvasResolution()
    }
    ui._canvasDpiPatched = true
  }

  enhanceCanvasResolution() {
    const canvas = this.container?.querySelector('.stf__canvas')

    if (!canvas || !this.pageFlip) {
      return
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.5)
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight

    if (!displayWidth || !displayHeight) {
      return
    }

    const targetWidth = Math.floor(displayWidth * pixelRatio)
    const targetHeight = Math.floor(displayHeight * pixelRatio)

    if (canvas.width === targetWidth && canvas.height === targetHeight) {
      return
    }

    canvas.width = targetWidth
    canvas.height = targetHeight

    const context = canvas.getContext('2d')
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

    this.pageFlip.getRender().update()
  }

  initControls() {
    const controls = document.getElementById('flipbook-controls')

    if (!controls) {
      return
    }

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      this.pageFlip?.flipPrev()
    })

    document.getElementById('btn-next')?.addEventListener('click', () => {
      this.pageFlip?.flipNext()
    })

    document.getElementById('btn-fullscreen')?.addEventListener('click', async () => {
      const target = this.container?.closest('.flipbook-section') || this.container

      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }

      await target?.requestFullscreen?.()
    })

    this.updatePageCounter(1)
  }

  updatePageCounter(current) {
    const counter = document.getElementById('page-counter')

    if (counter) {
      counter.textContent = `${current} / ${this.totalPages}`
    }
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="flipbook-loading" role="status" aria-live="polite">
        <div class="flipbook-loading__spinner" aria-hidden="true"></div>
        <p id="loading-text" class="flipbook-loading__text">Cargando revista...</p>
      </div>
    `
  }

  updateLoadingProgress(current, total) {
    const el = document.getElementById('loading-text')

    if (el) {
      el.textContent = `Cargando página ${current} de ${total}...`
    }
  }

  hideLoading() {
    const loading = this.container.querySelector('.flipbook-loading')

    if (loading) {
      loading.remove()
    }
  }

  showError() {
    this.container.innerHTML = `
      <div class="flipbook-error" role="alert">
        <p>No se pudo cargar la revista. Por favor intentá descargar el PDF directamente.</p>
      </div>
    `
  }
}
