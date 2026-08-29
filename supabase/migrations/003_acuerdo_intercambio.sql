-- ============================================================================
-- Kinami — acuerdo de intercambio (normas de la casa + confirmación mutua)
-- Ejecuta este archivo en Supabase: Project > SQL Editor > New query,
-- DESPUÉS de supabase/schema.sql y 002_borrar_cuenta.sql.
--
-- No es un contrato legal ni sustituye el seguro de hogar de nadie — es un
-- acuerdo informal entre las dos partes de un intercambio, al estilo de lo
-- que ya hace Airbnb con sus normas de la casa. El aviso legal se muestra
-- siempre en la interfaz, no solo aquí.
-- ============================================================================

create table if not exists public.swap_agreements (
  swap_request_id uuid primary key references public.swap_requests(id) on delete cascade,
  house_rules text,
  owner_accepted_at timestamptz,
  requester_accepted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.swap_agreements enable row level security;

-- Mismas dos personas que ya tienen acceso a la solicitud de intercambio:
-- quien la pidió y quien es dueño de la casa (reutiliza el helper existente).
drop policy if exists "swap_agreements_select" on public.swap_agreements;
create policy "swap_agreements_select" on public.swap_agreements for select
  using (public.can_access_swap_request(swap_request_id));

drop policy if exists "swap_agreements_insert" on public.swap_agreements;
create policy "swap_agreements_insert" on public.swap_agreements for insert
  with check (public.can_access_swap_request(swap_request_id));

drop policy if exists "swap_agreements_update" on public.swap_agreements;
create policy "swap_agreements_update" on public.swap_agreements for update
  using (public.can_access_swap_request(swap_request_id));
