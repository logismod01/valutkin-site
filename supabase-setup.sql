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

-- Облачные сохранения биржевой игры. Финансовые данные видит только владелец.
create table if not exists public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.game_saves enable row level security;
drop policy if exists "game_saves_own" on public.game_saves;
create policy "game_saves_own" on public.game_saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Публично видны только игровые показатели — не сделки и не состав портфеля.
create table if not exists public.game_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  friend_code text unique not null,
  display_name text not null default 'Управляющий',
  avatar text not null default '🦊',
  season integer not null default 1,
  game_day integer not null default 1,
  fund_worth numeric not null default 0,
  achievement_count integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.game_profiles enable row level security;
drop policy if exists "game_profiles_public_read" on public.game_profiles;
create policy "game_profiles_public_read" on public.game_profiles for select using (true);
drop policy if exists "game_profiles_own_insert" on public.game_profiles;
create policy "game_profiles_own_insert" on public.game_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "game_profiles_own_update" on public.game_profiles;
create policy "game_profiles_own_update" on public.game_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.game_friends (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
alter table public.game_friends enable row level security;
drop policy if exists "game_friends_own_read" on public.game_friends;
create policy "game_friends_own_read" on public.game_friends for select using (auth.uid() = user_id);
drop policy if exists "game_friends_own_insert" on public.game_friends;
create policy "game_friends_own_insert" on public.game_friends for insert with check (auth.uid() = user_id);
drop policy if exists "game_friends_own_delete" on public.game_friends;
create policy "game_friends_own_delete" on public.game_friends for delete using (auth.uid() = user_id);
create index if not exists game_friends_user_idx on public.game_friends(user_id);

-- Асинхронные клубы: друзья играют в общем сезонном рейтинге.
create table if not exists public.game_clubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  code text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.game_club_members (
  club_id uuid not null references public.game_clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (club_id,user_id)
);
alter table public.game_clubs enable row level security;
alter table public.game_club_members enable row level security;
drop policy if exists "game_clubs_public_read" on public.game_clubs;
create policy "game_clubs_public_read" on public.game_clubs for select using (true);
drop policy if exists "game_clubs_owner_insert" on public.game_clubs;
create policy "game_clubs_owner_insert" on public.game_clubs for insert with check (auth.uid()=owner_id);
drop policy if exists "game_clubs_owner_update" on public.game_clubs;
create policy "game_clubs_owner_update" on public.game_clubs for update using (auth.uid()=owner_id);
drop policy if exists "game_clubs_owner_delete" on public.game_clubs;
create policy "game_clubs_owner_delete" on public.game_clubs for delete using (auth.uid()=owner_id);
drop policy if exists "club_members_public_read" on public.game_club_members;
create policy "club_members_public_read" on public.game_club_members for select using (true);
drop policy if exists "club_members_join_self" on public.game_club_members;
create policy "club_members_join_self" on public.game_club_members for insert with check (auth.uid()=user_id);
drop policy if exists "club_members_leave_self" on public.game_club_members;
create policy "club_members_leave_self" on public.game_club_members for delete using (auth.uid()=user_id);
create index if not exists game_club_members_user_idx on public.game_club_members(user_id);
