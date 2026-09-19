-- ============================================================================
-- Kinami — guía de la casa (electrodomésticos, extras y cómo funciona)
-- Ejecuta este archivo en Supabase: Project > SQL Editor > New query,
-- DESPUÉS de schema.sql y las migraciones 002 y 003.
-- ============================================================================

alter table public.homes
  add column if not exists amenities jsonb not null default '{}'::jsonb;

alter table public.homes
  add column if not exists house_manual text;
