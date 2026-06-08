import { initLayout } from '../init-layout.js'
import { getPublicaciones } from '../supabase-client.js'
import { FALLBACK_PUBLICACIONES } from '../../data/publicaciones-fallback.js'
import {
  renderCardPublicacion,
  renderCardPublicacionSkeleton,
} from '../components/card-publicacion.js'

initLayout()

async function renderUltimasPublicaciones() {
  const grid = document.getElementById('ultimas-publicaciones-grid')

  if (!grid) {
    return
  }

  grid.setAttribute('aria-busy', 'true')

  let publicaciones = []

  try {
    publicaciones = await getPublicaciones(2)
  } catch (error) {
    console.error('Error cargando publicaciones:', error)
    grid.setAttribute('aria-busy', 'false')
    grid.innerHTML = '<p class="publicaciones-grid__error" role="alert">No se pudieron cargar las publicaciones.</p>'
    return
  }

  if (!publicaciones.length) {
    publicaciones = FALLBACK_PUBLICACIONES
  }

  grid.setAttribute('aria-busy', 'false')
  grid.innerHTML = publicaciones.map(renderCardPublicacion).join('')
}

function showInitialSkeletons() {
  const grid = document.getElementById('ultimas-publicaciones-grid')

  if (!grid || grid.children.length > 0) {
    return
  }

  grid.innerHTML = `${renderCardPublicacionSkeleton()}${renderCardPublicacionSkeleton()}`
}

showInitialSkeletons()
renderUltimasPublicaciones()
