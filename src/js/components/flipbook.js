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

  async renderPage(pdf, pageNum) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport,
    }).promise

    return canvas.toDataURL('image/jpeg', 0.85)
  }

  initPageFlip(images) {
    const flipContainer = document.createElement('div')
    flipContainer.id = 'flip-container'
    flipContainer.className = 'flipbook__container'
    this.container.appendChild(flipContainer)

    this.pageFlip = new PageFlip(flipContainer, this.options)
    this.pageFlip.loadFromImages(images)

    this.pageFlip.on('flip', (event) => {
      this.updatePageCounter(event.data + 1)
    })
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

    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      this.container?.requestFullscreen?.()
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
