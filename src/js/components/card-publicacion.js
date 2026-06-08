import { escapeHtml } from '../utils/escape-html.js'
import { formatFecha } from '../supabase-client.js'

/**
 * @param {object} publicacion
 * @param {string} publicacion.slug
 * @param {string} publicacion.titulo
 * @param {string} [publicacion.subtitulo]
 * @param {string} [publicacion.descripcion]
 * @param {string} publicacion.fecha
 * @param {string} publicacion.imagen_url
 * @param {string[]} [publicacion.tags]
 */
/**
 * @param {object} [options]
 * @param {string} [options.href]
 * @param {boolean} [options.external]
 * @param {string} [options.fechaLabel]
 */
export function renderCardPublicacion(publicacion, options = {}) {
  const {
    slug,
    titulo,
    subtitulo = '',
    descripcion = '',
    fecha,
    imagen_url: imagenUrl,
    tags = [],
  } = publicacion

  const { href: hrefOverride, external = false, fechaLabel } = options
  const href = hrefOverride ?? `/publicaciones-facl?slug=${encodeURIComponent(slug)}`
  const dateText = fechaLabel ?? formatFecha(fecha)
  const metaLine = tags[0] || descripcion
  const externalAttrs = external
    ? ' target="_blank" rel="noopener noreferrer"'
    : ''

  return `
    <article class="card-publicacion">
      <div class="card-publicacion__media">
        <img
          src="${escapeHtml(imagenUrl)}"
          alt="Portada de ${escapeHtml(titulo)}"
          width="404"
          height="206"
          loading="lazy"
          decoding="async"
        >
      </div>
      <div class="card-publicacion__body">
        <div class="card-publicacion__copy">
          <h4 class="card-publicacion__title">${escapeHtml(titulo)}</h4>
          ${subtitulo ? `<p class="card-publicacion__subtitle">${escapeHtml(subtitulo)}</p>` : ''}
          <time class="card-publicacion__date" datetime="${escapeHtml(fecha)}">${escapeHtml(dateText)}</time>
          ${metaLine ? `<p class="card-publicacion__meta">${escapeHtml(metaLine)}</p>` : ''}
        </div>
        <a href="${escapeHtml(href)}" class="card-publicacion__cta"${externalAttrs}>Ver más</a>
      </div>
    </article>
  `
}

export function renderCardPublicacionSkeleton() {
  return '<div class="loading-skeleton card-publicacion__skeleton" aria-hidden="true"></div>'
}
