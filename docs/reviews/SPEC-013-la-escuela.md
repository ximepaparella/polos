# SPEC-013 — La Escuela vs producción

**Producción:** https://campolacanianoarg.org/la-escuela  
**Tests:** `npm run test:visual:la-escuela`

## Hallazgos vs SPEC original

| Elemento | SPEC original | Producción (medido) |
|----------|---------------|---------------------|
| Acerca | Texto + imagen a la derecha | Solo 2 columnas de texto (sin imagen) |
| Objetivo | Fondo `--color-bg-alt` | Panel `#F2F2F2` con imagen izquierda + texto derecha |
| Alcance | Imagen + layout inverso | Título 48px + texto ancho completo + CTAs (sin imagen) |
| COLAGE | Grid responsables | Panel gris con imagen `la-escuela-2` a la derecha |
| CTA publicaciones | Fondo oscuro sólido | Banner imagen `cta-banner.png` con texto blanco superpuesto |
| Hero acerca título | H3 en prod | H2 local (semántica) con estilos 32px |

## Secciones

1. Hero blanco — H1 72px, 2 párrafos 18px, CTA PDF Principios Directivos
2. Acerca — H2 32px + grid 643px / 1fr de texto 18px
3. Objetivo — `#F2F2F2`, imagen 616px izquierda, H2 52px + CTAs
4. Alcance — título 48px, texto, CTAs centrados
5. COLAGE — `#F2F2F2`, responsables 355px + período 155px, imagen derecha
6. CTA — banner full-width, "LEÉ NUESTRAS PUBLICACIONES" 52px blanco

## Assets

- `public/assets/images/la-escuela-1.png`
- `public/assets/images/la-escuela-2.png`
- `public/assets/images/cta-banner.png`

## Métricas validadas

- Desktop: H1 72px, acerca 32px, paneles `#F2F2F2`, CTA blanco 52px, 2 imágenes, 4 filas COLAGE
- Mobile: H1 32px, acerca 22px, layout en columna única
