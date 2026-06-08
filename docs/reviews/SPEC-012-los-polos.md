# SPEC-012 — Los Polos vs producción

**Producción:** https://campolacanianoarg.org/los-polos  
**Tests:** `npm run test:visual:los-polos`

## Hallazgos vs SPEC original

| Elemento | SPEC original | Producción (medido) |
|----------|---------------|---------------------|
| Estructura | 6 secciones alternando fondos con `h2` por polo | Hero gris + sección blanca "Miembros" con 3 columnas |
| Hero | — | Fondo `#F2F2F2`, label "Polos" 16px/600, título 52px, subtítulo 18px, CTAs |
| Título hero | — | `h2` en prod; `h1` local (semántica) con mismos estilos |
| Miembros | Lista por polo en secciones | Agrupados en 3 columnas (64 / 557 / 918 px) |
| Nombre polo | `h2` por sección | `h4` 26px/400 (local: `h3` con 20px token `--font-size-xl`) |
| Miembro | — | `p` 18px, line-height ~1.3 |
| Total miembros | — | 136 (70+23+11+16+10+6) |

## Distribución por columna

1. **Col 1 (473px):** Polo Buenos Aires  
2. **Col 2 (361px):** Polo NOA, Polo Salta  
3. **Col 3 (flex):** Polo Patagonia, Polo Mediterráneo, Polo Nuevo Cuyo (+40px top en Nuevo Cuyo)

## Arquitectura

- `src/data/polos-facl.js` — `POLOS_PAGE` + `POLOS_COLUMNS`
- `src/js/pages/los-polos.js` — `initLayout()` + render de subtítulo y columnas
- Textos del hero en HTML; subtítulo y listas generados por JS desde datos

## Métricas validadas

- Desktop: hero `#F2F2F2` padding `71px 64px 112px`, título 52px, 6 polos, 136 miembros, 3 columnas
- Mobile: título 33px, subtítulo 14px, 1 columna
