# SPEC-021 — Publicaciones (listado) vs producción

**Producción:** https://campolacanianoarg.org/publicaciones-facl  
**Tests:** `npm run test:visual:publicaciones`

## Hallazgos vs SPEC original

| Elemento | SPEC original | Producción (medido) |
|----------|---------------|---------------------|
| Hero H1 | "PUBLICACIONES IF - EPFCL ALS" | 72px centrado, breadcrumb 16px/600 |
| Intro título | H2 en SPEC | P 48px centrado en prod; H2 local |
| Grid | 2 columnas | 2 columnas, gap 26px, cards ~404px |
| Card | Componente propio en SPEC | Reutiliza `card-publicacion` de SPEC-010 |
| Detalle `?slug=` | Mismo archivo (SPEC-022) | Pendiente — listado only por ahora |

## Secciones

1. **Hero** — breadcrumb, H1 72px, texto 18px, CTAs "Ver publicaciones" + "Sobre el foro"
2. **Intro** — label 16px, título 48px, texto 18px centrado
3. **Grid** — `getPublicaciones()` + fallback 2 publicaciones (WITZ + Textos VI Simposio)

## Arquitectura

- `src/js/pages/publicaciones.js` — `initLayout()` + skeletons + render
- `src/js/components/card-publicacion.js` — reutilizado
- Links a detalle: `/publicaciones-facl?slug=...` (detalle en SPEC-022)

## Métricas validadas

- Desktop: H1 72px, intro 48px, cards 26px, grid 2 cols, 2 publicaciones
- Mobile: H1 32px, grid 1 col
