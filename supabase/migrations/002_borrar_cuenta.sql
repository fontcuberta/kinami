-- ============================================================================
-- Kinami — borrado de cuenta propio (self-service account deletion)
-- Ejecuta este archivo en Supabase: Project > SQL Editor > New query,
-- DESPUÉS de haber ejecutado supabase/schema.sql.
--
-- Por qué: para que nadie tenga que pedirte a ti (el dueño del proyecto de
-- Supabase) que borre sus datos. Cualquier usuario puede borrar su cuenta
-- y todo lo suyo (perfil, casas, fotos, membresías de rueda, solicitudes y
-- mensajes) desde la propia app, sin intervención manual.
-- ============================================================================

-- "circles.created_by" no tenía "on delete", así que borrar la cuenta de
-- alguien que hubiera creado una rueda fallaba (violación de clave foránea).
-- Lo cambiamos a SET NULL: la rueda y sus miembros siguen existiendo, solo
-- se pierde el rastro de quién la creó originalmente.
alter table public.circles
  alter column created_by drop not null;

alter table public.circles
  drop constraint if exists circles_created_by_fkey;

alter table public.circles
  add constraint circles_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

-- Borra la cuenta del usuario autenticado y, en cadena (ON DELETE CASCADE
-- ya definido en schema.sql), su profile, sus casas, sus membresías de
-- rueda, sus solicitudes de intercambio y sus mensajes. security definer
-- porque un usuario normal no tiene permiso para escribir en auth.users
-- directamente.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  -- limpia las fotos de sus casas en el bucket antes de borrar el usuario
  delete from storage.objects
  where bucket_id = 'home-photos' and owner = auth.uid();

  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
