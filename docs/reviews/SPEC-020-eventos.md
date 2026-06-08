# SPEC-020 — Eventos vs producción

**Producción:** https://campolacanianoarg.org/eventos  
**Tests:** `npm run test:visual:eventos`

## Hallazgos vs SPEC original

| Elemento | SPEC original | Producción (medido) |
|----------|---------------|---------------------|
| Grid | 2 columnas | 3 columnas (340px contenido, gap ~51px) |
| Imagen card | aspect-ratio 1 cuadrado | 372×195px rectangular |
| Label "Evento" | Sí | No visible en prod |
| Título card | H2 serif 24px | H6 22px/600 Inter |
| Instagram CTA | href="#" | Link "Ver instagram" sin href en prod; réplica usa `#` |
| Hero título | H2 | H1 local 52px centrado |

## Secciones

1. **Hero** — "Nuestros próximos eventos" 52px + subtítulo 18px, padding página `112px 64px`
2. **Grid** — 5 eventos con imagen, título, subtítulo, lugar, email, fechas, CTA "Ver más"
3. **CTA Instagram** — banner `cta-banner.png`, título blanco 52px

## Arquitectura

- `src/js/components/card-evento.js` — render + skeleton
- `src/js/pages/eventos.js` — `getEventos()` + fallback estático (5 eventos de prod)
- Assets en `public/assets/images/evento-*.png|jpg`

## Métricas validadas

- Desktop: título 52px, cards 22px, grid 3 columnas, 5 eventos, CTA blanco
- Mobile: título 33px, grid 1 columna
