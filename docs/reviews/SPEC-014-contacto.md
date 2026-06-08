# SPEC-014 — Contacto vs producción

**Producción:** https://campolacanianoarg.org/contacto  
**Tests:** `npm run test:visual:contacto`

## Hallazgos vs SPEC original

| Elemento | SPEC original | Producción (medido) |
|----------|---------------|---------------------|
| Título contacto | H2 | H2 prod / H1 local (semántica) 52px centrado |
| Email oficial | mailto | Texto plano en prod; mailto en réplica |
| Formulario | 240px, labels 12px | Centrado, inputs 40px alto, botón negro |
| Ubicaciones | Grid 3 columnas de cards | Lista vertical + mapa lado a lado |
| Polo nombre | H3 en cards | H4 22px/300 en prod; H3 local |
| Mapa | 400px alto | 600×450px iframe |

## Secciones

1. **Contacto principal** — padding `132px 64px 189px`, título 52px, intro 16px, formulario suscripción
2. **Ubicaciones** — padding `112px 64px`, label 16px, título 52px, 6 polos + Google Maps

## Arquitectura

- `src/js/pages/contacto.js` — `initLayout()` + submit con `suscribir()` (Supabase)
- Formulario con atributos Netlify (`data-netlify`, honeypot) + preventDefault para Supabase
- Textos y polos estáticos en HTML

## Métricas validadas

- Desktop: padding contacto/ubicaciones, títulos 52px, 6 polos, formulario, mapa
- Mobile: títulos 33px, layout en columna única
