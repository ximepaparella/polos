const SITEMAP_COL_1 = [
  { href: '/sobre-el-foro', label: 'Sobre el Foro' },
  { href: '/los-polos', label: 'Los Polos' },
  { href: '/la-escuela', label: 'La Escuela' },
]

const SITEMAP_COL_2 = [
  { href: '/eventos', label: 'Eventos' },
  { href: '/publicaciones-facl', label: 'Publicaciones' },
  { href: '/contacto', label: 'Contacto' },
]

function buildSitemapColumn(links) {
  return links
    .map(({ href, label }) => `<a href="${href}">${label}</a>`)
    .join('')
}

function buildFooterHtml() {
  return `
    <footer class="footer">
      <div class="footer__main">
        <div class="footer__brand-contact">
          <img
            class="footer__mark"
            src="/assets/images/footer-mark.svg"
            alt=""
            width="134"
            height="138"
            loading="lazy"
            decoding="async"
          >
          <div class="footer__contact">
            <h6 class="footer__contact-label">Contacto</h6>
            <h4 class="footer__email">
              <a href="mailto:foroargcl@gmail.com">foroargcl@gmail.com</a>
            </h4>
          </div>
        </div>
        <div class="footer__sitemap-block">
          <p class="footer__sitemap-title">Mapa del sitio</p>
          <nav class="footer__sitemap" aria-label="Mapa del sitio">
            <div class="footer__sitemap-col">
              ${buildSitemapColumn(SITEMAP_COL_1)}
            </div>
            <div class="footer__sitemap-col">
              ${buildSitemapColumn(SITEMAP_COL_2)}
            </div>
          </nav>
        </div>
      </div>
      <div class="footer__legal">
        <div class="footer__divider" aria-hidden="true">
          <img
            src="/assets/images/footer-divider.svg"
            alt=""
            width="1375"
            height="3"
            loading="lazy"
            decoding="async"
          >
        </div>
        <p class="footer__copyright">© 2025 FACL. Todos los derechos reservados.</p>
      </div>
      <div class="footer__border-bottom" aria-hidden="true">
        <img
          src="/assets/images/footer-border-bottom.svg"
          alt=""
          width="1417"
          height="17"
          loading="lazy"
          decoding="async"
        >
      </div>
    </footer>
  `
}

export function initFooter() {
  if (document.querySelector('.footer')) {
    return
  }

  document.body.insertAdjacentHTML('beforeend', buildFooterHtml())
}
