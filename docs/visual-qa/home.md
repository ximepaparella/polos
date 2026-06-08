# Visual QA — Home

**Fuente:** `~/Desktop/foro/html/home.html` + screenshots desktop/mobile.

## Gaps corregidos

| Bloque | Producción (Framer) | Antes | Después |
|--------|---------------------|-------|---------|
| Hero bg | `2M7so3406cuazLnhGt9p38LFa0.png` 2880×1368 | asset genérico | descargado de Framer |
| Hero logo | `uUDEO41j3xSZWBh8ylcBB9yBM.png` 325×164 | ausente | `hero-logo.png` |
| Hero altura | 684px, padding-bottom 42px | ok parcial | ajustado |
| Divisores | SVG 1440×17 acuarela entre secciones | 1 borde 11px | `section-divider.svg` ×3 |
| CTA Publicaciones ícono | SVG 42×75 negro | PNG 325px | `sic-mark.svg` |
| CTA Publicaciones bg | `#eee`, padding 83/64/112 | ok | gap 80px |
| Blog fondo | `linear-gradient(#f2f2f2 69%, #ffe563)` | blanco | gradiente |
| Blog layout desktop | header + cards en fila | columna | grid 2 cols ≥810px |

## Pendiente

- [ ] Botones hero como SVG pill (Framer usa componentes SVG 140×62, 209×59)
- [ ] Card width 32% / height 536px exactos
- [ ] Inter Display en hero title (ahora Inter)
