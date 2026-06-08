# SPEC-022/023 — Publicación detalle + Flipbook vs producción

**Producción:**  
- https://campolacanianoarg.org/publicaciones-facl/revista-de-psicoanalisis-de-la-epfcl-alsur  
- https://campolacanianoarg.org/publicaciones-facl/textos  

**Tests:** `npm run test:visual:publicacion-detalle`

## Hallazgos vs SPEC original

| Elemento | SPEC original | Producción (medido) | Réplica |
|----------|---------------|---------------------|---------|
| Layout hero | Grid 300px + info | Portada banner 864×314 + info apilada | Banner + info apilada |
| Visor | StPageFlip + PDF.js | iframe oculto en Framer | StPageFlip + PDF.js (SPEC) |
| Routing | `?slug=` | Path `/publicaciones-facl/[slug]` | Ambos soportados |
| Slug textos | textos-vi-simposio-esp | `textos` | `textos` (+ alias legacy) |

## Arquitectura

- `src/js/pages/publicaciones.js` — routing listado vs detalle
- `src/js/pages/publicacion-detalle.js` — render + meta dinámica
- `src/js/components/flipbook.js` — PDF.js → imágenes → PageFlip
- `src/data/publicaciones-fallback.js` — datos + PDFs locales
- `public/assets/pdfs/witz-1.pdf`, `textos-vi-simposio.pdf`

## Dependencias

- `page-flip` (StPageFlip)
- `pdfjs-dist`

## Métricas validadas

- Desktop: título 52px, subtítulo 16px, portada 314px, descarga, controles flipbook, nav prev/next
- Flipbook: carga PDF y muestra contador de páginas
