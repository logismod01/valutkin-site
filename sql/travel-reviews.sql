-- Отзывы об отелях: публикация только после модерации.
create table if not exists public.travel_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  hotel_name text not null check (char_length(hotel_name) between 2 and 160),
  kind text not null check (kind in ('positive','complaint','tip')),
  category text not null check (char_length(category) between 2 and 40),
  content text not null check (char_length(content) between 20 and 800),
  visited_month date not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  moderator_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists travel_reviews_public_idx on public.travel_reviews(country_code, hotel_name, created_at desc) where status='approved';
alter table public.travel_reviews enable row level security;
drop policy if exists "approved travel reviews are public" on public.travel_reviews;
create policy "approved travel reviews are public" on public.travel_reviews for select using (status='approved' or auth.uid()=user_id);
drop policy if exists "users submit own pending travel reviews" on public.travel_reviews;
create policy "users submit own pending travel reviews" on public.travel_reviews for insert to authenticated with check (auth.uid()=user_id and status='pending');
drop policy if exists "users delete own pending travel reviews" on public.travel_reviews;
create policy "users delete own pending travel reviews" on public.travel_reviews for delete to authenticated using (auth.uid()=user_id and status='pending');
-- Модератор меняет status через Supabase Dashboard. Не выдавайте клиенту service_role.
