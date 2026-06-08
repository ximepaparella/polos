# Visual QA — Réplica FACL vs producción

**Referencia:** https://campolacanianoarg.org/

## Problema detectado

Los tests actuales validan **1–3 métricas por página** (tamaño de un título, un padding). Eso no garantiza paridad visual. La implementación tomó la SPEC vieja + mediciones parciales, no el CSS computado completo de producción.

## Metodología (por página)

### 1. Captura de referencia
- Screenshots prod: 1440px, 810px, 375px (hero, sección media, footer)
- Guardar en `tests/screenshots/reference/[pagina]/`

### 2. Extracción de estilos computados
Por cada sección visible, registrar:
- `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`
- `color`, `background-color`, `background-image`
- `padding`, `margin`, `gap`
- `width`, `height`, `border-radius`, `box-shadow`
- Assets: URL/dimensiones de imágenes y SVGs inline

Script: `npm run qa:extract -- --page home` (pendiente)

### 3. Matriz de gaps
Documento `docs/visual-qa/[pagina].md` con tabla:

| Selector / bloque | Prod | Local | Estado |
|-------------------|------|-------|--------|

### 4. Corrección en orden
1. **Fundación** — `tokens.css`, `global.css`, fuentes, botones
2. **Layout compartido** — navbar, footer, divisores SVG
3. **Página a página** — home → sobre → polos → escuela → eventos → publicaciones → contacto → detalle

### 5. Validación
- Test visual ampliado (≥8 métricas + screenshot diff opcional)
- Revisión manual lado a lado en navegador

## Orden de corrección propuesto

| # | Página | Prioridad | Motivo |
|---|--------|-----------|--------|
| 0 | Fundación | 🔴 | Fuentes/colores/botones afectan todo |
| 1 | Navbar + Footer | 🔴 | Presente en todas las rutas |
| 2 | Home | 🔴 | Primera impresión |
| 3 | Sobre el Foro | 🟠 | Muchas secciones + SVG ilustración |
| 4 | Los Polos | 🟠 | Layout columnas |
| 5 | La Escuela | 🟠 | Botones SVG, banners |
| 6 | Eventos | 🟡 | Grid cards |
| 7 | Publicaciones + detalle | 🟡 | Hero + flipbook |
| 8 | Contacto | 🟡 | Formulario + mapa |

## Qué podés aportar (opcional pero acelera)

| Aporte | Utilidad |
|--------|----------|
| **Screenshots** de cada página (1440 / mobile) | Comparación visual rápida |
| **SVGs exportados** desde Framer (divisores, ilustraciones, logos de botón) | Paridad exacta de decoración |
| **HTML guardado** (`Archivo → Guardar como`) de una página prod | Extraer SVGs inline y estructura |
| **CSS computado** copiado del DevTools de un bloque | Validar un gap puntual |
| Acceso al **proyecto Framer** | Fuente de verdad de estilos |

No es obligatorio descargar CSS compilado de Framer (no existe un único archivo público); con Playwright + screenshots alcanza.

## Gaps globales ya identificados (fundación)

| Issue | Producción | Nuestro código |
|-------|------------|----------------|
| Fuente títulos | Inter / Inter Display | Playfair en `global.css` h1–h6 |
| Fuente body | Inter | DM Sans |
| Gris secciones | `#EEEEEE`, `#F2F2F2` | `#f5f5f0`, mezcla inconsistente |
| Texto principal | `#06060d` | `#1a1a1a` |
| Divisores sección | SVG onda 1440×**17**px entre bloques | SVG 1417×11px solo en home |
| Botones CTA | ~16px/500 en labels visibles | `.btn` base 12px |
| Decoración | SVGs inline por página (98×102, 72×75, etc.) | PNG o ausente |
