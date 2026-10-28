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

-- Общий виртуальный фонд клуба: решения принимаются голосованием участников.
alter table public.game_club_members add column if not exists role text not null default 'member'
  check (role in ('member','analyst','trader','director'));
create table if not exists public.game_club_funds (
  club_id uuid primary key references public.game_clubs(id) on delete cascade,
  cash numeric not null default 1000000 check (cash >= 0),
  holdings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.game_club_proposals (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.game_clubs(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  asset_code text not null,
  action text not null check (action in ('buy','sell')),
  quantity numeric not null check (quantity > 0),
  price numeric not null check (price > 0),
  status text not null default 'open' check (status in ('open','approved','rejected','failed')),
  created_at timestamptz not null default now()
);
create table if not exists public.game_club_votes (
  proposal_id uuid not null references public.game_club_proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote boolean not null,
  created_at timestamptz not null default now(),
  primary key (proposal_id,user_id)
);
alter table public.game_club_funds enable row level security;
alter table public.game_club_proposals enable row level security;
alter table public.game_club_votes enable row level security;
drop policy if exists "club_funds_public_read" on public.game_club_funds;
create policy "club_funds_public_read" on public.game_club_funds for select using (true);
drop policy if exists "club_funds_member_insert" on public.game_club_funds;
create policy "club_funds_member_insert" on public.game_club_funds for insert with check (exists(select 1 from public.game_club_members m where m.club_id=game_club_funds.club_id and m.user_id=auth.uid()));
drop policy if exists "club_proposals_public_read" on public.game_club_proposals;
create policy "club_proposals_public_read" on public.game_club_proposals for select using (true);
drop policy if exists "club_proposals_member_insert" on public.game_club_proposals;
create policy "club_proposals_member_insert" on public.game_club_proposals for insert with check (auth.uid()=author_id and exists(select 1 from public.game_club_members m where m.club_id=game_club_proposals.club_id and m.user_id=auth.uid()));
drop policy if exists "club_votes_public_read" on public.game_club_votes;
create policy "club_votes_public_read" on public.game_club_votes for select using (true);

create or replace function public.vote_club_proposal(p_proposal uuid,p_vote boolean)
returns text language plpgsql security definer set search_path=public as $$
declare pr public.game_club_proposals; members int; yes_votes int; no_votes int; owned numeric; total numeric;
begin
  select * into pr from public.game_club_proposals where id=p_proposal for update;
  if pr.id is null or pr.status <> 'open' then return 'closed'; end if;
  if not exists(select 1 from public.game_club_members where club_id=pr.club_id and user_id=auth.uid()) then raise exception 'not a club member'; end if;
  insert into public.game_club_votes(proposal_id,user_id,vote) values(p_proposal,auth.uid(),p_vote)
  on conflict(proposal_id,user_id) do update set vote=excluded.vote,created_at=now();
  select count(*) into members from public.game_club_members where club_id=pr.club_id;
  select count(*) filter(where vote),count(*) filter(where not vote) into yes_votes,no_votes from public.game_club_votes where proposal_id=p_proposal;
  if yes_votes >= greatest(1,ceil(members/2.0)) then
    insert into public.game_club_funds(club_id) values(pr.club_id) on conflict do nothing;
    total:=pr.quantity*pr.price;
    if pr.action='buy' then
      update public.game_club_funds set cash=cash-total,holdings=jsonb_set(holdings,array[pr.asset_code],to_jsonb(coalesce((holdings->>pr.asset_code)::numeric,0)+pr.quantity)),updated_at=now() where club_id=pr.club_id and cash>=total;
    else
      select coalesce((holdings->>pr.asset_code)::numeric,0) into owned from public.game_club_funds where club_id=pr.club_id;
      if owned>=pr.quantity then update public.game_club_funds set cash=cash+total,holdings=jsonb_set(holdings,array[pr.asset_code],to_jsonb(owned-pr.quantity)),updated_at=now() where club_id=pr.club_id; else update public.game_club_proposals set status='failed' where id=p_proposal; return 'insufficient'; end if;
    end if;
    if not found then update public.game_club_proposals set status='failed' where id=p_proposal; return 'insufficient'; end if;
    update public.game_club_proposals set status='approved' where id=p_proposal; return 'approved';
  elsif no_votes >= greatest(1,ceil(members/2.0)) then update public.game_club_proposals set status='rejected' where id=p_proposal; return 'rejected'; end if;
  return 'open';
end;$$;
revoke all on function public.vote_club_proposal(uuid,boolean) from public, anon;
grant execute on function public.vote_club_proposal(uuid,boolean) to authenticated;

-- Web Push подписки. Endpoint и ключи видит только владелец подписки.
create table if not exists public.push_subscriptions (
  id bigint generated by default as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subscriptions_own_select" on public.push_subscriptions;
create policy "push_subscriptions_own_select" on public.push_subscriptions for select using (auth.uid()=user_id);
drop policy if exists "push_subscriptions_own_insert" on public.push_subscriptions;
create policy "push_subscriptions_own_insert" on public.push_subscriptions for insert with check (auth.uid()=user_id);
drop policy if exists "push_subscriptions_own_update" on public.push_subscriptions;
create policy "push_subscriptions_own_update" on public.push_subscriptions for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "push_subscriptions_own_delete" on public.push_subscriptions;
create policy "push_subscriptions_own_delete" on public.push_subscriptions for delete using (auth.uid()=user_id);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions(user_id);

-- Возвращает Push-адреса клуба только автору свежего предложения.
-- Закрытые ключи VAPID по-прежнему находятся только в Edge Function Secrets.
create or replace function public.club_push_targets(p_proposal uuid)
returns table(id bigint,endpoint text,p256dh text,auth text)
language plpgsql security definer set search_path=public as $$
declare pr public.game_club_proposals;
begin
  select * into pr from public.game_club_proposals where game_club_proposals.id=p_proposal;
  if pr.id is null or pr.author_id<>auth.uid() or pr.created_at<now()-interval '5 minutes' then
    raise exception 'proposal is unavailable';
  end if;
  return query select s.id,s.endpoint,s.p256dh,s.auth
  from public.push_subscriptions s
  join public.game_club_members m on m.user_id=s.user_id
  where m.club_id=pr.club_id and s.user_id<>auth.uid();
end;$$;
revoke all on function public.club_push_targets(uuid) from public, anon;
grant execute on function public.club_push_targets(uuid) to authenticated;

-- Облачные ценовые условия. Доступны только владельцу аккаунта.
create table if not exists public.push_rate_alerts (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_code text not null,
  direction text not null check(direction in ('above','below')),
  target numeric not null check(target > 0),
  last_triggered_at timestamptz,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_rate_alerts enable row level security;
drop policy if exists "push_rate_alerts_own_select" on public.push_rate_alerts;
create policy "push_rate_alerts_own_select" on public.push_rate_alerts for select using(auth.uid()=user_id);
drop policy if exists "push_rate_alerts_own_insert" on public.push_rate_alerts;
create policy "push_rate_alerts_own_insert" on public.push_rate_alerts for insert with check(auth.uid()=user_id);
drop policy if exists "push_rate_alerts_own_update" on public.push_rate_alerts;
create policy "push_rate_alerts_own_update" on public.push_rate_alerts for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "push_rate_alerts_own_delete" on public.push_rate_alerts;
create policy "push_rate_alerts_own_delete" on public.push_rate_alerts for delete using(auth.uid()=user_id);
create index if not exists push_rate_alerts_user_idx on public.push_rate_alerts(user_id) where enabled;

-- Планировщик Push без service_role. Таблица закрыта RLS и хранит только SHA-256 секрета.
create extension if not exists pgcrypto with schema extensions;
create table if not exists public.push_scheduler_config (
  id text primary key,
  secret_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.push_scheduler_config enable row level security;
revoke all on public.push_scheduler_config from anon, authenticated;

create or replace function public.scheduled_push_targets(p_secret text)
returns table(alert_id text,asset_code text,direction text,target numeric,last_triggered_at timestamptz,subscription_id bigint,endpoint text,p256dh text,auth text)
language plpgsql security definer set search_path=public as $$
begin
  if p_secret is null or not exists(
    select 1 from public.push_scheduler_config
    where id='price-alerts' and secret_hash=encode(extensions.digest(p_secret,'sha256'),'hex')
  ) then raise exception 'invalid scheduler secret'; end if;
  return query
  select a.id,a.asset_code,a.direction,a.target,a.last_triggered_at,s.id,s.endpoint,s.p256dh,s.auth
  from public.push_rate_alerts a join public.push_subscriptions s on s.user_id=a.user_id
  where a.enabled and (a.last_triggered_at is null or a.last_triggered_at<now()-interval '6 hours');
end;$$;
create or replace function public.mark_scheduled_alerts(p_secret text,p_alert_ids text[],p_expired_subscription_ids bigint[])
returns void language plpgsql security definer set search_path=public as $$
begin
  if p_secret is null or not exists(
    select 1 from public.push_scheduler_config
    where id='price-alerts' and secret_hash=encode(extensions.digest(p_secret,'sha256'),'hex')
  ) then raise exception 'invalid scheduler secret'; end if;
  update public.push_rate_alerts set last_triggered_at=now(),updated_at=now() where id=any(coalesce(p_alert_ids,array[]::text[]));
  delete from public.push_subscriptions where id=any(coalesce(p_expired_subscription_ids,array[]::bigint[]));
end;$$;
revoke all on function public.scheduled_push_targets(text) from public, authenticated;
revoke all on function public.mark_scheduled_alerts(text,text[],bigint[]) from public, authenticated;
grant execute on function public.scheduled_push_targets(text) to anon;
grant execute on function public.mark_scheduled_alerts(text,text[],bigint[]) to anon;

-- Публичные отзывы: читать могут все, писать и менять — только владелец аккаунта.
create table if not exists public.reviews (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check(char_length(nickname) between 1 and 30),
  rating smallint not null check(rating between 1 and 5),
  comment text not null check(char_length(comment) between 3 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
drop policy if exists "reviews_public_select" on public.reviews;
create policy "reviews_public_select" on public.reviews for select using(true);
drop policy if exists "reviews_own_insert" on public.reviews;
create policy "reviews_own_insert" on public.reviews for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "reviews_own_update" on public.reviews;
create policy "reviews_own_update" on public.reviews for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "reviews_own_delete" on public.reviews;
create policy "reviews_own_delete" on public.reviews for delete to authenticated using(auth.uid()=user_id);
create index if not exists reviews_updated_idx on public.reviews(updated_at desc);

-- Несколько независимых виртуальных фондов на один аккаунт.
alter table public.game_saves add column if not exists slot text not null default 'main';
alter table public.game_saves drop constraint if exists game_saves_pkey;
alter table public.game_saves add primary key (user_id,slot);
alter table public.game_saves drop constraint if exists game_saves_slot_check;
alter table public.game_saves add constraint game_saves_slot_check check(slot ~ '^[a-z0-9-]{1,40}$');

-- Цели накопления и расписание мотивирующих Push.
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check(char_length(title) between 1 and 60),
  target_amount numeric not null check(target_amount > 0),
  current_amount numeric not null default 0 check(current_amount >= 0 and current_amount <= target_amount),
  deadline date not null,
  reminders_enabled boolean not null default false,
  reminder_time time not null default '19:00',
  next_reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.savings_goals enable row level security;
drop policy if exists "savings_goals_own" on public.savings_goals;
create policy "savings_goals_own" on public.savings_goals for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
create index if not exists savings_goals_due_idx on public.savings_goals(next_reminder_at) where reminders_enabled;

create or replace function public.scheduled_goal_targets(p_secret text)
returns table(goal_id uuid,title text,current_amount numeric,target_amount numeric,deadline date,subscription_id bigint,endpoint text,p256dh text,auth text)
language plpgsql security definer set search_path=public as $$
begin
  if p_secret is null or not exists(
    select 1 from public.push_scheduler_config where id='savings-goals' and secret_hash=encode(extensions.digest(p_secret,'sha256'),'hex')
  ) then raise exception 'invalid scheduler secret'; end if;
  return query select g.id,g.title,g.current_amount,g.target_amount,g.deadline,s.id,s.endpoint,s.p256dh,s.auth
  from public.savings_goals g join public.push_subscriptions s on s.user_id=g.user_id
  where g.reminders_enabled and g.current_amount<g.target_amount and g.next_reminder_at<=now()
  limit 500;
end;$$;
create or replace function public.mark_goal_reminders(p_secret text,p_goal_ids uuid[],p_expired_subscription_ids bigint[])
returns void language plpgsql security definer set search_path=public as $$
begin
  if p_secret is null or not exists(
    select 1 from public.push_scheduler_config where id='savings-goals' and secret_hash=encode(extensions.digest(p_secret,'sha256'),'hex')
  ) then raise exception 'invalid scheduler secret'; end if;
  update public.savings_goals set next_reminder_at=case when next_reminder_at<now() then now()+interval '1 day' else next_reminder_at+interval '1 day' end,updated_at=now() where id=any(coalesce(p_goal_ids,array[]::uuid[]));
  delete from public.push_subscriptions where id=any(coalesce(p_expired_subscription_ids,array[]::bigint[]));
end;$$;
revoke all on function public.scheduled_goal_targets(text) from public,authenticated;
revoke all on function public.mark_goal_reminders(text,uuid[],bigint[]) from public,authenticated;
grant execute on function public.scheduled_goal_targets(text) to anon;
grant execute on function public.mark_goal_reminders(text,uuid[],bigint[]) to anon;
