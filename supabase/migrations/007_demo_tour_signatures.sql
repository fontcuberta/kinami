-- ============================================================================
-- Kinami — rueda de ejemplo, onboarding y firmas dibujadas
-- Ejecuta este archivo en Supabase SQL Editor DESPUÉS de 006_profile_avatars.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Perfil: marca de fin de tour (null = mostrar tour en el primer login)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

-- ---------------------------------------------------------------------------
-- Firmas dibujadas del contrato
-- ---------------------------------------------------------------------------
alter table public.swap_agreements
  add column if not exists owner_signature_path text;

alter table public.swap_agreements
  add column if not exists requester_signature_path text;

-- Bucket privado: {swap_request_id}/{user_id}.png
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'signatures',
  'signatures',
  false,
  1048576,
  array['image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "signatures_select_parties" on storage.objects;
create policy "signatures_select_parties" on storage.objects for select
  using (
    bucket_id = 'signatures'
    and auth.uid() is not null
    and public.can_access_swap_request(
      nullif(split_part(name, '/', 1), '')::uuid
    )
  );

drop policy if exists "signatures_insert_own" on storage.objects;
create policy "signatures_insert_own" on storage.objects for insert
  with check (
    bucket_id = 'signatures'
    and auth.uid() is not null
    and public.can_access_swap_request(
      nullif(split_part(name, '/', 1), '')::uuid
    )
    and split_part(name, '/', 2) = auth.uid()::text || '.png'
  );

drop policy if exists "signatures_update_own" on storage.objects;
create policy "signatures_update_own" on storage.objects for update
  using (
    bucket_id = 'signatures'
    and auth.uid() is not null
    and split_part(name, '/', 2) = auth.uid()::text || '.png'
  )
  with check (
    bucket_id = 'signatures'
    and auth.uid() is not null
    and split_part(name, '/', 2) = auth.uid()::text || '.png'
  );

drop policy if exists "signatures_delete_own" on storage.objects;
create policy "signatures_delete_own" on storage.objects for delete
  using (
    bucket_id = 'signatures'
    and auth.uid() is not null
    and split_part(name, '/', 2) = auth.uid()::text || '.png'
  );

-- ---------------------------------------------------------------------------
-- Borrado de cuenta: limpia también firmas
-- ---------------------------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  delete from storage.objects
  where bucket_id = 'home-photos' and owner = auth.uid();

  delete from storage.objects
  where bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text;

  delete from storage.objects
  where bucket_id = 'signatures'
    and split_part(name, '/', 2) = auth.uid()::text || '.png';

  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;

-- ---------------------------------------------------------------------------
-- Constantes de la rueda de ejemplo (UUIDs fijos)
-- ---------------------------------------------------------------------------
-- Demo host:  a0000000-0000-4000-8000-000000000000
-- Demo circle: a0000000-0000-4000-8000-000000000001
-- Homes:       a0000000-0000-4000-8000-000000000010 / …011

-- ---------------------------------------------------------------------------
-- handle_new_user: crea perfil + une a la rueda de ejemplo si existe
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;

  insert into public.circle_members (circle_id, user_id, role)
  select 'a0000000-0000-4000-8000-000000000001'::uuid, new.id, 'member'
  where exists (
    select 1 from public.circles
    where id = 'a0000000-0000-4000-8000-000000000001'::uuid
  )
  on conflict (circle_id, user_id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Semilla: usuario demo + rueda + casas + disponibilidad
-- ---------------------------------------------------------------------------
do $$
declare
  demo_uid constant uuid := 'a0000000-0000-4000-8000-000000000000';
  demo_circle constant uuid := 'a0000000-0000-4000-8000-000000000001';
  home_bcn constant uuid := 'a0000000-0000-4000-8000-000000000010';
  home_girona constant uuid := 'a0000000-0000-4000-8000-000000000011';
begin
  if not exists (select 1 from auth.users where id = demo_uid) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      '00000000-0000-0000-0000-000000000000',
      demo_uid,
      'authenticated',
      'authenticated',
      'demo-host@kinami.app',
      extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Kinami Demo"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      demo_uid,
      jsonb_build_object(
        'sub', demo_uid::text,
        'email', 'demo-host@kinami.app',
        'email_verified', true
      ),
      'email',
      demo_uid::text,
      now(),
      now(),
      now()
    );
  end if;

  update public.profiles
  set full_name = coalesce(nullif(full_name, ''), 'Kinami Demo')
  where id = demo_uid;

  insert into public.circles (id, name, description, invite_code, created_by)
  values (
    demo_circle,
    'Example circle',
    'Sample homes so you can explore Kinami. You can leave this circle any time.',
    'KINAMIEX',
    demo_uid
  )
  on conflict (id) do nothing;

  -- Si el círculo ya existía sin el trigger, asegura al host como admin
  insert into public.circle_members (circle_id, user_id, role)
  values (demo_circle, demo_uid, 'admin')
  on conflict (circle_id, user_id) do nothing;

  insert into public.homes (
    id, owner_id, title, description, city, country, photos, amenities, house_manual
  ) values (
    home_bcn,
    demo_uid,
    'Sunny flat near the beach',
    'A bright two-bedroom flat five minutes from the sea. Perfect for trying how Kinami works — this is sample data.',
    'Barcelona',
    'Spain',
    array['/demo/barcelona-living.jpg', '/demo/barcelona-bedroom.jpg'],
    '{"wifi":{"has":true,"notes":""},"washing_machine":{"has":true,"notes":""},"heater":{"has":true,"notes":""}}'::jsonb,
    'Keys in the lockbox by the door. Code shared after you accept a swap.'
  )
  on conflict (id) do nothing;

  insert into public.homes (
    id, owner_id, title, description, city, country, photos, amenities, house_manual
  ) values (
    home_girona,
    demo_uid,
    'Quiet house with a garden',
    'A small house with a terrace and bikes in the shed. Sample listing for the example circle.',
    'Girona',
    'Spain',
    array['/demo/girona-exterior.jpg', '/demo/girona-garden.jpg'],
    '{"wifi":{"has":true,"notes":""},"parking":{"has":true,"notes":""},"ac":{"has":true,"notes":""}}'::jsonb,
    'Garden hose on the left side of the house. Recycling bins on Tuesdays.'
  )
  on conflict (id) do nothing;

  insert into public.home_circles (home_id, circle_id)
  values
    (home_bcn, demo_circle),
    (home_girona, demo_circle)
  on conflict do nothing;

  insert into public.availability (home_id, start_date, end_date, notes)
  select home_bcn, current_date + 21, current_date + 35, 'Sample window — feel free to request a swap to try the flow.'
  where not exists (
    select 1 from public.availability
    where home_id = home_bcn
      and start_date = current_date + 21
      and end_date = current_date + 35
  );

  insert into public.availability (home_id, start_date, end_date, notes)
  select home_girona, current_date + 40, current_date + 54, 'Another sample window in the example circle.'
  where not exists (
    select 1 from public.availability
    where home_id = home_girona
      and start_date = current_date + 40
      and end_date = current_date + 54
  );

  -- Une a todos los perfiles existentes (excepto el host, ya admin)
  insert into public.circle_members (circle_id, user_id, role)
  select demo_circle, p.id, 'member'
  from public.profiles p
  where p.id <> demo_uid
  on conflict (circle_id, user_id) do nothing;
end;
$$;
