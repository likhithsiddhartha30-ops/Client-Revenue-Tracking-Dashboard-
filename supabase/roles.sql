-- WorthyOps — roles & access rules. Run after schema.sql. Safe to re-run.
--   team   : sees every client, can add / edit / delete data and manage access
--   client : sees only their own company's numbers, read-only
-- Logins without a role see nothing.

create table if not exists public.user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('team', 'client')),
  client_id  text references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint client_role_needs_client check (role = 'team' or client_id is not null)
);
alter table public.user_roles enable row level security;

create or replace function public.is_team() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'team');
$$;

create or replace function public.my_client_id() returns text
language sql stable security definer set search_path = '' as $$
  select client_id from public.user_roles where user_id = auth.uid() and role = 'client';
$$;

drop policy if exists "Users read own role" on public.user_roles;
create policy "Users read own role" on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_team()));

-- clients: team sees all, a client login sees only its own company; only team can write
drop policy if exists "Signed-in users manage clients" on public.clients;
drop policy if exists "Read clients" on public.clients;
drop policy if exists "Team inserts clients" on public.clients;
drop policy if exists "Team updates clients" on public.clients;
drop policy if exists "Team deletes clients" on public.clients;
create policy "Read clients" on public.clients for select to authenticated
  using ((select public.is_team()) or id = (select public.my_client_id()));
create policy "Team inserts clients" on public.clients for insert to authenticated
  with check ((select public.is_team()));
create policy "Team updates clients" on public.clients for update to authenticated
  using ((select public.is_team())) with check ((select public.is_team()));
create policy "Team deletes clients" on public.clients for delete to authenticated
  using ((select public.is_team()));

-- monthly_records: same rules, matched on client_id
drop policy if exists "Signed-in users manage records" on public.monthly_records;
drop policy if exists "Read records" on public.monthly_records;
drop policy if exists "Team inserts records" on public.monthly_records;
drop policy if exists "Team updates records" on public.monthly_records;
drop policy if exists "Team deletes records" on public.monthly_records;
create policy "Read records" on public.monthly_records for select to authenticated
  using ((select public.is_team()) or client_id = (select public.my_client_id()));
create policy "Team inserts records" on public.monthly_records for insert to authenticated
  with check ((select public.is_team()));
create policy "Team updates records" on public.monthly_records for update to authenticated
  using ((select public.is_team())) with check ((select public.is_team()));
create policy "Team deletes records" on public.monthly_records for delete to authenticated
  using ((select public.is_team()));

-- Team-only helpers used by the Data Entry → Access section
create or replace function public.list_access()
returns table (user_id uuid, email text, role text, client_id text, client_name text, last_sign_in_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_team() then raise exception 'Only team members can view access'; end if;
  return query
    select u.id, u.email::text, r.role, r.client_id, c.name, u.last_sign_in_at
    from auth.users u
    left join public.user_roles r on r.user_id = u.id
    left join public.clients c on c.id = r.client_id
    order by u.created_at;
end $$;

create or replace function public.set_access(p_email text, p_role text, p_client_id text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid;
begin
  if not public.is_team() then raise exception 'Only team members can change access'; end if;
  select id into v_uid from auth.users where lower(email) = lower(trim(p_email));
  if v_uid is null then
    raise exception 'No login with email %. Create it first in Supabase → Authentication → Users.', p_email;
  end if;
  if v_uid = auth.uid() and coalesce(p_role, '') <> 'team' then
    raise exception 'You cannot remove your own team access';
  end if;
  if p_role is null then
    delete from public.user_roles where user_id = v_uid;
    return;
  end if;
  if p_role not in ('team', 'client') then raise exception 'Role must be team or client'; end if;
  if p_role = 'client' and p_client_id is null then raise exception 'Choose which client this login belongs to'; end if;
  insert into public.user_roles (user_id, role, client_id)
  values (v_uid, p_role, case when p_role = 'client' then p_client_id end)
  on conflict (user_id) do update set role = excluded.role, client_id = excluded.client_id;
end $$;

revoke execute on function public.list_access() from public, anon;
revoke execute on function public.set_access(text, text, text) from public, anon;
grant execute on function public.list_access() to authenticated;
grant execute on function public.set_access(text, text, text) to authenticated;

-- One-time bootstrap: every login that exists right now becomes a team member.
insert into public.user_roles (user_id, role)
select id, 'team' from auth.users
on conflict (user_id) do nothing;
