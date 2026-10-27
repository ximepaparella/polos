import { initLayout } from '../init-layout.js'
import { POLOS_PAGE, POLOS_LOGOS } from '../../data/polos-facl.js'
import { escapeHtml } from '../utils/escape-html.js'

initLayout()

function renderHeroSubtitle() {
  const subtitle = document.getElementById('polos-hero-subtitle')

  if (!subtitle) {
    return
  }

  subtitle.textContent = POLOS_PAGE.subtitle
}

const POLO_MARK = `
  <img
    class="polos-logo__mark"
    src="/assets/images/polos/polo-mark.svg"
    alt=""
    width="40"
    height="40"
    decoding="async"
    aria-hidden="true"
  >
`

function renderLogoItem(logo) {
  const label = logo.name
  const wordmark = `
    <span class="polos-logo">
      ${POLO_MARK}
      <span class="polos-logo__text">
        <span class="polos-logo__facl">FACL</span>
        <span class="polos-logo__name">${escapeHtml(logo.name)}</span>
      </span>
    </span>
  `

  if (logo.href) {
    return `
      <a
        class="polos-hero__logo-link"
        href="${escapeHtml(logo.href)}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="${escapeHtml(label)}"
      >${wordmark}</a>
    `
  }

  return `<span class="polos-hero__logo-item">${wordmark}</span>`
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

  container.innerHTML = POLOS_PAGE.polos
    .map((polo) => `
      <article class="polos-polo">
        <h3 class="polos-polo__name">${escapeHtml(polo.name)}</h3>
        <ul class="polos-polo__members" role="list">
          ${polo.members.map((member) => `<li class="polos-polo__member">${escapeHtml(member)}</li>`).join('')}
        </ul>
      </article>
    `)
    .join('')
}

renderHeroSubtitle()
renderLogos()
renderPolos()
