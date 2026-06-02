import { defineConfig } from 'vite'
import { resolve } from 'path'

/**
 * En dev, reescribe /sobre-el-foro → /sobre-el-foro/index.html
 * para igualar las URLs de producción (sin prefijo /pages ni .html).
 */
function devCleanUrls() {
  return {
    name: 'dev-clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }

        const raw = req.url ?? '/'
        const [pathname, search = ''] = raw.split('?')

        if (
          pathname === '/' ||
          pathname.includes('.') ||
          pathname.startsWith('/@') ||
          pathname.startsWith('/__')
        ) {
          next()
          return
        }

        const base = pathname.endsWith('/') ? pathname : `${pathname}/`
        req.url = `${base}index.html${search ? `?${search}` : ''}`
        next()
      })
    },
  }
}

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  appType: 'mpa',
  plugins: [devCleanUrls()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        'sobre-el-foro': resolve(__dirname, 'src/sobre-el-foro/index.html'),
        'los-polos': resolve(__dirname, 'src/los-polos/index.html'),
        'la-escuela': resolve(__dirname, 'src/la-escuela/index.html'),
        eventos: resolve(__dirname, 'src/eventos/index.html'),
        contacto: resolve(__dirname, 'src/contacto/index.html'),
        'publicaciones-facl': resolve(
          __dirname,
          'src/publicaciones-facl/index.html'
        ),
      },
    },
  },
})
