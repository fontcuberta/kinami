-- ============================================================================
-- Kinami — schema inicial
-- Ejecuta este archivo completo en Supabase: Project > SQL Editor > New query
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES (uno por usuario de auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now()
);

-- Crea el profile automáticamente cuando alguien se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- CIRCLES ("ruedas") + membresías
-- ---------------------------------------------------------------------------
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text not null unique,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (circle_id, user_id)
);

-- Genera un código de invitación corto si no se especifica
create or replace function public.generate_invite_code()
returns text
language sql
as $$
  select upper(substr(md5(gen_random_uuid()::text), 1, 7));
$$;

alter table public.circles
  alter column invite_code set default public.generate_invite_code();

-- Al crear una rueda, el creador entra automáticamente como admin
create or replace function public.handle_new_circle()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.circle_members (circle_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

drop trigger if exists on_circle_created on public.circles;
create trigger on_circle_created
  after insert on public.circles
  for each row execute procedure public.handle_new_circle();

-- Helper (security definer para evitar recursión de RLS) para saber si
-- el usuario autenticado pertenece a una rueda dada.
create or replace function public.is_circle_member(target_circle_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.circle_members
    where circle_id = target_circle_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_circle_admin(target_circle_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.circle_members
    where circle_id = target_circle_id and user_id = auth.uid() and role = 'admin'
  );
$$;

-- Unirse a una rueda por código de invitación. security definer porque un
-- usuario que aún no es miembro no puede hacer SELECT sobre circles (RLS).
create or replace function public.join_circle_by_code(code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  target_circle_id uuid;
begin
  select id into target_circle_id
  from public.circles
  where invite_code = upper(trim(code));

  if target_circle_id is null then
    raise exception 'Código de invitación no válido';
  end if;

  insert into public.circle_members (circle_id, user_id, role)
  values (target_circle_id, auth.uid(), 'member')
  on conflict (circle_id, user_id) do nothing;

  return target_circle_id;
end;
$$;

grant execute on function public.join_circle_by_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- HOMES + a qué ruedas están compartidas
-- ---------------------------------------------------------------------------
create table if not exists public.homes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  city text not null,
  country text not null,
  photos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.home_circles (
  home_id uuid not null references public.homes(id) on delete cascade,
  circle_id uuid not null references public.circles(id) on delete cascade,
  primary key (home_id, circle_id)
);

create or replace function public.home_visible_to_user(target_home_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.homes h where h.id = target_home_id and h.owner_id = auth.uid()
  ) or exists (
    select 1
    from public.home_circles hc
    join public.circle_members cm on cm.circle_id = hc.circle_id
    where hc.home_id = target_home_id and cm.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- AVAILABILITY
-- ---------------------------------------------------------------------------
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- SWAP REQUESTS + MESSAGES
-- ---------------------------------------------------------------------------
create table if not exists public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  home_id uuid not null references public.homes(id) on delete cascade,
  circle_id uuid not null references public.circles(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create or replace function public.can_access_swap_request(target_request_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1
    from public.swap_requests sr
    join public.homes h on h.id = sr.home_id
    where sr.id = target_request_id
      and (sr.requester_id = auth.uid() or h.owner_id = auth.uid())
  );
$$;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  swap_request_id uuid not null references public.swap_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.homes enable row level security;
alter table public.home_circles enable row level security;
alter table public.availability enable row level security;
alter table public.swap_requests enable row level security;
alter table public.messages enable row level security;

-- PROFILES: ves tu propio perfil y el de gente con la que compartes rueda
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.circle_members me
      join public.circle_members them on them.circle_id = me.circle_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (id = auth.uid());

-- CIRCLES: ves las ruedas de las que eres miembro; cualquiera autenticado puede crear una
drop policy if exists "circles_select" on public.circles;
create policy "circles_select" on public.circles for select
  using (public.is_circle_member(id));

drop policy if exists "circles_insert" on public.circles;
create policy "circles_insert" on public.circles for insert
  with check (created_by = auth.uid());

drop policy if exists "circles_update_admin" on public.circles;
create policy "circles_update_admin" on public.circles for update
  using (public.is_circle_admin(id));

-- CIRCLE_MEMBERS: ves los miembros de tus ruedas; te puedes añadir tú mismo (join por código, validado en la app)
drop policy if exists "circle_members_select" on public.circle_members;
create policy "circle_members_select" on public.circle_members for select
  using (public.is_circle_member(circle_id));

drop policy if exists "circle_members_insert_self" on public.circle_members;
create policy "circle_members_insert_self" on public.circle_members for insert
  with check (user_id = auth.uid());

drop policy if exists "circle_members_delete_self_or_admin" on public.circle_members;
create policy "circle_members_delete_self_or_admin" on public.circle_members for delete
  using (user_id = auth.uid() or public.is_circle_admin(circle_id));

-- HOMES: ves las tuyas y las compartidas en tus ruedas; solo el dueño edita
drop policy if exists "homes_select" on public.homes;
create policy "homes_select" on public.homes for select
  using (public.home_visible_to_user(id));

drop policy if exists "homes_insert_own" on public.homes;
create policy "homes_insert_own" on public.homes for insert
  with check (owner_id = auth.uid());

drop policy if exists "homes_update_own" on public.homes;
create policy "homes_update_own" on public.homes for update
  using (owner_id = auth.uid());

drop policy if exists "homes_delete_own" on public.homes;
create policy "homes_delete_own" on public.homes for delete
  using (owner_id = auth.uid());

-- HOME_CIRCLES: visible a quien vea la casa; solo el dueño de la casa
-- puede compartirla, y solo en ruedas de las que él mismo es miembro
drop policy if exists "home_circles_select" on public.home_circles;
create policy "home_circles_select" on public.home_circles for select
  using (public.home_visible_to_user(home_id));

drop policy if exists "home_circles_insert" on public.home_circles;
create policy "home_circles_insert" on public.home_circles for insert
  with check (
    exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid())
    and public.is_circle_member(circle_id)
  );

drop policy if exists "home_circles_delete" on public.home_circles;
create policy "home_circles_delete" on public.home_circles for delete
  using (
    exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid())
  );

-- AVAILABILITY: visible a quien vea la casa; solo el dueño la gestiona
drop policy if exists "availability_select" on public.availability;
create policy "availability_select" on public.availability for select
  using (public.home_visible_to_user(home_id));

drop policy if exists "availability_insert" on public.availability;
create policy "availability_insert" on public.availability for insert
  with check (exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid()));

drop policy if exists "availability_update" on public.availability;
create policy "availability_update" on public.availability for update
  using (exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid()));

drop policy if exists "availability_delete" on public.availability;
create policy "availability_delete" on public.availability for delete
  using (exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid()));

-- SWAP_REQUESTS: el solicitante y el dueño de la casa las ven;
-- cualquier miembro de la rueda (menos el dueño) puede solicitar
drop policy if exists "swap_requests_select" on public.swap_requests;
create policy "swap_requests_select" on public.swap_requests for select
  using (
    requester_id = auth.uid()
    or exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid())
  );

drop policy if exists "swap_requests_insert" on public.swap_requests;
create policy "swap_requests_insert" on public.swap_requests for insert
  with check (
    requester_id = auth.uid()
    and public.is_circle_member(circle_id)
    and public.home_visible_to_user(home_id)
    and not exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid())
  );

drop policy if exists "swap_requests_update" on public.swap_requests;
create policy "swap_requests_update" on public.swap_requests for update
  using (
    requester_id = auth.uid()
    or exists (select 1 from public.homes h where h.id = home_id and h.owner_id = auth.uid())
  );

-- MESSAGES: solo las partes de la solicitud de intercambio
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select
  using (public.can_access_swap_request(swap_request_id));

drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert
  with check (sender_id = auth.uid() and public.can_access_swap_request(swap_request_id));

-- ============================================================================
-- STORAGE: bucket público para fotos de casas
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('home-photos', 'home-photos', true)
on conflict (id) do nothing;

drop policy if exists "home_photos_read" on storage.objects;
create policy "home_photos_read" on storage.objects for select
  using (bucket_id = 'home-photos');

drop policy if exists "home_photos_insert" on storage.objects;
create policy "home_photos_insert" on storage.objects for insert
  with check (bucket_id = 'home-photos' and auth.uid() is not null);

drop policy if exists "home_photos_delete" on storage.objects;
create policy "home_photos_delete" on storage.objects for delete
  using (bucket_id = 'home-photos' and owner = auth.uid());
