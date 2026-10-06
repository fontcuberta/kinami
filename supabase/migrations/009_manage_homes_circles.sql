-- Atomic, authenticated lifecycle actions. Never callable anonymously.
create or replace function public.manage_home_or_circle(operation text, target_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare actor uuid := auth.uid(); membership_role text;
begin
  if actor is null then raise exception 'not_authenticated'; end if;
  if operation = 'delete_home' then
    perform 1 from public.homes where id = target_id and owner_id = actor for update;
    if not found then raise exception 'not_authorized'; end if;
    delete from public.homes where id = target_id and owner_id = actor;
  elsif operation in ('leave_circle', 'delete_circle') then
    perform 1 from public.circles where id = target_id for update;
    if not found then raise exception 'not_authorized'; end if;
    select role into membership_role from public.circle_members where circle_id = target_id and user_id = actor;
    if membership_role is null then raise exception 'not_authorized'; end if;
    if operation = 'delete_circle' then
      if membership_role <> 'admin' or target_id = 'a0000000-0000-4000-8000-000000000001'::uuid then
        raise exception 'not_authorized';
      end if;
      delete from public.circles where id = target_id;
    else
      if membership_role = 'admin' and not exists (
        select 1 from public.circle_members where circle_id = target_id and role = 'admin' and user_id <> actor
      ) then raise exception 'last_admin'; end if;
      delete from public.home_circles where circle_id = target_id and home_id in (select id from public.homes where owner_id = actor);
      delete from public.circle_members where circle_id = target_id and user_id = actor;
    end if;
  else raise exception 'invalid_operation';
  end if;
end;
$$;
revoke all on function public.manage_home_or_circle(text, uuid) from public, anon;
grant execute on function public.manage_home_or_circle(text, uuid) to authenticated;
