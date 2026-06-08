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
export function renderCardPublicacion(publicacion) {
  const {
    slug,
    titulo,
    subtitulo = '',
    descripcion = '',
    fecha,
    imagen_url: imagenUrl,
    tags = [],
  } = publicacion

  const href = `/publicaciones-facl?slug=${encodeURIComponent(slug)}`
  const metaLine = tags[0] || descripcion

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
          <time class="card-publicacion__date" datetime="${escapeHtml(fecha)}">${escapeHtml(formatFecha(fecha))}</time>
          ${metaLine ? `<p class="card-publicacion__meta">${escapeHtml(metaLine)}</p>` : ''}
        </div>
        <a href="${href}" class="card-publicacion__cta">Ver más</a>
      </div>
    </article>
  `
}

export function renderCardPublicacionSkeleton() {
  return '<div class="loading-skeleton card-publicacion__skeleton" aria-hidden="true"></div>'
}
