# SPEC-010 — Home vs producción

**Producción:** https://campolacanianoarg.org/  
**Tests:** `npm run test:visual:home`

## Hallazgos vs SPEC original

La SPEC-010 original describe hero con logo blanco, Playfair serif y cards con borde 3/4. **Producción usa otro diseño:**

| Elemento | Producción (medido) | Implementado |
|----------|---------------------|--------------|
| Hero altura | 684px desktop / 754px mobile | `--hero-height-desktop` |
| Hero H1 | Inter 72px/500, blanco, centrado | `.hero__title` |
| Hero texto | Inter 16px blanco | `.hero__text` |
| Hero CTAs | Negro + ghost `rgba(255,255,255,0.15)`, 48px, radius 12px | `.btn-primary` + `.btn-hero-ghost` |
| Sin logo en hero | Solo imagen de fondo | Sin `.hero__logo` |
| CTA publicaciones | Fondo `#EEEEEE`, logo SIC, título 52px | `.publicaciones-cta` |
| Franja decorativa | SVG 11px entre secciones | `.section-border` (reutiliza asset del footer) |
| Blog label | Inter 16px/600 "Blog" | `.section-label` |
| Título blog | 52px/500 | `.ultimas-publicaciones__title` |
| Cards | Imagen 404×206 + botón "Ver más" negro | `card-publicacion.js` |
| Card body | H4 26px, desc 16px, fecha 18px gris, subtítulo 18px | `card-publicacion.css` |

## Arquitectura (sin duplicar)

- `init-layout.js` — navbar + footer (usado por `common.js` y `home.js`)
- `components/card-publicacion.js` — render reutilizable para SPEC-021
- `utils/escape-html.js` — sanitización en templates dinámicos
- Fallback estático en `home.js` si Supabase no devuelve datos (réplica visual en dev)

## Assets

- `public/assets/images/hero-bg.png`
- `public/assets/images/sic-logo.png`
- `public/assets/images/witz-cover.jpg`
- `public/assets/images/textos-simposio.jpg`

## Métricas validadas

- Desktop: H1 72px, CTA `#EEEEEE`, ≥2 cards
- Mobile: H1 32px
