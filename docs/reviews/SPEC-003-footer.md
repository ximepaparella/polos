# SPEC-003 — Revisión visual Footer vs producción

**Producción:** https://campolacanianoarg.org/  
**Tests:** `npm run test:visual:footer`

## Hallazgo crítico vs SPEC original

El footer en producción **NO es oscuro** (`#1A1A1A`). Es **gris claro `#F2F2F2`** con texto negro.

## Layout desktop (1440px)

| Zona | Detalle |
|------|---------|
| Fondo | `#F2F2F2`, `padding-top: 80px` |
| Columna 1 | Marca SVG (~134×138px) + bloque Contacto, `gap: 130px` |
| Contacto | Label 12px/600, email 26px Inter, `letter-spacing: -1.04px` |
| Mapa del sitio | 2 columnas: (Sobre, Los Polos, La Escuela) \| (Eventos, Publicaciones, Contacto) |
| Links | 12px, negro, sin subrayado por defecto |
| Copyright | 14px, alineado izquierda, debajo del bloque principal |

## Layout mobile (375px)

| Propiedad | Valor |
|-----------|-------|
| `padding-top` | 32px |
| `padding-bottom` | 47px |
| Email | 16px, `letter-spacing: -0.64px` |
| Columnas sitemap | 2 columnas (no stack a 1) |

## Estados interactivos (local, alineados al patrón del sitio)

| Elemento | default | `:hover` |
|----------|---------|----------|
| Email | negro, sin underline | `#7A7A7A`, underline |
| Links sitemap | negro, sin underline | `#7A7A7A`, underline |

## Assets

- `public/assets/images/footer-mark.svg` — icono del footer (paths del logo FACL)
