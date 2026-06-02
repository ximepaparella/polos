# SPEC-002 — Revisión visual Navbar vs producción

**Producción:** https://campolacanianoarg.org/  
**Tests:** `npm run test:visual:navbar`

## Layout (desktop 1440px)

| Propiedad | Producción |
|-----------|------------|
| Altura header | 64px |
| Padding horizontal | 24px |
| Gap entre links | 32px |
| Logo | SVG 159×40 (sprite Framer → `logo-facl.svg`) |

## Tipografía links

| Propiedad | Valor |
|-----------|-------|
| font-family | Inter |
| font-size | 14px |
| font-weight | 400 |
| letter-spacing | -0.28px (~ -0.02em) |
| text-transform | none |

## Estados de links (medidos con Playwright hover)

### Default (cualquier página, link inactivo)

- `color: #000000`
- `text-decoration: none`

### `:hover`

- `color: #7A7A7A`
- `text-decoration: underline`
- Aplica también sobre el link `.active` (el activo pasa a gris al hover)

### `.active` (página actual, sin hover)

- `color: #111111`
- `text-decoration: underline`

### `:focus-visible` (local)

- `outline` 2px + underline (accesibilidad; producción Framer no expone foco claro por teclado)

## Logo

- Archivo: `public/assets/images/logo-facl.svg`
- Hover local: `opacity: 0.85` (producción sin cambio medible; aceptable para feedback)

## Incorrecto (no replicar)

- ❌ `text-transform: uppercase`
- ❌ `border-bottom` como indicador hover/active
- ❌ `font-weight: 500` en links
- ❌ PNG gigante de Framer como logo

## Capturas y regresión

- `tests/screenshots/navbar/` — header prod vs local
- `tests/screenshots/navbar/states/` — hover prod vs local
