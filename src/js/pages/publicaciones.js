import { initLayout } from '../init-layout.js'
import { getPublicaciones } from '../supabase-client.js'
import { FALLBACK_PUBLICACIONES } from '../../data/publicaciones-fallback.js'
import {
  renderCardPublicacion,
  renderCardPublicacionSkeleton,
} from '../components/card-publicacion.js'
import { renderDetalle } from './publicacion-detalle.js'

initLayout()

function showInitialSkeletons(grid) {
  grid.innerHTML = `${renderCardPublicacionSkeleton()}${renderCardPublicacionSkeleton()}`
}

async function renderListado() {
  const grid = document.getElementById('publicaciones-grid')

  if (!grid) {
    return
  }

  showInitialSkeletons(grid)
  grid.setAttribute('aria-busy', 'true')

  let publicaciones = []

  try {
    publicaciones = await getPublicaciones()
  } catch (error) {
    console.error('Error cargando publicaciones:', error)
    grid.setAttribute('aria-busy', 'false')
    grid.innerHTML =
      '<p class="publicaciones-grid__error" role="alert">No se pudieron cargar las publicaciones.</p>'
    return
  }

  if (!publicaciones.length) {
    publicaciones = FALLBACK_PUBLICACIONES
  }

  grid.setAttribute('aria-busy', 'false')
  grid.innerHTML = publicaciones.map(renderCardPublicacion).join('')
}

function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const querySlug = params.get('slug')

  if (querySlug) {
    return querySlug
  }

  const match = window.location.pathname.match(/\/publicaciones-facl\/([^/]+)\/?$/)

  if (match && match[1] !== 'index.html') {
    return decodeURIComponent(match[1])
  }

  return null
}

async function init() {
  const slug = getSlugFromUrl()

  if (slug) {
    await renderDetalle(slug)
    return
  }

  await renderListado()
}

init()
