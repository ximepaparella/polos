const NAV_LINKS = [
  { href: '/sobre-el-foro', label: 'Sobre el Foro' },
  { href: '/los-polos', label: 'Los Polos' },
  { href: '/la-escuela', label: 'La Escuela' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/publicaciones-facl', label: 'Publicaciones' },
  { href: '/contacto', label: 'Contacto' },
]

function normalizePath(path) {
  if (!path || path === '/') return '/'
  return path.replace(/\/$/, '')
}

function isActiveLink(href, pathname) {
  const linkPath = normalizePath(href)
  const currentPath = normalizePath(pathname)

  if (linkPath === '/') {
    return currentPath === '/'
  }

  return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`)
}

function buildNavbarHtml() {
  const linksHtml = NAV_LINKS.map(
    ({ href, label }) => `<li><a href="${href}">${label}</a></li>`
  ).join('')

  return `
    <nav class="navbar" aria-label="Principal">
      <div class="navbar__inner">
        <a class="navbar__logo" href="/" aria-label="FACL - Foro Argentino del Campo Lacaniano">
          <img
            class="navbar__logo-img"
            src="/assets/images/logo-facl.svg"
            alt=""
            width="159"
            height="40"
            decoding="async"
          >
        </a>
        <button
          type="button"
          class="navbar__hamburger"
          aria-label="Abrir menú"
          aria-expanded="false"
          aria-controls="navbar-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="navbar__links" id="navbar-menu">
          ${linksHtml}
        </ul>
      </div>
    </nav>
  `
}

function setActiveLink(links, pathname) {
  for (const link of links) {
    const active = isActiveLink(link.getAttribute('href'), pathname)
    link.classList.toggle('active', active)
    if (active) {
      link.setAttribute('aria-current', 'page')
    } else {
      link.removeAttribute('aria-current')
    }
  }
}

function closeMenu(hamburger, links) {
  hamburger.classList.remove('open')
  links.classList.remove('open')
  hamburger.setAttribute('aria-expanded', 'false')
  hamburger.setAttribute('aria-label', 'Abrir menú')
}

function openMenu(hamburger, links) {
  hamburger.classList.add('open')
  links.classList.add('open')
  hamburger.setAttribute('aria-expanded', 'true')
  hamburger.setAttribute('aria-label', 'Cerrar menú')
}

export function initNavbar() {
  if (document.querySelector('.navbar')) {
    return
  }

  document.body.insertAdjacentHTML('afterbegin', buildNavbarHtml())
  document.body.style.paddingTop = 'var(--nav-height)'

  const navbar = document.querySelector('.navbar')
  const hamburger = document.querySelector('.navbar__hamburger')
  const links = document.querySelector('.navbar__links')
  const linkElements = links.querySelectorAll('a')

  setActiveLink(linkElements, window.location.pathname)

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation()
    const isOpen = hamburger.classList.contains('open')

    if (isOpen) {
      closeMenu(hamburger, links)
    } else {
      openMenu(hamburger, links)
    }
  })

  document.addEventListener('click', (event) => {
    if (!navbar.contains(event.target)) {
      closeMenu(hamburger, links)
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu(hamburger, links)
    }
  })

  for (const link of linkElements) {
    link.addEventListener('click', () => {
      closeMenu(hamburger, links)
    })
  }
}
