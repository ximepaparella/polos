-- Schema FACL — solo si arrancás un proyecto nuevo.
-- En el proyecto actual (jcucrgshuxcaxkwljghe) las tablas ya están creadas.
-- Ejecutar en Supabase → SQL Editor.

create table if not exists publicaciones (
  id          uuid default gen_random_uuid() primary key,
  slug        text unique not null,
  titulo      text not null,
  subtitulo   text,
  descripcion text,
  fecha       date not null,
  fecha_label text,
  imagen_url  text,
  pdf_url     text not null,
  tags        text[] default '{}',
  issn        text,
  activo      boolean default true,
  orden       integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table if not exists eventos (
  id            uuid default gen_random_uuid() primary key,
  titulo        text not null,
  subtitulo     text,
  descripcion   text,
  fecha_inicio  date not null,
  fecha_fin     date,
  lugar         text,
  email         text,
  imagen_url    text,
  link_externo  text,
  activo        boolean default true,
  orden         integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table publicaciones enable row level security;
alter table eventos enable row level security;

drop policy if exists "publicaciones_select" on publicaciones;
drop policy if exists "eventos_select" on eventos;

create policy "publicaciones_select" on publicaciones for select using (true);
create policy "eventos_select" on eventos for select using (true);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists publicaciones_updated_at on publicaciones;
drop trigger if exists eventos_updated_at on eventos;

create trigger publicaciones_updated_at
  before update on publicaciones
  for each row execute function update_updated_at();

create trigger eventos_updated_at
  before update on eventos
  for each row execute function update_updated_at();
