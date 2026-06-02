# FACL — Plan Maestro de Desarrollo
**Foro Argentino del Campo Lacaniano**
**Versión:** 1.0 — MVP
**Presupuesto:** 450.000 ARS
**Stack:** HTML estático + Supabase + StPageFlip + Netlify

---

## 1. RELEVAMIENTO DE PÁGINAS

### Páginas principales (rutas de primer nivel)

| # | URL | Tipo | Contenido clave | Dinámico |
|---|-----|------|-----------------|----------|
| 1 | `/` | Home | Hero, intro FACL, últimas publicaciones (2), CTAs | Parcial (últimas publicaciones desde Supabase) |
| 2 | `/sobre-el-foro` | Institucional | Historia, reorganización, Polos, Coordinación General, lista de ~120 miembros, Carta IFCL | Estático |
| 3 | `/los-polos` | Institucional | 6 polos con sus miembros: Buenos Aires, NOA, Salta, Patagonia, Mediterráneo, Nuevo Cuyo | Estático |
| 4 | `/la-escuela` | Institucional | Historia EPFCL, objetivo, alcance, COLAGE (responsables + período), CTA publicaciones | Estático |
| 5 | `/eventos` | Dinámica | Grilla de eventos con imagen, título, fechas, lugar, email, link externo | **Dinámico (Supabase)** |
| 6 | `/publicaciones-facl` | Dinámica | Listado de publicaciones con imagen, título, fecha, tags | **Dinámico (Supabase)** |
| 7 | `/publicaciones-facl/[slug]` | Detalle publicación | Imagen, título, descripción, fecha, **visor PDF tipo revista (StPageFlip)**, descarga PDF, nav prev/next | **Dinámico (Supabase)** |
| 8 | `/contacto` | Formulario | Email general, formulario de suscripción (nombre + email), 6 emails por Polo, mapa Google embebido | Estático + Netlify Forms |

### Sub-páginas de publicaciones existentes

| URL | Contenido |
|-----|-----------|
| `/publicaciones-facl/revista-de-psicoanalisis-de-la-epfcl-alsur` | Revista WITZ N°1 — PDF adjunto |
| `/publicaciones-facl/textos` | Textos VI Simposio ESP — PDF adjunto |

**Total: 8 rutas únicas** (expandibles con cada nueva publicación/evento vía Supabase)

---

## 2. ARQUITECTURA TÉCNICA

```
facl-web/
├── public/
│   ├── assets/
│   │   ├── images/          # logos, fotos relevadas del sitio original
│   │   └── fonts/           # fuentes locales (performance)
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── css/
│   │   ├── reset.css
│   │   ├── tokens.css       # design tokens (colores, tipografía, spacing)
│   │   ├── components/      # navbar.css, footer.css, card.css, etc.
│   │   └── pages/           # home.css, publicaciones.css, etc.
│   ├── js/
│   │   ├── supabase-client.js   # cliente Supabase + helpers
│   │   ├── components/
│   │   │   ├── navbar.js        # mobile menu toggle
│   │   │   ├── flipbook.js      # StPageFlip wrapper
│   │   │   └── contact-form.js  # validación + Netlify Forms
│   │   └── pages/
│   │       ├── home.js          # fetch últimas publicaciones
│   │       ├── eventos.js       # fetch + render eventos
│   │       ├── publicaciones.js # fetch + render lista
│   │       └── publicacion.js   # fetch detalle + init flipbook
│   ├── pages/
│   │   ├── index.html
│   │   ├── sobre-el-foro.html
│   │   ├── los-polos.html
│   │   ├── la-escuela.html
│   │   ├── eventos.html
│   │   ├── publicaciones-facl/
│   │   │   └── index.html
│   │   └── contacto.html
│   └── templates/
│       └── publicacion-detalle.html  # template para detalle dinámico
├── netlify.toml             # redirects + headers + form handling
├── vite.config.js           # build tool (opcional, para bundling)
└── package.json
```

### Decisión sobre Vite
Se recomienda **usar Vite** (zero config, gratis) para:
- Importar módulos ES sin CDN
- Minificación automática de CSS/JS
- Hot reload en desarrollo
- Build optimizado para Netlify

Sin Vite también funciona (puro HTML + CDN links), pero Vite no agrega complejidad real.

---

## 3. BASE DE DATOS — SUPABASE SCHEMA

### Tabla: `publicaciones`
```sql
CREATE TABLE publicaciones (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        text UNIQUE NOT NULL,
  titulo      text NOT NULL,
  subtitulo   text,
  descripcion text,
  fecha       date NOT NULL,
  imagen_url  text,
  pdf_url     text NOT NULL,       -- URL del PDF (Supabase Storage o externo)
  tags        text[],              -- ej: ['WITZ', 'Revista', 'EPFCL']
  issn        text,
  activo      boolean DEFAULT true,
  orden       integer DEFAULT 0,   -- para ordenar manualmente
  created_at  timestamptz DEFAULT now()
);
```

### Tabla: `eventos`
```sql
CREATE TABLE eventos (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo        text NOT NULL,
  subtitulo     text,
  fecha_inicio  date NOT NULL,
  fecha_fin     date,
  lugar         text,
  email         text,
  imagen_url    text,
  link_externo  text,
  activo        boolean DEFAULT true,
  orden         integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);
```

### Tabla: `suscriptores` (formulario de contacto)
```sql
CREATE TABLE suscriptores (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre     text NOT NULL,
  email      text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Storage Buckets en Supabase
- `publicaciones-pdfs` → PDFs de revistas y textos (público)
- `publicaciones-imagenes` → portadas (público)
- `eventos-imagenes` → flyers de eventos (público)

### Row Level Security
- Todas las tablas: `SELECT` público (anon key)
- `INSERT/UPDATE/DELETE`: solo con service key (vos desde dashboard)
- `suscriptores`: `INSERT` público (anon key)

---

## 4. VISOR DE REVISTA — STPAGEFLIP

**Librería:** [StPageFlip](https://github.com/Nodlik/StPageFlip) — MIT License, sin costo

**Estrategia de implementación:**
1. El PDF se pre-renderiza como imágenes via **PDF.js** (carga página por página)
2. StPageFlip recibe las imágenes renderizadas y crea el efecto flip
3. Controles: anterior, siguiente, fullscreen, descarga PDF

```javascript
// Flujo técnico en publicacion.js
async function initFlipbook(pdfUrl) {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const pages = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const canvas = await renderPage(pdf, i);
    pages.push(canvas.toDataURL());
  }
  
  const pageFlip = new St.PageFlip(container, {
    width: 550, height: 733,
    showCover: true,
    mobileScrollSupport: false
  });
  
  pageFlip.loadFromImages(pages);
}
```

**Fallback:** Si el PDF es muy pesado, mostrar un spinner con preview de portada y botón de descarga directa.

---

## 5. SEO — ESTRATEGIA

Siendo **SEO First**, cada página tendrá:

```html
<!-- Meta tags completos en cada HTML -->
<title>FACL | Foro Argentino del Campo Lacaniano</title>
<meta name="description" content="..." />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="https://campolacanianoarg.org/..." />
<link rel="canonical" href="https://campolacanianoarg.org/..." />

<!-- Schema.org JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Foro Argentino del Campo Lacaniano",
  "url": "https://campolacanianoarg.org",
  "email": "foroargcl@gmail.com"
}
</script>
```

**Para páginas dinámicas** (publicaciones/eventos detalle):
- El slug determina el título en `<title>` vía JS antes del render
- Se genera un `sitemap.xml` con todas las URLs conocidas
- `robots.txt` permite indexación completa

---

## 6. PLAN DE EJECUCIÓN — SPEC DRIVEN DEVELOPMENT

### FASE 0 — Setup (Día 1) ⏱ ~2hs
- [ ] Crear repo GitHub `facl-web`
- [ ] Setup Netlify (conectar repo, dominio campolacanianoarg.org)
- [ ] Setup Supabase proyecto + schema SQL
- [ ] Crear Supabase Storage buckets + políticas RLS
- [ ] Cargar contenido inicial (2 publicaciones, 5 eventos) desde el sitio actual
- [ ] Descargar y hostear assets (imágenes de framerusercontent.com)
- [ ] Estructura de carpetas + `vite.config.js`
- [ ] Design tokens CSS (colores, fuentes, spacing del sitio original)

### FASE 1 — Componentes Base (Día 1-2) ⏱ ~3hs
- [ ] `SPEC-001`: Header/Navbar (desktop + mobile hamburger)
- [ ] `SPEC-002`: Footer (3 columnas, mapa del sitio, email)
- [ ] `SPEC-003`: Design system (tokens, tipografía, botones, cards)
- [ ] `SPEC-004`: Supabase client + helpers fetch

### FASE 2 — Páginas Estáticas (Día 2-3) ⏱ ~4hs
- [ ] `SPEC-010`: Home (`/`) — hero + sección publicaciones dinámicas
- [ ] `SPEC-011`: Sobre el Foro (`/sobre-el-foro`)
- [ ] `SPEC-012`: Los Polos (`/los-polos`)
- [ ] `SPEC-013`: La Escuela (`/la-escuela`)
- [ ] `SPEC-014`: Contacto (`/contacto`) — formulario Netlify Forms + mapa + polos

### FASE 3 — Páginas Dinámicas (Día 3-4) ⏱ ~4hs
- [ ] `SPEC-020`: Eventos (`/eventos`) — fetch + render desde Supabase
- [ ] `SPEC-021`: Publicaciones lista (`/publicaciones-facl`)
- [ ] `SPEC-022`: Publicación detalle (`/publicaciones-facl/[slug]`)
- [ ] `SPEC-023`: StPageFlip flipbook — integración PDF.js + StPageFlip

### FASE 4 — QA & Comparativa Visual (Día 4-5) ⏱ ~3hs
- [ ] `QA-001`: Checklist cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] `QA-002`: Responsive test (mobile 375px, tablet 768px, desktop 1280px+)
- [ ] `QA-003`: Comparativa visual página por página (screenshot diff)
- [ ] `QA-004`: Performance audit (Lighthouse ≥ 90 en todas las páginas)
- [ ] `QA-005`: SEO audit (meta tags, canonical, OG, sitemap)
- [ ] `QA-006`: Formulario de contacto test end-to-end

### FASE 5 — Deploy & Handoff (Día 5) ⏱ ~1hs
- [ ] Configurar dominio en Netlify
- [ ] HTTPS automático (Let's Encrypt via Netlify)
- [ ] `netlify.toml` con redirects y headers de cache
- [ ] Documentación de actualización de contenido (README)

---

## 7. AGENTES DE CONSTRUCCIÓN Y REVIEW

### Agente 1: Builder
Construye página por página siguiendo cada SPEC. Para cada página:
1. Toma screenshot del sitio original
2. Implementa el HTML/CSS/JS
3. Genera screenshot del nuevo sitio
4. Hace diff visual

### Agente 2: Reviewer
Para cada página completa valida:
- [ ] Contenido idéntico al original (textos, imágenes, links)
- [ ] Layout fiel (márgenes, tipografía, colores)
- [ ] Mobile responsive (menu hamburger funciona, texto legible)
- [ ] Links internos correctos (no 404s)
- [ ] Performance: tiempo de carga < 2s
- [ ] Accesibilidad básica (alt en imágenes, contraste)

### Herramienta de comparativa visual
Script Node.js con **Playwright** que:
1. Abre cada URL del sitio original
2. Abre cada URL del sitio nuevo
3. Captura screenshots a 375px, 768px, 1440px
4. Genera reporte HTML con comparativas side-by-side

```bash
npx playwright test --reporter=html
```

---

## 8. NETLIFY CONFIG

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/publicaciones-facl/*"
  to = "/publicaciones-facl/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 9. VARIABLES DE ENTORNO

```bash
# .env (no commitear)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# En Netlify Dashboard → Environment Variables
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

---

## 10. COSAS ADICIONALES QUE TE PUEDEN FALTAR

### 🟡 Recomendaciones importantes

1. **Descargar todos los assets AHORA**
   Las imágenes están en `framerusercontent.com` y pueden desaparecer cuando la agencia deje de pagar la cuenta Framer. Hay que bajar todas las imágenes y los PDFs inmediatamente.

2. **Transferencia del dominio `campolacanianoarg.org`**
   Si el dominio está registrado a nombre de la agencia, hay que iniciar la transferencia de inmediato. Esto puede tomar 5-7 días y requiere el código EPP.

3. **Formulario de suscripción**
   Netlify Forms maneja hasta 100 envíos/mes gratis. Si superan eso, Formspree free tier (50/mes) o EmailJS son alternativas gratuitas.

4. **No hay redes sociales conectadas en el sitio** (solo un "Ver Instagram" en Eventos sin link). Confirmar si el cliente quiere agregar links reales.

5. **Panel admin mínimo para MVP 2**
   Para que el cliente pueda eventualmente actualizar sin depender de vos, se puede armar un micro-admin con **Netlify CMS** (ahora Decap CMS) o directamente Supabase Studio con un usuario limitado. Costo: $0.

6. **Analytics gratuitos**
   Agregar **Plausible** (open source, auto-hosteable) o **Umami** en lugar de Google Analytics para cumplir GDPR/privacidad. Ambos tienen tier gratuito en Netlify.

7. **El PDF de WITZ pesa ~20MB** (estimado para una revista). StPageFlip + PDF.js puede ser lento en mobile. Considerar pre-renderizar las páginas como imágenes WebP durante el build y subirlas a Supabase Storage como fallback optimizado.

---

## 11. CHECKLIST DE INICIO

Antes de escribir una sola línea de código, confirmar:

- [ ] ✅ Cliente firmó transferencia de activos (dominio, imágenes, PDFs)
- [ ] ✅ Acceso a cuenta de email del cliente (foroargcl@gmail.com) para verificaciones
- [ ] ✅ PDFs descargados localmente (WITZ + Textos VI Simposio)
- [ ] ✅ Todas las imágenes descargadas de framerusercontent.com
- [ ] ✅ Repo GitHub creado
- [ ] ✅ Cuenta Supabase creada (free tier)
- [ ] ✅ Cuenta Netlify creada + repo conectado
- [ ] ✅ Variables de entorno configuradas

---

## 12. ESTIMACIÓN DE TIEMPOS

| Fase | Tarea | Horas |
|------|-------|-------|
| 0 | Setup completo | 2hs |
| 1 | Componentes base | 3hs |
| 2 | 5 páginas estáticas | 4hs |
| 3 | 3 páginas dinámicas + flipbook | 5hs |
| 4 | QA + comparativa visual | 3hs |
| 5 | Deploy + docs | 1hs |
| **Total** | | **~18hs de trabajo** |

Con 450.000 ARS y ~18hs de trabajo efectivo, la tarifa resultante es de ~25.000 ARS/hora. Razonable para un MVP de estas características con tech stack sólido y documentado.

---

*Documento generado como guía de Spec Driven Development para el proyecto FACL.*
*Versión 1.0 — Junio 2026*
