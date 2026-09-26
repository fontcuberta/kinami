-- ============================================================================
-- Kinami — fotos de la rueda de ejemplo + bloquear invitación KINAMIEX
-- Ejecuta DESPUÉS de 007_demo_tour_signatures.sql
-- ============================================================================

-- Fotos empaquetadas en public/demo (rutas absolutas del sitio)
update public.homes
set photos = array[
  '/demo/barcelona-living.jpg',
  '/demo/barcelona-bedroom.jpg'
]
where id = 'a0000000-0000-4000-8000-000000000010'::uuid;

update public.homes
set photos = array[
  '/demo/girona-exterior.jpg',
  '/demo/girona-garden.jpg'
]
where id = 'a0000000-0000-4000-8000-000000000011'::uuid;

-- Nadie puede unirse a la rueda de ejemplo por código (solo auto-join al registrarse)
create or replace function public.join_circle_by_code(code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  target_circle_id uuid;
  invite text := upper(trim(code));
begin
  if invite = 'KINAMIEX' then
    raise exception 'La rueda de ejemplo no acepta invitaciones';
  end if;

  select id into target_circle_id
  from public.circles
  where invite_code = invite;

  if target_circle_id is null then
    raise exception 'Código de invitación no válido';
  end if;

  if target_circle_id = 'a0000000-0000-4000-8000-000000000001'::uuid then
    raise exception 'La rueda de ejemplo no acepta invitaciones';
  end if;

  insert into public.circle_members (circle_id, user_id, role)
  values (target_circle_id, auth.uid(), 'member')
  on conflict (circle_id, user_id) do nothing;

  return target_circle_id;
end;
$$;

grant execute on function public.join_circle_by_code(text) to authenticated;
