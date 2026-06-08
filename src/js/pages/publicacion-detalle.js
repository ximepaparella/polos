import {
  getPublicacionBySlug,
  getPublicacionesAdyacentes,
  formatFecha,
} from '../supabase-client.js'
import {
  getPublicacionFallback,
  getPublicacionesAdyacentesFallback,
} from '../../data/publicaciones-fallback.js'
import { escapeHtml } from '../utils/escape-html.js'
import { Flipbook } from '../components/flipbook.js'

function updateMeta(publicacion) {
  document.title = `${publicacion.titulo} | FACL`

  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', publicacion.descripcion || publicacion.titulo)

  document
    .querySelector('meta[property="og:title"]')
    ?.setAttribute('content', `${publicacion.titulo} | FACL`)

  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute('content', publicacion.descripcion || publicacion.titulo)

  document
    .querySelector('meta[property="og:url"]')
    ?.setAttribute(
      'content',
      `https://campolacanianoarg.org/publicaciones-facl?slug=${encodeURIComponent(publicacion.slug)}`
    )

  if (publicacion.imagen_url) {
    const imageUrl = publicacion.imagen_url.startsWith('http')
      ? publicacion.imagen_url
      : `https://campolacanianoarg.org${publicacion.imagen_url}`

    document.querySelector('meta[property="og:image"]')?.setAttribute('content', imageUrl)
  }
}

function renderTags(publicacion) {
  const tags = publicacion.tags ?? (publicacion.subtitulo ? [publicacion.subtitulo] : [])

  return tags
    .map((tag) => `<p class="publicacion-detalle__tag">${escapeHtml(tag)}</p>`)
    .join('')
}

function getFlipbookSize() {
  const width = Math.min(550, Math.max(280, window.innerWidth - 80))
  const height = Math.min(733, Math.round(width * (733 / 550)))

  return { width, height }
}

export async function renderDetalle(slug) {
  const main = document.querySelector('main')

  if (!main) {
    return
  }

  main.innerHTML =
    '<div class="loading-skeleton publicacion-detalle__loading" style="min-height: 600px" aria-busy="true"></div>'

  let publicacion = await getPublicacionBySlug(slug)

  if (!publicacion) {
    publicacion = getPublicacionFallback(slug)
  }

  if (!publicacion) {
    main.innerHTML = `
      <div class="publicacion-detalle__not-found">
        <h1>Publicación no encontrada</h1>
        <a href="/publicaciones-facl" class="btn btn-primary">Volver a publicaciones</a>
      </div>
    `
    return
  }

  updateMeta(publicacion)

  let adyacentes = await getPublicacionesAdyacentes(slug, publicacion.fecha)

  if (!adyacentes.prev && !adyacentes.next) {
    adyacentes = getPublicacionesAdyacentesFallback(slug, publicacion.fecha)
  }

  const { prev, next } = adyacentes

  main.innerHTML = `
    <article class="publicacion-detalle">
      <section class="publicacion-detalle__cover" aria-label="Portada">
        <div class="publicacion-detalle__cover-inner">
          <img
            class="publicacion-detalle__cover-img"
            src="${escapeHtml(publicacion.imagen_url)}"
            alt="Portada de ${escapeHtml(publicacion.titulo)}"
            width="864"
            height="314"
            fetchpriority="high"
            decoding="async"
          >
        </div>
      </section>

      <section class="publicacion-detalle__info" aria-label="Información de la publicación">
        <div class="publicacion-detalle__info-inner">
          <h1 class="publicacion-detalle__title">${escapeHtml(publicacion.titulo)}</h1>
          ${publicacion.subtitulo ? `<p class="publicacion-detalle__subtitle">${escapeHtml(publicacion.subtitulo)}</p>` : ''}
          ${publicacion.descripcion ? `<p class="publicacion-detalle__desc">${escapeHtml(publicacion.descripcion)}</p>` : ''}
          <div class="publicacion-detalle__meta">
            ${renderTags(publicacion)}
            <time class="publicacion-detalle__date" datetime="${escapeHtml(publicacion.fecha)}">${escapeHtml(formatFecha(publicacion.fecha))}</time>
          </div>
          ${publicacion.pdf_url
            ? `<a href="${escapeHtml(publicacion.pdf_url)}" class="btn btn-primary publicacion-detalle__download" download target="_blank" rel="noopener noreferrer">Descargar Publicación</a>`
            : ''}
        </div>
      </section>

      <section class="flipbook-section" aria-label="Visor de revista">
        <div class="flipbook-section__inner">
          <h2 class="flipbook-section__title">Leer publicación</h2>
          <div id="flipbook-wrapper"></div>
          <div class="flipbook-controls" id="flipbook-controls">
            <button type="button" id="btn-prev" class="btn btn-secondary" aria-label="Página anterior">← Anterior</button>
            <span id="page-counter" aria-live="polite">1 / ?</span>
            <button type="button" id="btn-next" class="btn btn-primary" aria-label="Página siguiente">Siguiente →</button>
            <button type="button" id="btn-fullscreen" class="btn btn-secondary" aria-label="Pantalla completa">Pantalla completa</button>
          </div>
        </div>
      </section>

      <nav class="publicacion-nav" aria-label="Otras publicaciones">
        <div class="publicacion-nav__inner">
          ${prev
            ? `<a href="/publicaciones-facl?slug=${encodeURIComponent(prev.slug)}" class="publicacion-nav__link">‹ ${escapeHtml(prev.titulo)}</a>`
            : '<span class="publicacion-nav__spacer" aria-hidden="true"></span>'}
          ${next
            ? `<a href="/publicaciones-facl?slug=${encodeURIComponent(next.slug)}" class="publicacion-nav__link">${escapeHtml(next.titulo)} ›</a>`
            : ''}
        </div>
      </nav>
    </article>
  `

  if (publicacion.pdf_url) {
    const { width, height } = getFlipbookSize()
    const flipbook = new Flipbook('flipbook-wrapper', publicacion.pdf_url, { width, height })
    await flipbook.init()
  }
}
