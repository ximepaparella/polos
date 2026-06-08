import { initLayout } from '../init-layout.js'
import { MIEMBROS_FACL } from '../../data/miembros-facl.js'
import { escapeHtml } from '../utils/escape-html.js'

initLayout()

function renderMiembros() {
  const list = document.getElementById('miembros-list')

  if (!list) {
    return
  }

  list.innerHTML = MIEMBROS_FACL.map(
    (miembro) => `<li>${escapeHtml(miembro)}</li>`
  ).join('')
}

renderMiembros()
