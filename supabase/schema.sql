create table if not exists public.rlab_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint progress_size check (octet_length(progress::text) <= 20000000)
);
alter table public.rlab_progress enable row level security;
revoke all on public.rlab_progress from anon, authenticated;
grant select on public.rlab_progress to authenticated;
create policy "Read own training" on public.rlab_progress for select to authenticated using ((select auth.uid()) = user_id);

-- Atomic compare-and-swap prevents one device silently overwriting another.
-- The caller never supplies a user ID. It comes only from the verified JWT.
create or replace function public.rlab_save(payload jsonb, expected_revision bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); next_revision bigint;
begin
  if uid is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if jsonb_typeof(payload) <> 'object' or payload->>'version' is distinct from '1'
     or jsonb_typeof(payload->'attempts') is distinct from 'array'
     or jsonb_typeof(payload->'drafts') is distinct from 'object'
     or jsonb_typeof(payload->'exams') is distinct from 'array'
     or octet_length(payload::text) > 20000000 then
    raise exception 'Invalid progress';
  end if;
  if expected_revision = 0 then
    insert into public.rlab_progress(user_id, progress) values(uid, payload)
    on conflict do nothing returning revision into next_revision;
  else
    update public.rlab_progress set progress=payload, revision=revision+1, updated_at=now()
    where user_id=uid and revision=expected_revision returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'RLAB_CONFLICT' using errcode = '40001'; end if;
  return next_revision;
end; $$;
revoke all on function public.rlab_save(jsonb,bigint) from public, anon;
grant execute on function public.rlab_save(jsonb,bigint) to authenticated;
