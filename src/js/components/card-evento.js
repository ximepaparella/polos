import { escapeHtml } from '../utils/escape-html.js'
import { formatFecha } from '../supabase-client.js'

/**
 * @param {object} evento
 */
export function renderCardEvento(evento) {
  const {
    titulo,
    subtitulo = '',
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin = null,
    lugar = '',
    email = '',
    email_prefijo: emailPrefijo = '',
    imagen_url: imagenUrl,
    link_externo: linkExterno = '',
  } = evento

  const fechaInicioLabel = formatFecha(fechaInicio)
  const fechaFinLabel = fechaFin ? formatFecha(fechaFin) : null
  const emailLine = email ? `${emailPrefijo}${email}` : ''
  const emailHref = email ? `mailto:${email}` : ''

  return `
    <article class="card-evento">
      <div class="card-evento__media">
        <img
          src="${escapeHtml(imagenUrl)}"
          alt="${escapeHtml(titulo)}"
          width="372"
          height="195"
          loading="lazy"
          decoding="async"
        >
      </div>
      <div class="card-evento__body">
        <h2 class="card-evento__title">${escapeHtml(titulo)}</h2>
        ${subtitulo ? `<p class="card-evento__subtitle">${escapeHtml(subtitulo)}</p>` : ''}
        ${lugar ? `<p class="card-evento__meta">${escapeHtml(lugar)}</p>` : ''}
        ${emailLine
          ? `<p class="card-evento__meta">${emailPrefijo ? escapeHtml(emailPrefijo) : ''}${email ? `<a href="${escapeHtml(emailHref)}" class="card-evento__email">${escapeHtml(email)}</a>` : ''}</p>`
          : ''}
        <div class="card-evento__fechas">
          <time datetime="${escapeHtml(fechaInicio)}">${escapeHtml(fechaInicioLabel)}</time>
          ${fechaFinLabel && fechaFinLabel !== fechaInicioLabel
            ? `<span class="card-evento__fechas-sep" aria-hidden="true"> — </span><time datetime="${escapeHtml(fechaFin)}">${escapeHtml(fechaFinLabel)}</time>`
            : ''}
        </div>
        ${linkExterno
          ? `<a href="${escapeHtml(linkExterno)}" class="btn btn-primary card-evento__cta" target="_blank" rel="noopener noreferrer">Ver más</a>`
          : ''}
      </div>
    </article>
  `
}

export function renderCardEventoSkeleton() {
  return `
    <div class="card-evento card-evento--skeleton" aria-hidden="true">
      <div class="loading-skeleton card-evento__media-skeleton"></div>
      <div class="loading-skeleton card-evento__body-skeleton"></div>
    </div>
  `
}
