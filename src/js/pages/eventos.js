import { initLayout } from '../init-layout.js'
import { getEventos } from '../supabase-client.js'
import {
  renderCardEvento,
  renderCardEventoSkeleton,
} from '../components/card-evento.js'

initLayout()

const FALLBACK_EVENTOS = [
  {
    titulo: 'VI Simposio Interamericano La IF - EPFCL',
    subtitulo: '"El analista y el clínico"',
    fecha_inicio: '2025-07-04',
    fecha_fin: '2025-07-06',
    lugar: 'Paseo La Plaza, Buenos Aires, Argentina.',
    email: 'simposiobsas2025@gmail.com',
    email_prefijo: 'Informes e Inscripciones: ',
    imagen_url: '/assets/images/evento-simposio.png',
    link_externo: 'https://www.champlacanien.net/public/3/evRDV.php?language=3&menu=1',
  },
  {
    titulo: 'La ética del psicoanálisis y las otras. XIII° Encuentro de la IF-EPFCL',
    subtitulo:
      '« Pase al analista: aporías del testimonio » IX° Encuentro Internacional de Escuela',
    fecha_inicio: '2025-07-23',
    fecha_fin: '2025-07-26',
    lugar:
      'Centro de Convenções Rebouças, Avenida Rebouças, 600 - Pinheiros, São Paulo, SP - SP, CEP. 05402-000',
    email: 'XIII.EncInternacional.IFEPFCL@gmail.com',
    imagen_url: '/assets/images/evento-encuentro.png',
    link_externo: 'https://internacional.campolacanianosp.com.br/es',
  },
  {
    titulo: 'PREVENTA EXCLUSIVA - CLÍNICA DE LA REALIDAD / COLETTE SOLER',
    subtitulo: '',
    fecha_inicio: '2025-10-15',
    fecha_fin: '2025-10-15',
    lugar: '',
    email: '',
    imagen_url: '/assets/images/evento-soler.jpg',
    link_externo: 'https://instagram.com/p/DPKbdLVkY9V/',
  },
  {
    titulo: 'III JORNADA ANUAL DE LOS COLEGIOS CLÍNICOS DE AMÉRICA LATINA SUR',
    subtitulo: 'La práctica anaítica y sus coordenadas',
    fecha_inicio: '2025-10-18',
    fecha_fin: '2025-10-18',
    lugar: 'On Line',
    email: 'ccforopatcl@gmail.com',
    imagen_url: '/assets/images/evento-jornada.jpg',
    link_externo: 'https://instagram.com/p/DPd46JokfC_/',
  },
  {
    titulo: 'Encuentro EPFCL América Latina Sur La ética de la escucha',
    subtitulo:
      'Encuentro anual de la EPFCL America Latina Sur, este año en la ciudad de San Miguel de Tucumán.',
    fecha_inicio: '2025-11-07',
    fecha_fin: '2025-11-08',
    lugar: 'Colegio de Psicólogos de San Miguel de Tucumán',
    email: 'encuentro2025@epfcl-tucuman.com.ar',
    imagen_url: '/assets/images/evento-tucuman.png',
    link_externo: 'https://instagram.com/p/DPMLru3kdVK/',
  },
]

function showInitialSkeletons(grid) {
  grid.innerHTML = `${renderCardEventoSkeleton()}${renderCardEventoSkeleton()}${renderCardEventoSkeleton()}`
}

async function renderEventos() {
  const grid = document.getElementById('eventos-grid')

  if (!grid) {
    return
  }

  showInitialSkeletons(grid)
  grid.setAttribute('aria-busy', 'true')

  let eventos = []

  try {
    eventos = await getEventos()
  } catch (error) {
    console.error('Error cargando eventos:', error)
    grid.setAttribute('aria-busy', 'false')
    grid.innerHTML =
      '<p class="eventos-grid__error" role="alert">No se pudieron cargar los eventos.</p>'
    return
  }

  if (!eventos.length) {
    eventos = FALLBACK_EVENTOS
  }

  grid.setAttribute('aria-busy', 'false')
  grid.innerHTML = eventos.map(renderCardEvento).join('')
}

renderEventos()
