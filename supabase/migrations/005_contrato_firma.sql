-- ============================================================================
-- Kinami — firma del contrato de intercambio
-- Ejecuta este archivo en Supabase SQL Editor DESPUÉS de 003_acuerdo_intercambio.sql
-- ============================================================================

alter table public.swap_agreements
  add column if not exists owner_signed_name text;

alter table public.swap_agreements
  add column if not exists requester_signed_name text;

alter table public.swap_agreements
  add column if not exists contract_text text;

alter table public.swap_agreements
  add column if not exists contract_locale text;
