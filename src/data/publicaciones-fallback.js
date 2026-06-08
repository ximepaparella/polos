export const FALLBACK_PUBLICACIONES = [
  {
    slug: 'revista-de-psicoanalisis-de-la-epfcl-alsur',
    titulo: 'WITZ',
    subtitulo: 'Revista de Psicoanálisis de la EPFCL América Latina Sur',
    descripcion:
      'Esta revista recoge parte del trabajo propiciado en las Jornadas de Escuela y de Carteles que se llevaron a cabo en Salta (2022) y en Mendoza (2023). "Los tiempos del acto analítico" es el título que nos lleva a partir de una afirmación: el acto analítico no es reductible al final del análisis, aunque encuentra allí una encrucijada precisa: la del pasaje de analizante a analista.',
    fecha: '2026-01-21',
    imagen_url: '/assets/images/witz-cover.jpg',
    pdf_url: '/assets/pdfs/witz-1.pdf',
    tags: ['Revista WITZ 1 ISSN (en línea) 3072-9394'],
    issn: 'ISSN (En línea) 3072-9394',
  },
  {
    slug: 'textos',
    titulo: 'Textos VI SIMPOSIO ESP',
    subtitulo: 'Acceso a los textos en español del VI Simposio Interamericano de la IF - EPFCL',
    descripcion: '',
    fecha: '2025-08-27',
    imagen_url: '/assets/images/textos-simposio.jpg',
    pdf_url: '/assets/pdfs/textos-vi-simposio.pdf',
    tags: ['VARIOS'],
    issn: null,
  },
]

const SLUG_ALIASES = {
  'textos-vi-simposio-esp': 'textos',
}

export function getPublicacionFallback(slug) {
  const resolvedSlug = SLUG_ALIASES[slug] ?? slug
  return FALLBACK_PUBLICACIONES.find((item) => item.slug === resolvedSlug) ?? null
}

export function getPublicacionesAdyacentesFallback(slug, fecha) {
  const sorted = [...FALLBACK_PUBLICACIONES].sort((a, b) =>
    a.fecha < b.fecha ? 1 : -1
  )
  const index = sorted.findIndex((item) => item.slug === (SLUG_ALIASES[slug] ?? slug))

  if (index === -1) {
    return { prev: null, next: null }
  }

  return {
    prev: sorted[index + 1] ? { slug: sorted[index + 1].slug, titulo: sorted[index + 1].titulo } : null,
    next: sorted[index - 1] ? { slug: sorted[index - 1].slug, titulo: sorted[index - 1].titulo } : null,
  }
}
