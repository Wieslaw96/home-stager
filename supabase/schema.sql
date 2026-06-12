-- Uruchom w Supabase SQL Editor (Settings → SQL Editor)

-- 1. Profile użytkowników
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  stripe_customer_id text unique,
  created_at timestamptz default now()
);

-- 2. Subskrypcje Stripe
create table if not exists subscriptions (
  id text primary key,
  user_id uuid references profiles(id) on delete cascade,
  plan text not null,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  updated_at timestamptz default now()
);

-- 3. Licznik użycia miesięcznego
create table if not exists usage (
  user_id uuid references profiles(id) on delete cascade,
  year_month text not null,
  count integer default 0,
  primary key (user_id, year_month)
);

-- 4. Funkcja do bezpiecznego inkrementowania licznika
create or replace function increment_usage(p_user_id uuid, p_year_month text)
returns void as $$
begin
  insert into usage (user_id, year_month, count)
  values (p_user_id, p_year_month, 1)
  on conflict (user_id, year_month)
  do update set count = usage.count + 1;
end;
$$ language plpgsql security definer;

-- 5. Trigger: twórz profil przy rejestracji użytkownika
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
exception when others then
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 6. Row Level Security
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table usage enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can read own subscription" on subscriptions for select using (auth.uid() = user_id);

create policy "Users can read own usage" on usage for select using (auth.uid() = user_id);
