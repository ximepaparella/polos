-- Seed FACL — pegar en Supabase → SQL Editor → Run
-- Las tablas ya existen. Este script agrega fecha_label (si falta) y carga datos.
-- PDFs/imágenes viven en Netlify (/assets/...), no hace falta Storage.

alter table publicaciones
  add column if not exists fecha_label text;

-- Evitar duplicar si ya corriste el seed
delete from publicaciones
where slug in (
  'revista-witz-2',
  'revista-de-psicoanalisis-de-la-epfcl-alsur',
  'textos'
);

insert into publicaciones (
  slug, titulo, subtitulo, descripcion, fecha, fecha_label,
  imagen_url, pdf_url, tags, issn, activo
) values
(
  'revista-witz-2',
  'WITZ 2',
  'Las transformaciones del Deseo',
  'Esta revista recoge los trabajos presentados en las Jornadas de Cartel y Escuela que se llevaron a cabo en Puerto Madryn (2024). "Las transformaciones del deseo" es el título que nos lleva a preguntarnos de qué transformaciones se trata cuando hablamos del deseo, y a recorrer el deseo del analista, la supervisión, el malestar contemporáneo y las mutaciones del final del análisis.',
  '2026-10-01',
  'Octubre 2026',
  '/assets/images/witz-2-cover.jpg',
  '/assets/pdfs/witz-2.pdf',
  array['Revista WITZ 2 ISSN (en línea) 3072-9394'],
  null,
  true
),
(
  'revista-de-psicoanalisis-de-la-epfcl-alsur',
  'WITZ',
  'Revista de Psicoanálisis de la EPFCL América Latina Sur',
  'Esta revista recoge parte del trabajo propiciado en las Jornadas de Escuela y de Carteles que se llevaron a cabo en Salta (2022) y en Mendoza (2023). "Los tiempos del acto analítico" es el título que nos lleva a partir de una afirmación: el acto analítico no es reductible al final del análisis, aunque encuentra allí una encrucijada precisa: la del pasaje de analizante a analista.',
  '2026-01-21',
  null,
  '/assets/images/witz-cover.jpg',
  '/assets/pdfs/witz-1.pdf',
  array['Revista WITZ 1 ISSN (en línea) 3072-9394'],
  'ISSN (En línea) 3072-9394',
  true
),
(
  'textos',
  'Textos VI SIMPOSIO ESP',
  'Acceso a los textos en español del VI Simposio Interamericano de la IF - EPFCL',
  '',
  '2025-08-27',
  null,
  '/assets/images/textos-simposio.jpg',
  '/assets/pdfs/textos-vi-simposio.pdf',
  array['VARIOS'],
  null,
  true
);

-- Eventos (opcional: solo si la tabla eventos está vacía)
delete from eventos
where titulo in (
  'VI Simposio Interamericano La IF - EPFCL',
  'La ética del psicoanálisis y las otras. XIII° Encuentro de la IF-EPFCL',
  'PREVENTA EXCLUSIVA - CLÍNICA DE LA REALIDAD / COLETTE SOLER',
  'III JORNADA ANUAL DE LOS COLEGIOS CLÍNICOS DE AMÉRICA LATINA SUR',
  'Encuentro EPFCL América Latina Sur La ética de la escucha'
);

insert into eventos (
  titulo, subtitulo, fecha_inicio, fecha_fin, lugar, email, imagen_url, link_externo, activo
) values
(
  'VI Simposio Interamericano La IF - EPFCL',
  '"El analista y el clínico"',
  '2025-07-04',
  '2025-07-06',
  'Paseo La Plaza, Buenos Aires, Argentina.',
  'simposiobsas2025@gmail.com',
  '/assets/images/evento-simposio.png',
  'https://www.champlacanien.net/public/3/evRDV.php?language=3&menu=1',
  true
),
(
  'La ética del psicoanálisis y las otras. XIII° Encuentro de la IF-EPFCL',
  '« Pase al analista: aporías del testimonio » IX° Encuentro Internacional de Escuela',
  '2025-07-23',
  '2025-07-26',
  'Centro de Convenções Rebouças, Avenida Rebouças, 600 - Pinheiros, São Paulo, SP - SP, CEP. 05402-000',
  'XIII.EncInternacional.IFEPFCL@gmail.com',
  '/assets/images/evento-encuentro.png',
  'https://internacional.campolacanianosp.com.br/es',
  true
),
(
  'PREVENTA EXCLUSIVA - CLÍNICA DE LA REALIDAD / COLETTE SOLER',
  '',
  '2025-10-15',
  '2025-10-15',
  '',
  '',
  '/assets/images/evento-soler.jpg',
  'https://instagram.com/p/DPKbdLVkY9V/',
  true
),
(
  'III JORNADA ANUAL DE LOS COLEGIOS CLÍNICOS DE AMÉRICA LATINA SUR',
  'La práctica anaítica y sus coordenadas',
  '2025-10-18',
  '2025-10-18',
  'On Line',
  'ccforopatcl@gmail.com',
  '/assets/images/evento-jornada.jpg',
  'https://instagram.com/p/DPd46JokfC_/',
  true
),
(
  'Encuentro EPFCL América Latina Sur La ética de la escucha',
  'Encuentro anual de la EPFCL America Latina Sur, este año en la ciudad de San Miguel de Tucumán.',
  '2025-11-07',
  '2025-11-08',
  'Colegio de Psicólogos de San Miguel de Tucumán',
  'encuentro2025@epfcl-tucuman.com.ar',
  '/assets/images/evento-tucuman.png',
  'https://instagram.com/p/DPMLru3kdVK/',
  true
);
