-- Run ONCE in the dedicated project's Supabase SQL Editor.
-- No credentials or local content are embedded here. Re-running is safe.
begin;

create table if not exists public.cms_store (
  id smallint primary key check (id = 1),
  revision bigint not null default 0 check (revision >= 0),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_backups (
  id bigint generated always as identity primary key,
  revision bigint not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

-- All records are private, including drafts, password hashes and sessions.
-- This CMS authenticates its owner on the Next.js server, not with Supabase Auth.
alter table public.cms_store enable row level security;
alter table public.cms_backups enable row level security;
revoke all on public.cms_store, public.cms_backups from public, anon, authenticated;
grant select, insert, update on public.cms_store to service_role;
grant select, insert, delete on public.cms_backups to service_role;
grant usage, select on sequence public.cms_backups_id_seq to service_role;

create or replace function public.cms_compare_and_swap(expected_revision bigint, next_data jsonb)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if jsonb_typeof(next_data) is distinct from 'object'
    or jsonb_typeof(next_data->'articles') is distinct from 'array'
    or jsonb_typeof(next_data->'sessions') is distinct from 'array'
    or jsonb_typeof(next_data->'attempts') is distinct from 'array' then
    raise exception 'Invalid CMS payload' using errcode = '22023';
  end if;
  update public.cms_store set data = next_data, revision = revision + 1, updated_at = now()
    where id = 1 and revision = expected_revision;
  return found;
end;
$$;
revoke all on function public.cms_compare_and_swap(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.cms_compare_and_swap(bigint, jsonb) to service_role;

-- Keep 30 content revisions. Session/login-only changes do not create backups.
create or replace function public.cms_archive_previous()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (old.data - 'sessions' - 'attempts') is distinct from (new.data - 'sessions' - 'attempts') then
    insert into public.cms_backups(revision, data)
      values (old.revision, old.data || '{"sessions":[],"attempts":[]}'::jsonb);
    delete from public.cms_backups where id not in
      (select id from public.cms_backups order by id desc limit 30);
  end if;
  return new;
end;
$$;
revoke all on function public.cms_archive_previous() from public, anon, authenticated;
drop trigger if exists cms_archive_previous on public.cms_store;
create trigger cms_archive_previous before update on public.cms_store
  for each row execute function public.cms_archive_previous();

-- Private bucket; images are served by Next.js via /api/media/<uuid>.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('cms-media', 'cms-media', false, 8388608,
  array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do nothing;

notify pgrst, 'reload schema';
commit;
