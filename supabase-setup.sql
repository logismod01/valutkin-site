-- Выполните этот файл один раз в Supabase → SQL Editor → New query → Run.
-- Таблица публичного профиля (доступна только владельцу строки).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  avatar text not null default '🦊',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Настройки, портфель, избранное и уведомления пользователя.
create table if not exists public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_data enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own" on public.user_data for select using (auth.uid() = user_id);
drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own" on public.user_data for insert with check (auth.uid() = user_id);
drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own" on public.user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user_data_delete_own" on public.user_data;
create policy "user_data_delete_own" on public.user_data for delete using (auth.uid() = user_id);

-- Профиль создаётся автоматически после регистрации.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), coalesce(new.raw_user_meta_data->>'phone',''))
  on conflict (id) do nothing;
  insert into public.user_data (user_id, data) values (new.id, '{}'::jsonb)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();


-- Удаление самой учётной записи выполняет Edge Function из
-- supabase/functions/delete-account/index.ts. Разверните её командой:
-- supabase functions deploy delete-account
