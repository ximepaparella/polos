import { initLayout } from '../init-layout.js'
import { POLOS_PAGE, POLOS_COLUMNS, POLOS_LOGOS } from '../../data/polos-facl.js'
import { escapeHtml } from '../utils/escape-html.js'

initLayout()

function renderHeroSubtitle() {
  const subtitle = document.getElementById('polos-hero-subtitle')

  if (!subtitle) {
    return
  }

  subtitle.textContent = POLOS_PAGE.subtitle
}

function renderLogoItem(logo) {
  const img = `
    <img
      src="${escapeHtml(logo.src)}"
      alt="${escapeHtml(logo.alt)}"
      width="${logo.width}"
      height="${logo.height}"
      loading="lazy"
      decoding="async"
    >
  `

  if (logo.href) {
    return `
      <a
        class="polos-hero__logo-link"
        href="${escapeHtml(logo.href)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="${escapeHtml(logo.alt)}"
      >${img}</a>
    `
  }

  return `<span class="polos-hero__logo-item">${img}</span>`
}

function renderLogos() {
  const container = document.getElementById('polos-hero-logos')

  if (!container) {
    return
  }

  const items = POLOS_LOGOS.map(renderLogoItem).join('')
  container.innerHTML = `
    <div class="polos-hero__logos-track" aria-hidden="false">
      ${items}
      ${items}
    </div>
  `
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
renderLogos()
renderPolos()
