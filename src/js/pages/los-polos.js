import { initLayout } from '../init-layout.js'
import { POLOS_PAGE, POLOS_COLUMNS } from '../../data/polos-facl.js'
import { escapeHtml } from '../utils/escape-html.js'

initLayout()

function renderHeroSubtitle() {
  const subtitle = document.getElementById('polos-hero-subtitle')

  if (!subtitle) {
    return
  }

  subtitle.textContent = POLOS_PAGE.subtitle
}

function renderPolos() {
  const container = document.getElementById('polos-columns')

  if (!container) {
    return
  }

  const poloMap = new Map(POLOS_PAGE.polos.map((polo) => [polo.name, polo.members]))

  container.innerHTML = POLOS_COLUMNS.map((columnPolos) => {
    const blocks = columnPolos
      .map((name) => {
        const members = poloMap.get(name) ?? []
        const spacedClass = name === 'Polo Nuevo Cuyo' ? ' polos-polo--spaced' : ''

        return `
          <article class="polos-polo${spacedClass}">
            <h3 class="polos-polo__name">${escapeHtml(name)}</h3>
            <div class="polos-polo__members">
              ${members.map((member) => `<p>${escapeHtml(member)}</p>`).join('')}
            </div>
          </article>
        `
      })
      .join('')

    return `<div class="polos-columns__col">${blocks}</div>`
  }).join('')
}

renderHeroSubtitle()
renderPolos()
