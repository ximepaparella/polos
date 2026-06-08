# Visual QA — Fundación (global)

## Acciones

- [x] Documentar gaps
- [x] Corregir `tokens.css` (colores prod, Inter como sans)
- [x] Corregir `global.css` (quitar Playfair de headings, body Inter)
- [x] Ajustar `.btn` tipografía a prod (16px / 500)
- [x] Unificar altura divisores `.section-border` a 17px
- [ ] Extraer SVG divisores 1440×17 de producción (assets)
- [ ] Revisar páginas que aún referencian `--font-serif` o colores viejos

## Colores producción (medidos)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-bg` | `#FFFFFF` | Fondo principal |
| `--color-bg-muted` | `#EEEEEE` | CTA publicaciones home |
| `--color-footer-bg` | `#F2F2F2` | Paneles grises, footer |
| `--color-text-ink` | `#06060D` | Cuerpo, títulos oscuros |
| `--color-text-primary` | `#000000` | Nav, algunos títulos |

## Fuentes producción

- **Inter** — nav, body, cards, formularios
- **Inter Display** — algunos títulos hero (variante Framer)
- **No usa Playfair ni DM Sans** en páginas públicas
