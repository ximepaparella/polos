# FACL — Guía Completa de Agentes en Cursor
## Cómo configurar y usar Cursor Agents para construir la réplica exacta

---

## PARTE 1 — CÓMO CONFIGURAR CURSOR PARA ESTE PROYECTO

### 1.1 Configuración inicial de Cursor

Antes de crear un solo agente, configurá Cursor correctamente:

**Abrí Cursor → Settings → Rules for AI** y pegá esto como regla global del proyecto:

```
You are a senior frontend developer building an exact replica of https://campolacanianoarg.org/
Tech stack: Vanilla HTML5, CSS3, JavaScript ES2022, Vite 5, Supabase JS v2, StPageFlip.
Rules:
- ALWAYS write semantic HTML5 with proper aria labels
- ALWAYS use CSS custom properties (variables) defined in tokens.css — never hardcode colors or font sizes
- ALWAYS mobile-first CSS (min-width breakpoints)
- NEVER use React, Vue, or any JS framework
- NEVER use Bootstrap, Tailwind or utility-class frameworks
- NEVER use jQuery
- ALWAYS use async/await, never .then() chains
- ALWAYS handle loading states and error states in dynamic sections
- When fetching from Supabase, ALWAYS check for error before using data
- File references: navbar is in src/components/navbar.js, footer in src/components/footer.js
- Every HTML page must include: canonical meta, og:title, og:description, og:image, og:url
- Images: always include width, height, alt attributes and loading="lazy" (except above-fold)
```

**Creá el archivo `.cursorrules`** en la raíz del repo con el mismo contenido. Cursor lo lee automáticamente.

---

### 1.2 Estructura del repo — creala ANTES de abrir los agentes

```
facl-web/
├── .cursorrules                    ← reglas para el agente
├── .env.example                    ← template de variables
├── .gitignore
├── netlify.toml
├── package.json
├── vite.config.js
├── SPECS.md                        ← este documento (referencia del agente)
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── favicon.ico
│   └── assets/
│       ├── images/
│       │   ├── logo-facl.png       ← descargar de framerusercontent
│       │   ├── hero-bg.png
│       │   ├── sobre-el-foro.png
│       │   ├── la-escuela-1.png
│       │   ├── la-escuela-2.png
│       │   ├── witz-cover.jpg
│       │   └── textos-simposio.jpg
│       └── pdfs/
│           ├── witz-1.pdf          ← descargar de framerusercontent
│           └── textos-vi-simposio.pdf
├── src/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── reset.css
│   │   ├── global.css
│   │   ├── components/
│   │   │   ├── navbar.css
│   │   │   ├── footer.css
│   │   │   ├── card-publicacion.css
│   │   │   ├── card-evento.css
│   │   │   ├── flipbook.css
│   │   │   └── loading.css
│   │   └── pages/
│   │       ├── home.css
│   │       ├── sobre-el-foro.css
│   │       ├── los-polos.css
│   │       ├── la-escuela.css
│   │       ├── eventos.css
│   │       ├── publicaciones.css
│   │       ├── publicacion-detalle.css
│   │       └── contacto.css
│   ├── js/
│   │   ├── supabase-client.js
│   │   ├── components/
│   │   │   ├── navbar.js
│   │   │   ├── footer.js
│   │   │   └── flipbook.js
│   │   └── pages/
│   │       ├── home.js
│   │       ├── eventos.js
│   │       ├── publicaciones.js
│   │       └── publicacion-detalle.js
│   └── pages/
│       ├── index.html
│       ├── sobre-el-foro.html
│       ├── los-polos.html
│       ├── la-escuela.html
│       ├── eventos.html
│       ├── contacto.html
│       └── publicaciones-facl/
│           ├── index.html
│           └── _detalle.html       ← template, no se sirve directamente
└── supabase/
    ├── schema.sql
    └── seed.sql
```

---

### 1.3 Cómo usar los agentes en Cursor

Cursor tiene **dos modos** que vas a usar:

**Modo Chat (Cmd+L):** Para hacer preguntas, revisar código, pedir explicaciones. No modifica archivos.

**Modo Agent (Cmd+Shift+I → seleccionar "Agent"):** Para ejecutar tareas completas. El agente puede leer y escribir archivos, ejecutar terminal, instalar dependencias. **Este es el modo principal para construir.**

**Workflow por SPEC:**
1. Abrís Agent mode
2. Pegás el prompt de la SPEC (ver Parte 2)
3. El agente trabaja, vos revisás cada cambio en el diff view
4. Aprobás o pedís correcciones con mensajes de follow-up
5. Cuando la SPEC está completa, cerrás el agente y abrís uno nuevo para la siguiente

**Regla importante:** Un agente = una SPEC. No mezcles tareas en el mismo contexto de agente o empezará a contradecirse.

---

### 1.4 Archivos de contexto para el agente

Creá estos archivos en el repo. El agente los va a leer cuando se los referencies.

**`REFERENCE.md`** — pegá acá todo el contenido relevado del sitio:
```markdown
# Contenido del sitio FACL para referencia del agente

## Colores (extraídos del sitio Framer)
- Fondo principal: #FFFFFF
- Texto principal: #1A1A1A (casi negro)
- Texto secundario: #555555
- Acento/links activos: #000000
- Fondo secciones alternadas: #F5F5F0 (crema muy suave)
- Footer fondo: #1A1A1A
- Footer texto: #FFFFFF
- Bordes: #E0E0E0

## Tipografía (extraída del sitio)
- Títulos (H1, H2): serif, probablemente "Playfair Display" o similar
- Cuerpo y navegación: sans-serif, probablemente "DM Sans" o "Inter"
- Tamaños: H1 ~48-60px desktop / 32px mobile, H2 ~36px, body 16px

## Navegación
Links: Sobre el Foro | Los Polos | La Escuela | Eventos | Publicaciones | Contacto
Logo: imagen FACL (izquierda), links (derecha)
Mobile: hamburger menu

## Footer
- Email: foroargcl@gmail.com
- Mapa del sitio en 2 columnas
- Copyright: © 2025 FACL. Todos los derechos reservados.
- Fondo oscuro (#1A1A1A), texto blanco
```

---

## PARTE 2 — SPECS EXHAUSTIVAS POR ÉPICA

### Proceso obligatorio de review visual (todos los componentes)

Antes de dar por cerrada cualquier SPEC de UI, el agente **debe**:

1. **Inspeccionar producción** en https://campolacanianoarg.org/ (browser + mediciones CDP o Playwright).
2. **Documentar** hallazgos en `docs/reviews/SPEC-XXX-nombre.md` (métricas, colores, estados).
3. **Replicar todos los estados interactivos**, no solo el estado por defecto:
   - default (reposo)
   - `:hover`
   - `:focus` / `:focus-visible` (accesibilidad)
   - activo / página actual (clase `.active` o equivalente)
   - combinaciones (ej. `.active:hover`)
   - mobile: menú abierto/cerrado, overlay, hamburger
4. **Agregar tests Playwright** en `tests/` que comparen producción vs local (métricas `getComputedStyle` + screenshots).
5. **Ejecutar** `npm run test:visual:*` correspondiente y corregir hasta pasar.

Los valores de SPECS.md son orientativos; **producción manda** si hay divergencia (como se verificó en SPEC-002: sin uppercase, sin `border-bottom`, hover con subrayado gris).

---

## ÉPICA 0 — SETUP Y FUNDACIONES

### SPEC-000: Inicialización del proyecto

**Prompt para el agente:**
```
Lee el archivo REFERENCE.md y SPECS.md antes de comenzar.

Inicializa el proyecto con la siguiente estructura y configuración:

TAREA 1 — package.json:
Crea package.json con:
- name: "facl-web"
- scripts: { "dev": "vite", "build": "vite build", "preview": "vite preview" }
- devDependencies: vite@^5.0.0
- dependencies: @supabase/supabase-js@^2.0.0

TAREA 2 — vite.config.js:
Configura Vite con:
- root: "src"
- publicDir: "../public"
- build.outDir: "../dist"
- build.rollupOptions.input: objeto con todas las páginas HTML del proyecto
  (index, sobre-el-foro, los-polos, la-escuela, eventos, contacto, publicaciones-index)
- Que resuelva el alias "@" hacia "src/"

TAREA 3 — netlify.toml:
Crea con:
- [build] publish = "dist", command = "npm run build"
- [[redirects]] /publicaciones-facl/* → /publicaciones-facl/index.html status 200
- [[headers]] para /* con X-Frame-Options DENY, X-Content-Type-Options nosniff
- [[headers]] para /assets/* con Cache-Control immutable max-age 31536000

TAREA 4 — .gitignore:
Incluye: node_modules, dist, .env, .DS_Store, .vite

TAREA 5 — .env.example:
Crea con:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica

TAREA 6 — Instala dependencias:
Ejecuta npm install en la terminal.

VERIFICACIÓN: Ejecuta "npm run dev" y confirma que Vite levanta sin errores.
```

---

### SPEC-001: Design Tokens y Reset CSS

**Prompt para el agente:**
```
Lee REFERENCE.md para los valores exactos de colores y tipografía.

Crea src/css/reset.css con un reset moderno (box-sizing border-box, margin 0, 
padding 0, img max-width 100%, etc.)

Crea src/css/tokens.css con TODAS estas variables CSS:

/* COLORES */
--color-bg: #FFFFFF
--color-bg-alt: #F5F5F0
--color-bg-dark: #1A1A1A
--color-text-primary: #1A1A1A
--color-text-secondary: #555555
--color-text-light: #FFFFFF
--color-border: #E0E0E0
--color-accent: #1A1A1A
--color-accent-hover: #333333

/* TIPOGRAFÍA */
--font-serif: 'Playfair Display', Georgia, serif
--font-sans: 'DM Sans', system-ui, sans-serif
--font-size-xs: 0.75rem
--font-size-sm: 0.875rem
--font-size-base: 1rem
--font-size-lg: 1.125rem
--font-size-xl: 1.25rem
--font-size-2xl: 1.5rem
--font-size-3xl: 2rem
--font-size-4xl: 2.5rem
--font-size-5xl: 3.5rem

/* SPACING */
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
--space-20: 5rem     /* 80px */
--space-24: 6rem     /* 96px */

/* LAYOUT */
--max-width: 1200px
--max-width-content: 780px
--nav-height: 72px

/* BORDES */
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 16px

/* SOMBRAS */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.08)
--shadow-md: 0 4px 16px rgba(0,0,0,0.10)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.12)

/* TRANSICIONES */
--transition-fast: 150ms ease
--transition-base: 250ms ease
--transition-slow: 400ms ease

Crea src/css/global.css que:
- Importa tokens.css y reset.css
- Define body con font-family var(--font-sans), color var(--color-text-primary), background var(--color-bg)
- Importa Google Fonts: Playfair Display (400, 700) y DM Sans (400, 500) con display=swap
- Define .container con max-width var(--max-width), margin 0 auto, padding 0 var(--space-6)
- Define estilos base para h1-h6 usando var(--font-serif) y las variables de tamaño
- Define .btn clase base y .btn-primary, .btn-secondary variantes
- Define img { display: block; max-width: 100%; }
- Define .visually-hidden para accesibilidad
```

---

### SPEC-002: Componente Navbar

**Referencia visual:** https://campolacanianoarg.org/
Header fijo 64px: logo SVG lockup (159×40) a la izquierda, links a la derecha. Mobile: hamburger + panel.

**REVIEW OBLIGATORIA:** `docs/reviews/SPEC-002-navbar.md` + `npm run test:visual:navbar`

**Valores medidos en producción (desktop):**

| Estado | Color | Subrayado |
|--------|-------|-----------|
| default | `#000000` | no |
| `:hover` | `#7A7A7A` | sí |
| `.active` (página actual) | `#111111` | sí |
| `.active:hover` | `#7A7A7A` | sí |

Tipografía nav: Inter 14px / 400, `letter-spacing: -0.02em`, **sin** `text-transform: uppercase`, **sin** `border-bottom`.

**Prompt para el agente:**
```
Lee docs/reviews/SPEC-002-navbar.md. Inspecciona https://campolacanianoarg.org/ con Playwright
y replica TODOS los estados (default, hover, focus-visible, active, active:hover).

TOKENS (añadir en tokens.css si faltan):
--color-nav-link: #000000
--color-nav-link-hover: #7A7A7A
--color-nav-link-active: #111111
--nav-height: 64px
--font-nav: 'Inter', system-ui, sans-serif

ARCHIVO: src/css/components/navbar.css
- .navbar: fixed, height var(--nav-height), background var(--color-bg), z-index 100
- .navbar__inner: flex, space-between, max-width var(--max-width), padding-inline var(--space-6)
- .navbar__logo-img: height 40px; logo en /assets/images/logo-facl.svg (viewBox 0 0 159 40)
- .navbar__logo:hover: opacity 0.85 (sutil)
- .navbar__logo:focus-visible: outline accesible
- .navbar__links: flex, gap 32px
- .navbar__links a: font-nav, 14px, 400, letter-spacing -0.02em, color var(--color-nav-link), sin underline
- .navbar__links a:hover: color var(--color-nav-link-hover), text-decoration underline
- .navbar__links a.active: color var(--color-nav-link-active), text-decoration underline
- .navbar__links a:focus-visible: outline + underline
- .navbar__hamburger + estados hover/focus/open (animación X)

Mobile (max-width: 768px): panel fijo bajo header, links en columna con mismos estados hover/active.

ARCHIVO: src/js/components/navbar.js — initNavbar() con URLs limpias:
/sobre-el-foro, /los-polos, /la-escuela, /eventos, /publicaciones-facl, /contacto

TESTS: tests/navbar-visual.spec.js + tests/navbar-states.spec.js
VERIFICACIÓN: npm run test:visual:navbar (debe pasar 100%)
```

---

### SPEC-003: Componente Footer

**Prompt para el agente:**
```
Crea el componente footer completo.

ARCHIVO: src/css/components/footer.css
- .footer: background var(--color-bg-dark), color var(--color-text-light), 
  padding var(--space-16) 0 var(--space-8)
- .footer__grid: display grid, grid-template-columns 1fr 1fr, 
  gap var(--space-8), max-width var(--max-width), margin 0 auto, padding 0 var(--space-6)
- .footer__contact-label: font-size var(--font-size-xs), text-transform uppercase,
  letter-spacing 0.1em, opacity 0.6, margin-bottom var(--space-2)
- .footer__email: font-size var(--font-size-2xl), font-family var(--font-serif),
  color var(--color-text-light), text-decoration none
- .footer__email:hover: text-decoration underline
- .footer__sitemap-title: font-size var(--font-size-xs), text-transform uppercase,
  letter-spacing 0.1em, opacity 0.6, margin-bottom var(--space-4)
- .footer__sitemap: display grid, grid-template-columns 1fr 1fr, gap var(--space-2) var(--space-6)
- .footer__sitemap a: color var(--color-text-light), text-decoration none, 
  font-size var(--font-size-sm), opacity 0.8
- .footer__sitemap a:hover: opacity 1
- .footer__bottom: border-top 1px solid rgba(255,255,255,0.1), 
  margin-top var(--space-12), padding-top var(--space-6),
  text-align center, font-size var(--font-size-sm), opacity 0.6

BREAKPOINT mobile (max-width: 768px):
- .footer__grid: grid-template-columns 1fr

ARCHIVO: src/js/components/footer.js
Exporta función initFooter() que inserta antes de </body>:
<footer class="footer">
  <div class="footer__grid">
    <div>
      <p class="footer__contact-label">Contacto</p>
      <a href="mailto:foroargcl@gmail.com" class="footer__email">foroargcl@gmail.com</a>
    </div>
    <div>
      <p class="footer__sitemap-title">Mapa del sitio</p>
      <nav class="footer__sitemap" aria-label="Mapa del sitio">
        <a href="/sobre-el-foro.html">Sobre el Foro</a>
        <a href="/eventos.html">Eventos</a>
        <a href="/los-polos.html">Los Polos</a>
        <a href="/publicaciones-facl/index.html">Publicaciones</a>
        <a href="/la-escuela.html">La Escuela</a>
        <a href="/contacto.html">Contacto</a>
      </nav>
    </div>
  </div>
  <div class="footer__bottom">
    <p>© 2025 FACL. Todos los derechos reservados.</p>
  </div>
</footer>
```

---

### SPEC-004: Supabase Client

**Prompt para el agente:**
```
Crea el cliente de Supabase y todos los helpers de datos.

ARCHIVO: src/js/supabase-client.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── PUBLICACIONES ───────────────────────────────────────────

/**
 * Trae todas las publicaciones activas, ordenadas por fecha DESC
 * @param {number} limit - cantidad máxima, default todas
 */
export async function getPublicaciones(limit = null) {
  let query = supabase
    .from('publicaciones')
    .select('id, slug, titulo, subtitulo, descripcion, fecha, imagen_url, tags, issn')
    .eq('activo', true)
    .order('fecha', { ascending: false })
  
  if (limit) query = query.limit(limit)
  
  const { data, error } = await query
  if (error) { console.error('Error fetching publicaciones:', error); return [] }
  return data
}

/**
 * Trae una publicación por su slug
 * @param {string} slug
 */
export async function getPublicacionBySlug(slug) {
  const { data, error } = await supabase
    .from('publicaciones')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .single()
  
  if (error) { console.error('Error fetching publicacion:', error); return null }
  return data
}

/**
 * Trae la publicación anterior y siguiente (para nav prev/next)
 * @param {string} currentSlug
 * @param {string} currentFecha
 */
export async function getPublicacionesAdyacentes(currentSlug, currentFecha) {
  const [{ data: prev }, { data: next }] = await Promise.all([
    supabase.from('publicaciones')
      .select('slug, titulo')
      .eq('activo', true)
      .lt('fecha', currentFecha)
      .order('fecha', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('publicaciones')
      .select('slug, titulo')
      .eq('activo', true)
      .gt('fecha', currentFecha)
      .order('fecha', { ascending: true })
      .limit(1)
      .single()
  ])
  return { prev: prev || null, next: next || null }
}

// ─── EVENTOS ─────────────────────────────────────────────────

/**
 * Trae todos los eventos activos, ordenados por fecha_inicio ASC
 */
export async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('activo', true)
    .order('fecha_inicio', { ascending: true })
  
  if (error) { console.error('Error fetching eventos:', error); return [] }
  return data
}

// ─── SUSCRIPTORES ─────────────────────────────────────────────

/**
 * Registra un suscriptor nuevo
 * @param {string} nombre
 * @param {string} email
 */
export async function suscribir(nombre, email) {
  const { data, error } = await supabase
    .from('suscriptores')
    .insert([{ nombre: nombre.trim(), email: email.trim().toLowerCase() }])
    .select()
  
  if (error) {
    if (error.code === '23505') return { ok: false, message: 'Este email ya está registrado.' }
    console.error('Error suscribiendo:', error)
    return { ok: false, message: 'Error al registrar. Intentá nuevamente.' }
  }
  return { ok: true, message: '¡Te suscribiste correctamente!' }
}

Exporta también esta función utilitaria:
/**
 * Formatea una fecha ISO a formato legible en español
 * @param {string} dateString - "2026-01-21"
 * @returns "21 ene 2026"
 */
export function formatFecha(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}
```

---

## ÉPICA 1 — PÁGINA HOME

### SPEC-010: Home Page

**Referencia:** https://campolacanianoarg.org/

**Prompt para el agente:**
```
Crea la home page completa. Lee REFERENCE.md para los textos exactos.

ARCHIVO: src/pages/index.html

Estructura HTML completa:
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FACL | Foro Argentino del Campo Lacaniano</title>
  <meta name="description" content="Foro argentino del campo Lacaniano. Espacio abierto al debate del psicoanálisis en nuestro tiempo.">
  <meta property="og:title" content="FACL | Foro Argentino del Campo Lacaniano">
  <meta property="og:description" content="Foro argentino del campo Lacaniano">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://campolacanianoarg.org/">
  <meta property="og:image" content="https://campolacanianoarg.org/assets/images/og-image.jpg">
  <link rel="canonical" href="https://campolacanianoarg.org/">
  <link rel="icon" href="/favicon.ico">
  <link rel="stylesheet" href="/css/global.css">
  <link rel="stylesheet" href="/css/components/navbar.css">
  <link rel="stylesheet" href="/css/components/footer.css">
  <link rel="stylesheet" href="/css/components/card-publicacion.css">
  <link rel="stylesheet" href="/css/components/loading.css">
  <link rel="stylesheet" href="/css/pages/home.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Foro Argentino del Campo Lacaniano",
    "alternateName": "FACL",
    "url": "https://campolacanianoarg.org",
    "email": "foroargcl@gmail.com",
    "description": "Foro argentino del campo Lacaniano"
  }
  </script>
</head>
<body>
  <!-- Navbar se inserta por JS -->
  
  <main>
    <!-- SECCIÓN 1: HERO -->
    <section class="hero" aria-label="Presentación">
      <div class="hero__bg">
        <img src="/assets/images/hero-bg.png" alt="" aria-hidden="true" 
             width="1920" height="1080" fetchpriority="high">
      </div>
      <div class="container hero__content">
        <img src="/assets/images/logo-facl.png" alt="FACL" 
             class="hero__logo" width="200" height="80">
        <h1 class="hero__title">
          Bienvenido al Foro Argentino del Campo Lacaniano
        </h1>
        <p class="hero__text">
          El Foro Argentino del Campo Lacaniano, a través de los Polos que lo conforman, 
          vela por asegurar la repercusión y la incidencia del discurso analítico en nuestro 
          tiempo, por el mantenimiento de las conexiones con las instituciones de salud, las 
          prácticas sociales y las políticas que se enfrentan a los síntomas de la época, así 
          como los vínculos con otras prácticas teóricas que implican al sujeto (ciencias, 
          filosofía, arte, religión).
        </p>
        <div class="hero__ctas">
          <a href="/sobre-el-foro.html" class="btn btn-primary">Sobre el foro</a>
          <a href="/eventos.html" class="btn btn-secondary">Eventos</a>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 2: PUBLICACIONES CTA -->
    <section class="publicaciones-cta" aria-label="Publicaciones del Foro">
      <div class="container">
        <h2 class="publicaciones-cta__title">
          PUBLICACIONES DEL FORO ARGENTINO DEL CAMPO LACANIANO
        </h2>
        <p class="publicaciones-cta__text">
          Accedé a la revista SIC del Foro Argentino del Campo Lacaniano.
        </p>
        <a href="/publicaciones-facl/index.html" class="btn btn-primary">Ver Publicaciones</a>
      </div>
    </section>

    <!-- SECCIÓN 3: ÚLTIMAS PUBLICACIONES (dinámico) -->
    <section class="ultimas-publicaciones" aria-label="Últimas publicaciones">
      <div class="container">
        <div class="ultimas-publicaciones__header">
          <span class="section-label">Blog</span>
          <h2>Últimas publicaciones</h2>
          <p>Explora los temas más relevantes y actuales.</p>
          <a href="/publicaciones-facl/index.html" class="btn btn-secondary">Ver todas</a>
        </div>
        <div class="publicaciones-grid" id="ultimas-publicaciones-grid" 
             aria-live="polite" aria-busy="true">
          <!-- Cards cargadas dinámicamente por home.js -->
          <div class="loading-skeleton"></div>
          <div class="loading-skeleton"></div>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer se inserta por JS -->

  <script type="module" src="/js/pages/home.js"></script>
</body>
</html>

─────────────────────────────────────────────────
ARCHIVO: src/css/pages/home.css

.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Overlay oscuro para legibilidad */
.hero__bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
}

.hero__content {
  position: relative;
  z-index: 1;
  color: var(--color-text-light);
  max-width: 680px;
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}

.hero__logo {
  margin-bottom: var(--space-8);
  filter: brightness(0) invert(1); /* logo blanco sobre fondo oscuro */
}

.hero__title {
  font-family: var(--font-serif);
  font-size: var(--font-size-4xl);
  line-height: 1.2;
  margin-bottom: var(--space-6);
  font-weight: 700;
}

.hero__text {
  font-size: var(--font-size-lg);
  line-height: 1.7;
  margin-bottom: var(--space-8);
  opacity: 0.92;
}

.hero__ctas {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

/* SECCIÓN PUBLICACIONES CTA */
.publicaciones-cta {
  background: var(--color-bg-alt);
  padding: var(--space-20) 0;
  text-align: center;
}

.publicaciones-cta__title {
  font-family: var(--font-serif);
  font-size: var(--font-size-3xl);
  margin-bottom: var(--space-4);
}

.publicaciones-cta__text {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
}

/* SECCIÓN ÚLTIMAS PUBLICACIONES */
.ultimas-publicaciones {
  padding: var(--space-20) 0;
}

.ultimas-publicaciones__header {
  margin-bottom: var(--space-12);
}

.section-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: var(--space-2);
}

.publicaciones-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-8);
}

/* MOBILE */
@media (max-width: 768px) {
  .hero__title { font-size: var(--font-size-3xl); }
  .hero__text { font-size: var(--font-size-base); }
  .publicaciones-grid { grid-template-columns: 1fr; }
  .publicaciones-cta__title { font-size: var(--font-size-2xl); }
}

─────────────────────────────────────────────────
ARCHIVO: src/js/pages/home.js

import { initNavbar } from '../components/navbar.js'
import { initFooter } from '../components/footer.js'
import { getPublicaciones, formatFecha } from '../supabase-client.js'

initNavbar()
initFooter()

async function renderUltimasPublicaciones() {
  const grid = document.getElementById('ultimas-publicaciones-grid')
  grid.setAttribute('aria-busy', 'true')
  
  const publicaciones = await getPublicaciones(2)
  
  grid.setAttribute('aria-busy', 'false')
  
  if (!publicaciones.length) {
    grid.innerHTML = '<p>No hay publicaciones disponibles.</p>'
    return
  }
  
  grid.innerHTML = publicaciones.map(p => `
    <article class="card-publicacion">
      <a href="/publicaciones-facl/index.html?slug=${p.slug}" class="card-publicacion__link">
        <div class="card-publicacion__img-wrapper">
          <img src="${p.imagen_url}" alt="Portada de ${p.titulo}" 
               loading="lazy" width="400" height="560">
        </div>
        <div class="card-publicacion__body">
          <h3 class="card-publicacion__title">${p.titulo}</h3>
          ${p.subtitulo ? `<p class="card-publicacion__subtitle">${p.subtitulo}</p>` : ''}
          <time class="card-publicacion__date" datetime="${p.fecha}">
            ${formatFecha(p.fecha)}
          </time>
          ${p.descripcion ? `<p class="card-publicacion__desc">${p.descripcion}</p>` : ''}
          <span class="card-publicacion__cta">Ver más →</span>
        </div>
      </a>
    </article>
  `).join('')
}

renderUltimasPublicaciones()

─────────────────────────────────────────────────
ARCHIVO: src/css/components/card-publicacion.css

.card-publicacion { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; transition: box-shadow var(--transition-base); }
.card-publicacion:hover { box-shadow: var(--shadow-md); }
.card-publicacion__link { text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%; }
.card-publicacion__img-wrapper { aspect-ratio: 3/4; overflow: hidden; }
.card-publicacion__img-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform var(--transition-slow); }
.card-publicacion:hover img { transform: scale(1.03); }
.card-publicacion__body { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-2); flex: 1; }
.card-publicacion__title { font-family: var(--font-serif); font-size: var(--font-size-xl); font-weight: 700; }
.card-publicacion__subtitle { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.card-publicacion__date { font-size: var(--font-size-xs); color: var(--color-text-secondary); }
.card-publicacion__desc { font-size: var(--font-size-sm); line-height: 1.6; }
.card-publicacion__cta { margin-top: auto; font-size: var(--font-size-sm); font-weight: 500; }

TAMBIÉN CREA: src/css/components/loading.css con:
.loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: var(--radius-md); min-height: 400px; }
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
```

---

## ÉPICA 2 — PÁGINAS ESTÁTICAS

### SPEC-011: Sobre el Foro

**Referencia:** https://campolacanianoarg.org/sobre-el-foro

**Prompt para el agente:**
```
Crea la página /sobre-el-foro completa.
Lee REFERENCE.md para los textos exactos y la lista de miembros completa.

ARCHIVO: src/pages/sobre-el-foro.html

HEAD: igual a index.html pero con:
- title: "Sobre el Foro | FACL"
- description: "El Foro Argentino del Campo Lacaniano es un espacio abierto al debate del psicoanálisis."
- canonical: https://campolacanianoarg.org/sobre-el-foro
- Agregar también: sobre-el-foro.css en los links

ESTRUCTURA DE SECCIONES (en orden):
1. HERO DE PÁGINA
   <section class="page-hero">
     <div class="container">
       <h1>Sobre el Foro<br><span>Argentino del Campo Lacaniano</span></h1>
       <div class="page-hero__ctas">
         <a href="/los-polos.html" class="btn btn-primary">Los polos</a>
         <a href="/contacto.html" class="btn btn-secondary">Contacto</a>
       </div>
     </div>
   </section>

2. SECCIÓN INTRO (texto completo del sitio original)
   El texto bold de intro + los párrafos de historia y reorganización.
   Incluye la lista de 6 Polos en formato bold list.

3. SECCIÓN CARTA IFCL
   <section class="carta-ifcl">
     Fondo var(--color-bg-alt)
     Título H2: "CARTA DE LA INTERNACIONAL DE LOS FOROS DEL CAMPO LACANIANO"
     Texto descriptivo
     Link: https://www.champlacanien.net/public/docu/3/ifCharte2024.pdf
   </section>

4. SECCIÓN COORDINACIÓN GENERAL
   Grid de 6 personas (3 columnas, 2 filas):
   - Fernando Martínez — Polo Patagonia
   - Leonardo Leibson — Polo Buenos Aires
   - Juan Pablo Vargas — Polo Mediterráneo
   - Ana Díaz Patrón — Polo Salta
   - Julieta López Liatto — Polo NOA
   - Soledad Castaño — Polo Nuevo Cuyo

5. SECCIÓN MIEMBROS
   Título: "Conoce a los miembros del FACL"
   Lista completa de ~120 miembros en columnas (usar CSS columns: 3).
   Para cada miembro: Apellido, Nombre + (si tiene) "Miembro de Escuela XX"
   Lista completa en REFERENCE.md

ARCHIVO: src/css/pages/sobre-el-foro.css
- .page-hero: padding var(--space-24) 0, background var(--color-bg-alt)
- .page-hero h1: font-family serif, font-size var(--font-size-5xl), 
  span en display block
- .coordinacion__grid: display grid, grid-template-columns repeat(3, 1fr), gap var(--space-6)
- .coordinacion__item: padding var(--space-6), border 1px solid var(--color-border), border-radius var(--radius-md)
- .miembros__list: columns 3, column-gap var(--space-8), list-style none
- .miembros__list li: break-inside avoid, padding var(--space-1) 0, font-size var(--font-size-sm)
- Mobile: coordinacion grid 1 col, miembros columns 1
```

---

### SPEC-012: Los Polos

**Referencia:** https://campolacanianoarg.org/los-polos

**Prompt para el agente:**
```
Crea la página /los-polos completa.

ARCHIVO: src/pages/los-polos.html

HEAD: title "Los Polos | FACL", canonical /los-polos

ESTRUCTURA:
1. PAGE HERO
   H1: "Polos del Campo Lacaniano en Argentina"
   Subtítulo: "Los Polos del Foro Argentino del Campo Lacaniano se localizan en diferentes 
   regiones del país. Si estás interesado en el psicoanálisis del Campo Lacaniano puedes 
   contactarte y participar, independientemente de tu profesión, sólo basta el interés por 
   el psicoanálisis."
   CTA: botón "Sobre el foro" y "Contacto"

2. SECCIÓN POLOS (6 polos, cada uno una sección separada)
   Para cada polo:
   <section class="polo" id="polo-[nombre]" aria-labelledby="polo-[nombre]-title">
     <div class="container">
       <h2 id="polo-[nombre]-title" class="polo__title">Polo [Nombre]</h2>
       <ul class="polo__miembros">
         [lista de miembros]
       </ul>
     </div>
   </section>
   
   Polos y sus miembros (lista completa del relevamiento):
   - Polo Buenos Aires (55 miembros aprox)
   - Polo NOA (23 miembros aprox) 
   - Polo Salta (11 miembros)
   - Polo Patagonia (16 miembros)
   - Polo Mediterráneo (10 miembros)
   - Polo Nuevo Cuyo (6 miembros)
   
   Usar los nombres EXACTOS del sitio original (ver REFERENCE.md)

CSS: Alternar fondo blanco / var(--color-bg-alt) entre polos.
.polo__miembros: columns 3 en desktop, 2 en tablet, 1 en mobile.
```

---

### SPEC-013: La Escuela

**Referencia:** https://campolacanianoarg.org/la-escuela

**Prompt para el agente:**
```
Crea la página /la-escuela completa.

ARCHIVO: src/pages/la-escuela.html

ESTRUCTURA DE SECCIONES:
1. PAGE HERO
   H1: "La Escuela de Psicoanálisis de los Foros del Campo Lacaniano"
   Texto intro (párrafo del sitio original sobre fundación en 1998 y 2001)
   Link: "Conozca nuestros Principios Directivos" → https://www.champlacanien.net/public/docu/3/epPrincipes2022.pdf

2. SECCIÓN "ACERCA DE LA ESCUELA" (texto largo, 2 párrafos del sitio)
   Imagen a la derecha: /assets/images/la-escuela-1.png
   Layout: 2 columnas (texto | imagen) en desktop, stack en mobile

3. SECCIÓN "EL OBJETIVO DE LA EPFCL"
   Fondo var(--color-bg-alt)
   Texto del objetivo (párrafo completo del sitio)
   CTAs: "Contacto" y "Sobre el Foro"

4. SECCIÓN "EL ALCANCE DE LA ESCUELA"
   Texto sobre extensión internacional
   Imagen: /assets/images/la-escuela-2.png
   Layout inverso al punto 2

5. SECCIÓN "COLAGE"
   Título: "Dispositivo de Escuela Local - COLAGE"
   Subtítulo: "Comisión Local de Admisión, Garantía y Episteme EPFCL América Latina Sur"
   
   Responsables (3 personas en grid):
   - Julieta De Battista — AME, Polo Buenos Aires, Secretariado del pase
   - Mayda Gago — AP, Polo Nuevo Cuyo
   - Erica González — AP, Polo Patagonia
   
   Período: 2024 → 2026

6. SECCIÓN CTA PUBLICACIONES
   Fondo oscuro (var(--color-bg-dark)), texto blanco
   Título: "LEÉÉ NUESTRAS PUBLICACIONES"
   Subtítulo: "Descubre la revista SIC, sé testigo de un espacio de crecimiento analítico."
   CTA: "Publicaciones" y "Sobre el foro"
```

---

### SPEC-014: Contacto

**Referencia:** https://campolacanianoarg.org/contacto

**Prompt para el agente:**
```
Crea la página /contacto completa con formulario funcional.

ARCHIVO: src/pages/contacto.html

ESTRUCTURA:
1. SECCIÓN CONTACTO PRINCIPAL
   H2: "Contacto"
   Texto: "Envíanos un correo a nuestra dirección oficial."
   Email: foroargcl@gmail.com (link mailto)

2. FORMULARIO DE SUSCRIPCIÓN
   Texto: "Dejanos tu email para recibir información acerca del Foro."
   
   <form name="suscripcion" netlify netlify-honeypot="bot-field" id="form-suscripcion">
     <input type="hidden" name="form-name" value="suscripcion">
     <p class="hidden"><label>No completar: <input name="bot-field"></label></p>
     <div class="form__group">
       <label for="nombre">Nombre</label>
       <input type="text" id="nombre" name="nombre" required placeholder="Tu nombre">
     </div>
     <div class="form__group">
       <label for="email">Email</label>
       <input type="email" id="email" name="email" required placeholder="tu@email.com">
     </div>
     <button type="submit" class="btn btn-primary" id="form-submit">Enviar</button>
     <div id="form-message" role="alert" aria-live="polite"></div>
   </form>

3. SECCIÓN UBICACIONES (Los 6 Polos)
   H2: "El Foro en la Argentina"
   H3: "Ubicaciones"
   Grid de 6 cards, una por Polo con nombre y email:
   - Polo Buenos Aires: secretariafarp@gmail.com
   - Polo Mediterráneo: foromediterraneo2014@gmail.com
   - Polo Patagonia: foropatcl@gmail.com
   - Polo Salta: forosalta.cl@gmail.com
   - Polo NOA: info@epfcl-tucuman.com.ar
   - Polo Nuevo Cuyo: foronuevocuyolacaniano@gmail.com

4. MAPA GOOGLE EMBEBIDO
   <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d841729.3416285446!2d-59.11373094760332!3d-34.502751412566504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb3faddba8be7%3A0x93e8f54e16d05cc5!2sBuenos%20Aires%20Metropolitan%20Area!5e0!3m2!1sen!2sar!4v1747139385467!5m2!1sen!2sar"
     width="100%" height="400" style="border:0" allowfullscreen loading="lazy"
     referrerpolicy="no-referrer-when-downgrade"
     title="Mapa del área metropolitana de Buenos Aires">
   </iframe>

ARCHIVO: src/js/pages/contacto.js (import en el HTML)

import { initNavbar } from '../components/navbar.js'
import { initFooter } from '../components/footer.js'
import { suscribir } from '../supabase-client.js'

initNavbar()
initFooter()

const form = document.getElementById('form-suscripcion')
const submitBtn = document.getElementById('form-submit')
const messageEl = document.getElementById('form-message')

form.addEventListener('submit', async (e) => {
  e.preventDefault() // Netlify Forms también funciona sin JS con action="/gracias"
  
  submitBtn.disabled = true
  submitBtn.textContent = 'Enviando...'
  messageEl.className = ''
  messageEl.textContent = ''
  
  const nombre = form.nombre.value
  const email = form.email.value
  
  const result = await suscribir(nombre, email)
  
  messageEl.textContent = result.message
  messageEl.className = result.ok ? 'form-message--success' : 'form-message--error'
  
  if (result.ok) {
    form.reset()
  }
  
  submitBtn.disabled = false
  submitBtn.textContent = 'Enviar'
})

CSS para el formulario: campos con border 1px solid var(--color-border), 
padding var(--space-3), border-radius var(--radius-sm), width 100%, 
focus: outline none, border-color var(--color-accent).
Grid de ubicaciones: 3 columnas desktop, 2 tablet, 1 mobile.
```

---

## ÉPICA 3 — PÁGINAS DINÁMICAS

### SPEC-020: Eventos

**Referencia:** https://campolacanianoarg.org/eventos

**Prompt para el agente:**
```
Crea la página /eventos con datos dinámicos desde Supabase.

ARCHIVO: src/pages/eventos.html

HEAD: title "Eventos | FACL", canonical /eventos

ESTRUCTURA HTML:
- Page hero: H2 "Nuestros próximos eventos", subtítulo "Descubre nuestros próximos eventos y actividades programadas."
- Grid de eventos: <div id="eventos-grid" aria-live="polite" aria-busy="true">
  Placeholder de 3 skeletons mientras carga
- Sección final: "SEGUÍ NUESTRAS ACTUALIZACIONES" con link a Instagram
  (el sitio original dice "Ver instagram" pero no tiene link — agregar href="#" por ahora)

ARCHIVO: src/js/pages/eventos.js

import { initNavbar } from '../components/navbar.js'
import { initFooter } from '../components/footer.js'
import { getEventos, formatFecha } from '../supabase-client.js'

initNavbar()
initFooter()

function renderEvento(evento) {
  const fechaInicio = formatFecha(evento.fecha_inicio)
  const fechaFin = evento.fecha_fin ? formatFecha(evento.fecha_fin) : null
  
  return `
    <article class="card-evento">
      <div class="card-evento__img-wrapper">
        <img src="${evento.imagen_url}" alt="${evento.titulo}" 
             loading="lazy" width="800" height="800">
      </div>
      <div class="card-evento__body">
        <span class="card-evento__label">Evento</span>
        <h2 class="card-evento__title">${evento.titulo}</h2>
        ${evento.subtitulo ? `<p class="card-evento__subtitle">"${evento.subtitulo}"</p>` : ''}
        ${evento.lugar ? `<p class="card-evento__lugar">${evento.lugar}</p>` : ''}
        ${evento.email ? `<a href="mailto:${evento.email}" class="card-evento__email">${evento.email}</a>` : ''}
        <div class="card-evento__fechas">
          <time datetime="${evento.fecha_inicio}">${fechaInicio}</time>
          ${fechaFin ? ` — <time datetime="${evento.fecha_fin}">${fechaFin}</time>` : ''}
        </div>
        ${evento.link_externo ? 
          `<a href="${evento.link_externo}" class="btn btn-primary" 
              target="_blank" rel="noopener noreferrer">Ver más</a>` : ''}
      </div>
    </article>
  `
}

async function init() {
  const grid = document.getElementById('eventos-grid')
  const eventos = await getEventos()
  
  grid.setAttribute('aria-busy', 'false')
  
  if (!eventos.length) {
    grid.innerHTML = '<p class="empty-state">No hay eventos programados por el momento.</p>'
    return
  }
  
  grid.innerHTML = eventos.map(renderEvento).join('')
}

init()

ARCHIVO: src/css/components/card-evento.css
Cada card tiene: imagen grande arriba, luego el contenido debajo.
Layout de la grilla: 2 columnas en desktop, 1 en mobile.
Similar al diseño del sitio original: imagen cuadrada o rectangular, 
contenido con padding, sin bordes pronunciados.

.eventos-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-12); }
.card-evento__img-wrapper { aspect-ratio: 1; overflow: hidden; }
.card-evento__img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.card-evento__body { padding: var(--space-6) 0; }
.card-evento__label { font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-secondary); }
.card-evento__title { font-family: var(--font-serif); font-size: var(--font-size-2xl); margin: var(--space-2) 0; }
.card-evento__fechas { font-size: var(--font-size-sm); margin: var(--space-3) 0; }
```

---

### SPEC-021: Publicaciones (listado)

**Referencia:** https://campolacanianoarg.org/publicaciones-facl

**Prompt para el agente:**
```
Crea la página /publicaciones-facl completa.

ARCHIVO: src/pages/publicaciones-facl/index.html

HEAD:
- title: "Publicaciones | FACL"
- description: "Publicaciones de la Internacional de los Foros del Campo Lacaniano y la EPFCL América Latina Sur."
- canonical: https://campolacanianoarg.org/publicaciones-facl

ESTRUCTURA:
1. PAGE HERO
   breadcrumb: Publicaciones (texto estático, no link)
   H1: "PUBLICACIONES IF - EPFCL ALS"
   Texto: "Las publicaciones son esenciales para compartir conocimientos y fomentar el debate en el campo lacaniano."
   CTAs: "Ver publicaciones" y "Sobre el foro"

2. INTRO SECTION
   Título: "Explora nuestras publicaciones destacadas"
   Texto: "En esta sección, encontrarás una selección de publicaciones relevantes de la Internacional de los Foros del Campo Lacaniano y la EPFCL América Latina Sur."

3. GRID DE PUBLICACIONES (dinámico)
   <div id="publicaciones-grid" aria-live="polite" aria-busy="true">
   Skeletons de carga
   </div>
   
   Cada card usa el componente card-publicacion (ya creado en SPEC-010).
   El link de cada card apunta a: /publicaciones-facl/index.html?slug=[slug]

ARCHIVO: src/js/pages/publicaciones.js

import { initNavbar } from '../components/navbar.js'
import { initFooter } from '../components/footer.js'
import { getPublicaciones, formatFecha } from '../supabase-client.js'

initNavbar()
initFooter()

async function init() {
  const grid = document.getElementById('publicaciones-grid')
  const publicaciones = await getPublicaciones()
  
  grid.setAttribute('aria-busy', 'false')
  
  if (!publicaciones.length) {
    grid.innerHTML = '<p class="empty-state">No hay publicaciones disponibles.</p>'
    return
  }
  
  grid.innerHTML = publicaciones.map(p => `
    <article class="card-publicacion">
      <a href="/publicaciones-facl/index.html?slug=${p.slug}" class="card-publicacion__link">
        <div class="card-publicacion__img-wrapper">
          <img src="${p.imagen_url}" alt="Portada de ${p.titulo}" loading="lazy" width="400" height="560">
        </div>
        <div class="card-publicacion__body">
          <h2 class="card-publicacion__title">${p.titulo}</h2>
          ${p.subtitulo ? `<p class="card-publicacion__subtitle">${p.subtitulo}</p>` : ''}
          <time class="card-publicacion__date" datetime="${p.fecha}">${formatFecha(p.fecha)}</time>
          ${p.descripcion ? `<p class="card-publicacion__desc">${p.descripcion}</p>` : ''}
          ${p.tags ? p.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
          <span class="card-publicacion__cta">Ver más →</span>
        </div>
      </a>
    </article>
  `).join('')
}

init()
```

---

### SPEC-022 + SPEC-023: Publicación Detalle + Flipbook

**Referencias:** 
- https://campolacanianoarg.org/publicaciones-facl/revista-de-psicoanalisis-de-la-epfcl-alsur
- https://campolacanianoarg.org/publicaciones-facl/textos

**Prompt para el agente:**
```
Este es el SPEC más complejo. Crea la página de detalle de publicación con el visor 
tipo revista usando StPageFlip + PDF.js.

ARCHIVO: src/pages/publicaciones-facl/index.html
(El mismo archivo de listado, pero detecta el parámetro ?slug= en la URL
y si existe, muestra el detalle en lugar del listado — SPA mínima)

Modifica src/js/pages/publicaciones.js para agregar lógica de routing:

async function init() {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('slug')
  
  if (slug) {
    await renderDetalle(slug)
  } else {
    await renderListado()
  }
}

─────────────────────────────────────────────────
ARCHIVO: src/js/components/flipbook.js

Instala primero: npm install stpageflip pdfjs-dist

Este componente:
1. Recibe un elemento contenedor y una URL de PDF
2. Usa PDF.js para renderizar cada página del PDF como un canvas/imagen
3. Pasa las imágenes a StPageFlip para crear el efecto de revista
4. Agrega controles de navegación

import { PageFlip } from 'stpageflip'
import * as pdfjsLib from 'pdfjs-dist'

// Worker de PDF.js (necesario)
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export class Flipbook {
  constructor(containerId, pdfUrl, options = {}) {
    this.container = document.getElementById(containerId)
    this.pdfUrl = pdfUrl
    this.pageFlip = null
    this.totalPages = 0
    this.options = {
      width: options.width || 550,
      height: options.height || 733,
      showCover: true,
      mobileScrollSupport: false,
      useMouseEvents: true,
      ...options
    }
  }
  
  async init() {
    this.showLoading()
    
    try {
      const pdf = await pdfjsLib.getDocument(this.pdfUrl).promise
      this.totalPages = pdf.numPages
      
      // Renderizar todas las páginas como imágenes
      const images = []
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        this.updateLoadingProgress(pageNum, pdf.numPages)
        const imageDataUrl = await this.renderPage(pdf, pageNum)
        images.push(imageDataUrl)
      }
      
      this.hideLoading()
      this.initPageFlip(images)
      this.initControls()
      
    } catch (error) {
      console.error('Error cargando PDF:', error)
      this.showError()
    }
  }
  
  async renderPage(pdf, pageNum) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1.5 })
    
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport
    }).promise
    
    return canvas.toDataURL('image/jpeg', 0.85)
  }
  
  initPageFlip(images) {
    const flipContainer = document.createElement('div')
    flipContainer.id = 'flip-container'
    this.container.appendChild(flipContainer)
    
    this.pageFlip = new PageFlip(flipContainer, this.options)
    this.pageFlip.loadFromImages(images)
    
    // Evento para actualizar el contador de página
    this.pageFlip.on('flip', (e) => {
      this.updatePageCounter(e.data + 1)
    })
  }
  
  initControls() {
    const controls = document.getElementById('flipbook-controls')
    if (!controls) return
    
    document.getElementById('btn-prev')?.addEventListener('click', () => {
      this.pageFlip.flipPrev()
    })
    document.getElementById('btn-next')?.addEventListener('click', () => {
      this.pageFlip.flipNext()
    })
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      this.container.requestFullscreen?.()
    })
    
    this.updatePageCounter(1)
  }
  
  updatePageCounter(current) {
    const counter = document.getElementById('page-counter')
    if (counter) counter.textContent = `${current} / ${this.totalPages}`
  }
  
  showLoading() {
    this.container.innerHTML = `
      <div class="flipbook-loading">
        <div class="flipbook-loading__spinner"></div>
        <p id="loading-text">Cargando revista...</p>
      </div>
    `
  }
  
  updateLoadingProgress(current, total) {
    const el = document.getElementById('loading-text')
    if (el) el.textContent = `Cargando página ${current} de ${total}...`
  }
  
  hideLoading() {
    const loading = this.container.querySelector('.flipbook-loading')
    if (loading) loading.remove()
  }
  
  showError() {
    this.container.innerHTML = `
      <div class="flipbook-error">
        <p>No se pudo cargar la revista. Por favor intentá descargar el PDF directamente.</p>
      </div>
    `
  }
}

─────────────────────────────────────────────────
ARCHIVO: src/js/pages/publicacion-detalle.js (llamado desde publicaciones.js)

import { getPublicacionBySlug, getPublicacionesAdyacentes, formatFecha } from '../supabase-client.js'
import { Flipbook } from '../components/flipbook.js'

export async function renderDetalle(slug) {
  const main = document.querySelector('main') || document.body
  
  // Loading state
  main.innerHTML = '<div class="loading-skeleton" style="min-height: 600px"></div>'
  
  const publicacion = await getPublicacionBySlug(slug)
  
  if (!publicacion) {
    main.innerHTML = `
      <div class="container" style="padding: var(--space-20) 0; text-align: center">
        <h1>Publicación no encontrada</h1>
        <a href="/publicaciones-facl/index.html" class="btn btn-primary">Volver a publicaciones</a>
      </div>
    `
    return
  }
  
  // Actualizar meta tags dinámicamente
  document.title = `${publicacion.titulo} | FACL`
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', publicacion.descripcion || publicacion.titulo)
  
  const { prev, next } = await getPublicacionesAdyacentes(slug, publicacion.fecha)
  
  main.innerHTML = `
    <article class="publicacion-detalle">
      <!-- HEADER con imagen -->
      <section class="publicacion-detalle__hero">
        <div class="container publicacion-detalle__hero-inner">
          <div class="publicacion-detalle__cover">
            <img src="${publicacion.imagen_url}" 
                 alt="Portada de ${publicacion.titulo}"
                 width="400" height="560" fetchpriority="high">
          </div>
          <div class="publicacion-detalle__info">
            <h1 class="publicacion-detalle__title">${publicacion.titulo}</h1>
            ${publicacion.subtitulo ? 
              `<p class="publicacion-detalle__subtitle">${publicacion.subtitulo}</p>` : ''}
            ${publicacion.issn ? 
              `<p class="publicacion-detalle__issn">${publicacion.issn}</p>` : ''}
            <time class="publicacion-detalle__date" datetime="${publicacion.fecha}">
              ${formatFecha(publicacion.fecha)}
            </time>
            ${publicacion.descripcion ? 
              `<p class="publicacion-detalle__desc">${publicacion.descripcion}</p>` : ''}
            ${publicacion.tags ? 
              publicacion.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
            <a href="${publicacion.pdf_url}" class="btn btn-primary" 
               download target="_blank" rel="noopener">
              Descargar Publicación
            </a>
          </div>
        </div>
      </section>
      
      <!-- FLIPBOOK VISOR -->
      <section class="flipbook-section" aria-label="Visor de revista">
        <div class="container">
          <h2>Leer publicación</h2>
          <div id="flipbook-wrapper">
            <!-- Flipbook se inicializa acá -->
          </div>
          <div class="flipbook-controls" id="flipbook-controls">
            <button id="btn-prev" class="btn btn-secondary" aria-label="Página anterior">
              ← Anterior
            </button>
            <span id="page-counter" aria-live="polite">1 / ?</span>
            <button id="btn-next" class="btn btn-primary" aria-label="Página siguiente">
              Siguiente →
            </button>
            <button id="btn-fullscreen" class="btn btn-secondary" aria-label="Pantalla completa">
              ⛶ Pantalla completa
            </button>
          </div>
        </div>
      </section>
      
      <!-- NAVEGACIÓN PREV/NEXT -->
      <nav class="publicacion-nav" aria-label="Otras publicaciones">
        <div class="container">
          ${prev ? `
            <a href="?slug=${prev.slug}" class="publicacion-nav__prev">
              ‹ ${prev.titulo}
            </a>
          ` : '<span></span>'}
          ${next ? `
            <a href="?slug=${next.slug}" class="publicacion-nav__next">
              ${next.titulo} ›
            </a>
          ` : ''}
        </div>
      </nav>
    </article>
  `
  
  // Inicializar el flipbook después de que el DOM esté listo
  if (publicacion.pdf_url) {
    const flipbook = new Flipbook('flipbook-wrapper', publicacion.pdf_url, {
      width: Math.min(550, window.innerWidth / 2 - 40),
      height: Math.min(733, (window.innerWidth / 2 - 40) * (733/550))
    })
    await flipbook.init()
  }
}

─────────────────────────────────────────────────
ARCHIVO: src/css/components/flipbook.css

.flipbook-section { padding: var(--space-16) 0; background: var(--color-bg-alt); }
.flipbook-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-16); }
.flipbook-loading__spinner { width: 48px; height: 48px; border: 4px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
.flipbook-controls { display: flex; align-items: center; justify-content: center; gap: var(--space-4); margin-top: var(--space-8); flex-wrap: wrap; }
#page-counter { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
.publicacion-detalle__hero-inner { display: grid; grid-template-columns: 300px 1fr; gap: var(--space-12); padding: var(--space-16) 0; }
.publicacion-detalle__cover img { width: 100%; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); }
.publicacion-nav { padding: var(--space-12) 0; border-top: 1px solid var(--color-border); }
.publicacion-nav .container { display: flex; justify-content: space-between; }
.publicacion-nav a { font-size: var(--font-size-sm); text-decoration: none; color: var(--color-text-primary); }

@media (max-width: 768px) {
  .publicacion-detalle__hero-inner { grid-template-columns: 1fr; }
  #flip-container { transform: scale(0.7); transform-origin: top center; }
}
```

---

## ÉPICA 4 — QA Y COMPARATIVA VISUAL

### SPEC-QA-001: Setup de testing visual

**Prompt para el agente:**
```
Instala y configura Playwright para hacer comparativas visuales entre el sitio original 
y el nuevo.

npm install -D @playwright/test

Crea playwright.config.js:
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    screenshot: 'only-on-failure',
    video: 'off'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
})

Crea tests/visual-comparison.spec.js con tests para CADA página:
- Navega al sitio original Y al nuevo
- Toma screenshot a 375px, 768px, 1440px de ancho
- Guarda en /tests/screenshots/[pagina]-[breakpoint]-[original|nuevo].png
- Genera un reporte HTML con las comparativas side-by-side

Las páginas a testear:
- / (home)
- /sobre-el-foro
- /los-polos
- /la-escuela
- /eventos
- /publicaciones-facl
- /publicaciones-facl?slug=revista-de-psicoanalisis-de-la-epfcl-alsur
- /contacto

Crea también un script tests/generate-report.js que:
1. Lee todas las screenshots de la carpeta
2. Genera un HTML con comparativas lado a lado de original vs nuevo
3. Para cada página y breakpoint: muestra las dos imágenes juntas
4. Incluye un slider interactivo (CSS) para comparar superpuestas
```

---

### SPEC-QA-002: Checklist de validación

**Este no es un prompt de agente — es tu checklist manual antes de deploy.**

Para cada página, verificar:

**Contenido:**
- [ ] Todos los textos son idénticos al original
- [ ] Todas las imágenes cargan correctamente
- [ ] Todos los links funcionan (no hay 404)
- [ ] Links externos abren en nueva pestaña
- [ ] Formulario de contacto envía correctamente

**Visual:**
- [ ] Tipografía idéntica (familia, tamaño, peso)
- [ ] Colores idénticos
- [ ] Spacing similar al original
- [ ] Animaciones/hover states funcionan

**Responsive:**
- [ ] Mobile 375px: sin overflow horizontal
- [ ] Mobile 375px: hamburger menu funciona
- [ ] Tablet 768px: layout intermedio correcto
- [ ] Desktop 1440px: max-width limita el contenido

**Performance (Lighthouse):**
- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 95

**SEO:**
- [ ] `<title>` único por página
- [ ] `<meta name="description">` presente y relevante
- [ ] `<link rel="canonical">` correcto
- [ ] OG tags completos
- [ ] Schema.org JSON-LD en home
- [ ] `robots.txt` permite indexación
- [ ] `sitemap.xml` incluye todas las URLs

---

## PARTE 3 — BASE DE DATOS SUPABASE (SQL COMPLETO)

### supabase/schema.sql

```sql
-- Ejecutar en Supabase SQL Editor

-- TABLA PUBLICACIONES
CREATE TABLE IF NOT EXISTS publicaciones (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  titulo      text NOT NULL,
  subtitulo   text,
  descripcion text,
  fecha       date NOT NULL,
  imagen_url  text,
  pdf_url     text NOT NULL,
  tags        text[] DEFAULT '{}',
  issn        text,
  activo      boolean DEFAULT true,
  orden       integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- TABLA EVENTOS
CREATE TABLE IF NOT EXISTS eventos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text NOT NULL,
  subtitulo     text,
  descripcion   text,
  fecha_inicio  date NOT NULL,
  fecha_fin     date,
  lugar         text,
  email         text,
  imagen_url    text,
  link_externo  text,
  activo        boolean DEFAULT true,
  orden         integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- TABLA SUSCRIPTORES
CREATE TABLE IF NOT EXISTS suscriptores (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre     text NOT NULL,
  email      text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ROW LEVEL SECURITY
ALTER TABLE publicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscriptores ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura pública, escritura solo autenticado
CREATE POLICY "publicaciones_select" ON publicaciones FOR SELECT USING (true);
CREATE POLICY "eventos_select" ON eventos FOR SELECT USING (true);
CREATE POLICY "suscriptores_insert" ON suscriptores FOR INSERT WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER publicaciones_updated_at BEFORE UPDATE ON publicaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER eventos_updated_at BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### supabase/seed.sql

```sql
-- Datos iniciales — correr DESPUÉS del schema

-- Publicaciones existentes (con los PDFs ya hosteados en Supabase Storage)
INSERT INTO publicaciones (slug, titulo, subtitulo, descripcion, fecha, imagen_url, pdf_url, tags, issn) VALUES
(
  'revista-de-psicoanalisis-de-la-epfcl-alsur',
  'WITZ',
  'Revista de Psicoanálisis de la EPFCL América Latina Sur',
  'Esta revista recoge parte del trabajo propiciado en las Jornadas de Escuela y de Carteles que se llevaron a cabo en Salta (2022) y en Mendoza (2023). "Los tiempos del acto analítico" es el título que nos lleva a partir de una afirmación: el acto analítico no es reductible al final del análisis, aunque encuentra allí una encrucijada precisa: la del pasaje de analizante a analista.',
  '2026-01-21',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/publicaciones-imagenes/witz-cover.jpg',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/publicaciones-pdfs/witz-1.pdf',
  ARRAY['WITZ', 'Revista', 'EPFCL'],
  'ISSN (En línea) 3072-9394'
),
(
  'textos',
  'Textos VI SIMPOSIO ESP',
  'Acceso a los textos en español del VI Simposio Interamericano de la IF - EPFCL',
  'La presente compilación no tiene carácter de publicación editada. La misma recoge las ponencias de los participantes en el VI Simposio Interamericano de la IF - EPFCL El Analista y el clínico, llevado a cabo en Buenos Aires del 4 al 6 de julio de 2025.',
  '2025-08-27',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/publicaciones-imagenes/textos-simposio.jpg',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/publicaciones-pdfs/textos-vi-simposio.pdf',
  ARRAY['VARIOS', 'Simposio'],
  NULL
);

-- Eventos existentes
INSERT INTO eventos (titulo, subtitulo, fecha_inicio, fecha_fin, lugar, email, imagen_url, link_externo) VALUES
(
  'VI Simposio Interamericano La IF - EPFCL',
  '"El analista y el clínico"',
  '2025-07-04',
  '2025-07-06',
  'Paseo La Plaza, Buenos Aires, Argentina.',
  'simposiobsas2025@gmail.com',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/eventos-imagenes/simposio.png',
  'https://www.champlacanien.net/public/3/evRDV.php?language=3&menu=1'
),
(
  'XIII° Encuentro de la IF-EPFCL',
  '« Pase al analista: aporías del testimonio » IX° Encuentro Internacional de Escuela',
  '2025-07-23',
  '2025-07-26',
  'Centro de Convenções Rebouças, Avenida Rebouças, 600 - Pinheiros, São Paulo, Brasil',
  'XIII.EncInternacional.IFEPFCL@gmail.com',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/eventos-imagenes/encuentro-internacional.png',
  'https://internacional.campolacanianosp.com.br/es'
),
(
  'III JORNADA ANUAL DE LOS COLEGIOS CLÍNICOS DE AMÉRICA LATINA SUR',
  'La práctica analítica y sus coordenadas',
  '2025-10-18',
  '2025-10-18',
  'On Line',
  'ccforopatcl@gmail.com',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/eventos-imagenes/jornada-colegios.png',
  'https://instagram.com/p/DPd46JokfC_/'
),
(
  'Encuentro EPFCL América Latina Sur',
  'La ética de la escucha',
  '2025-11-07',
  '2025-11-08',
  'Colegio de Psicólogos de San Miguel de Tucumán',
  'encuentro2025@epfcl-tucuman.com.ar',
  'https://[tu-proyecto].supabase.co/storage/v1/object/public/eventos-imagenes/encuentro-tucuman.png',
  'https://instagram.com/p/DPMLru3kdVK/'
);
```

---

## PARTE 4 — WORKFLOW COMPLETO DÍA A DÍA

### Día 1 — Setup
1. Crear repo GitHub `facl-web` (público o privado)
2. Conectar Netlify al repo (auto-deploy en cada push a `main`)
3. Crear proyecto Supabase, correr `schema.sql`
4. **Descargar todos los assets del sitio Framer** (ver script abajo)
5. Subir assets a Supabase Storage
6. Correr `seed.sql` con las URLs actualizadas
7. Abrir Cursor → Cmd+Shift+I → **SPEC-000** → ejecutar

### Día 2 — Base
1. **SPEC-001** (tokens + reset)
2. **SPEC-002** (navbar)
3. **SPEC-003** (footer)
4. **SPEC-004** (supabase client)
5. Test local: `npm run dev`, verificar que navbar y footer se ven bien

### Día 3 — Páginas estáticas
1. **SPEC-010** (home)
2. **SPEC-011** (sobre el foro)
3. **SPEC-012** (los polos)
4. Push a GitHub → verificar deploy en Netlify

### Día 4 — Páginas dinámicas
1. **SPEC-013** (la escuela)
2. **SPEC-014** (contacto)
3. **SPEC-020** (eventos)
4. **SPEC-021** (publicaciones listado)
5. **SPEC-022 + SPEC-023** (detalle + flipbook)
6. Push → verificar todo funciona en producción

### Día 5 — QA
1. **SPEC-QA-001** (setup Playwright)
2. Correr comparativas visuales
3. Revisar checklist QA-002 manualmente
4. Fixes de los issues encontrados
5. Lighthouse audit → ajustes de performance
6. Configurar dominio en Netlify (apuntar DNS de campolacanianoarg.org a Netlify)

---

## Script para descargar assets de Framer

Guardá esto como `scripts/download-assets.mjs` y correlo UNA VEZ:

```javascript
// scripts/download-assets.mjs
// node scripts/download-assets.mjs

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const assets = [
  // Imágenes — utilizá las rutas relativas de la carpeta images
  { url: 'images/2M7so3406cuazLnhGt9p38LFa0.png', name: 'logo-facl.png' },
  { url: 'images/uUDEO41j3xSZWBh8ylcBB9yBM.png', name: 'hero-bg.png' },
  { url: 'images/vpvMTrd6PjeIdWsuEtng144QuNs.jpg', name: 'witz-cover.jpg' },
  { url: 'images/HeNOkdZeXgcuVssSPxLFLJgLpuI.jpg', name: 'textos-simposio.jpg' },
  { url: 'images/0aO0xFObWmrXLQTsVBToQw00.png', name: 'sobre-el-foro.png' },
  { url: 'images/muZzlJnFDne5Wc2RNGuY52GMWk.png', name: 'la-escuela-1.png' },
  { url: 'images/wCkUXnEgWeZ6ZfDyAyK2MOiUQQY.png', name: 'la-escuela-2.png' },
  { url: 'images/7ub5Dv9fYfHrlAsgDL44Qf3X9g.png', name: 'cta-banner.png' },
  { url: 'images/fJeRYaQnJaJeBqPfHExuxfINBfU.png', name: 'evento-simposio.png' },
  { url: 'images/IfG6yiwqzKrOK4UXgYei5QfU.png', name: 'evento-encuentro.png' },
  { url: 'images/fvIBPWPGvBlknVD2JDMaMmh1is.jpeg', name: 'evento-soler.jpg' },
  { url: 'images/VHmFZweROx84xw75zGUoMBSPaqg.jpg', name: 'evento-jornada.jpg' },
  { url: 'images/FjSOLbhcoYcwWwHHBC83hiUbn4.png', name: 'evento-tucuman.png' },
  // PDFs
  { url: 'assets/EpuZK1qsSFDucDCjRwLcRSomfmE.pdf', name: 'witz-1.pdf', type: 'pdf' },
  { url: 'assets/1ti7HGbEhrUxVKhrvxENumh1Q0.pdf', name: 'textos-vi-simposio.pdf', type: 'pdf' },
]

mkdirSync('public/assets/images', { recursive: true })
mkdirSync('public/assets/pdfs', { recursive: true })

for (const asset of assets) {
  const dir = asset.type === 'pdf' ? 'public/assets/pdfs' : 'public/assets/images'
  const filepath = join(dir, asset.name)
  
  try {
    const res = await fetch(asset.url)
    const buffer = await res.arrayBuffer()
    writeFileSync(filepath, Buffer.from(buffer))
    console.log(`✓ ${asset.name}`)
  } catch (e) {
    console.error(`✗ ${asset.name}: ${e.message}`)
  }
}

console.log('\nAssets descargados. Subí los PDFs y las imágenes a Supabase Storage.')
```

---

*FACL Cursor Agents Guide — v1.0 — Junio 2026*
*Guía técnica exhaustiva para Spec Driven Development*
