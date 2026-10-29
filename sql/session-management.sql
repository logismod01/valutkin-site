-- Выполните этот файл один раз в Supabase SQL Editor.
-- Он показывает пользователю только его собственные сеансы.

create or replace function public.list_my_sessions()
returns table(
  session_id uuid,
  created_at timestamptz,
  last_active_at timestamptz,
  user_agent text,
  is_current boolean
)
language sql
security definer
set search_path = public, auth
stable
as $$
  select
    s.id,
    s.created_at,
    coalesce(s.refreshed_at, s.updated_at, s.created_at),
    coalesce(s.user_agent, ''),
    s.id::text = coalesce(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'session_id',
      ''
    )
  from auth.sessions s
  where s.user_id = auth.uid()
  order by coalesce(s.refreshed_at, s.updated_at, s.created_at) desc;
$$;

create or replace function public.revoke_my_session(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_session_id text := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'session_id',
    ''
  );
begin
  if auth.uid() is null or p_session_id::text = current_session_id then
    return false;
  end if;

  delete from auth.sessions
  where id = p_session_id
    and user_id = auth.uid();

  return found;
end;
$$;

revoke all on function public.list_my_sessions() from public, anon;
revoke all on function public.revoke_my_session(uuid) from public, anon;
grant execute on function public.list_my_sessions() to authenticated;
grant execute on function public.revoke_my_session(uuid) to authenticated;
