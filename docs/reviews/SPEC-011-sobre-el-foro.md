# SPEC-011 — Sobre el Foro vs producción

**Producción:** https://campolacanianoarg.org/sobre-el-foro  
**Tests:** `npm run test:visual:sobre-el-foro`

## Hallazgos vs SPEC original

| Elemento | SPEC original | Producción (medido) |
|----------|---------------|---------------------|
| Hero | Playfair serif, fondo `--color-bg-alt` | Inter 72px, blanco, ilustración 318×248 |
| Título hero | Un `h1` con `br` + `span` | Dos `h1` centrados |
| Intro | Texto bold + párrafos | 2 párrafos centrados 18px en panel `#F2F2F2` |
| Historia | — | Título 48px alineado izquierda + cuerpo 18px |
| Polos | Lista bold | Líneas de texto 18px |
| Carta IFCL | Fondo `--color-bg-alt` | Centrado, H2 52px, botones Leer carta + Contacto |
| Coordinación | Grid 3×2 con bordes | Fila flex 6 ítems, nombre 22px/700 + polo 22px/400 |
| Miembros | Título único | "Miembros" 52px + subtítulo 18px, lista 3 columnas 16px |

## Arquitectura

- `src/data/miembros-facl.js` — 133 miembros extraídos de producción (reutilizable en SPEC-012)
- `src/js/pages/sobre-el-foro.js` — `initLayout()` + render de lista
- Textos estáticos en HTML; solo la lista de miembros se genera por JS

## Assets

- `public/assets/images/sobre-el-foro-illustration.png`

## Métricas validadas

- Desktop: H1 72px, intro `#F2F2F2`, 133 miembros, 6 coordinadores
- Mobile: H1 32px, miembros 1 columna
