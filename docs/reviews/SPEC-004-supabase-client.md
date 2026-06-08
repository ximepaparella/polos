# SPEC-004 — Supabase Client

**Archivo:** `src/js/supabase-client.js`  
**Tests:** `npm run test:supabase`

## Configuración

Copiar `.env.example` a `.env` y completar:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

Vite expone las variables con prefijo `VITE_` vía `import.meta.env`.

## API exportada

| Export | Uso |
|--------|-----|
| `supabase` | Cliente Supabase (null si faltan env vars) |
| `getPublicaciones(limit?)` | Listado activo, `fecha DESC` |
| `getPublicacionBySlug(slug)` | Detalle por slug |
| `getPublicacionesAdyacentes(slug, fecha)` | Nav prev/next |
| `getEventos()` | Eventos activos, `fecha_inicio ASC` |
| `suscribir(nombre, email)` | Alta en `suscriptores` |
| `formatFecha(iso)` | `"2026-01-21"` → `"21 ene 2026"` |

## Tablas esperadas

- `publicaciones` — `activo`, `slug`, `titulo`, `fecha`, `imagen_url`, etc.
- `eventos` — `activo`, `fecha_inicio`, etc.
- `suscriptores` — `nombre`, `email` (unique)

## Comportamiento sin `.env`

Si faltan credenciales, el módulo no rompe el build: `supabase` es `null` y los helpers devuelven `[]`, `null` o `{ ok: false }` según corresponda.

## Próximo uso

- SPEC-010 (home) → `getPublicaciones(2)`, `formatFecha`
- SPEC-014 (contacto) → `suscribir`
- SPEC-020 (eventos) → `getEventos`
- SPEC-021–023 (publicaciones) → helpers de publicaciones
