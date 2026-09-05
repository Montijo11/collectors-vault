-- Collector's Vault database setup

create extension if not exists "pgcrypto";

-- 1. Collector profiles

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 32),
  role text not null default 'collector' check (role in ('collector', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 2. Personal vault items

create table public.registry_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  casting_name text not null,
  series text,
  year integer,
  toy_number text,
  barcode_upc text,
  condition text not null default 'Mint',
  rarity text not null default 'Mainline',
  estimated_value numeric(10, 2) not null default 0,
  notes text,
  is_private boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Collector Exchange community posts

create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category text not null default 'general_chat',
  title text not null check (char_length(title) between 3 and 140),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Speed up common lookups

create index registry_items_owner_id_idx
on public.registry_items(owner_id);

create index registry_items_created_at_idx
on public.registry_items(created_at desc);

create index forum_posts_created_at_idx
on public.forum_posts(created_at desc);

create index forum_posts_category_idx
on public.forum_posts(category);

-- 5. Create a collector profile automatically after sign-up

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      split_part(new.email, '@', 1)
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- 6. Update the "updated_at" timestamp automatically

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger registry_items_updated_at
  before update on public.registry_items
  for each row
  execute procedure public.set_updated_at();

create trigger forum_posts_updated_at
  before update on public.forum_posts
  for each row
  execute procedure public.set_updated_at();

-- 7. Turn on security rules

alter table public.profiles enable row level security;
alter table public.registry_items enable row level security;
alter table public.forum_posts enable row level security;

-- Signed-in collectors can see usernames for community posts.

create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

-- A collector can update only their own profile.

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- A collector can see, add, edit, and delete only their own vault items.

create policy "Owners can read their vault items"
on public.registry_items
for select
to authenticated
using (auth.uid() = owner_id);

create policy "Owners can add vault items"
on public.registry_items
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Owners can update their vault items"
on public.registry_items
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Owners can delete their vault items"
on public.registry_items
for delete
to authenticated
using (auth.uid() = owner_id);

-- All signed-in collectors can read posts.
-- Each collector can create, edit, or delete only their own posts.

create policy "Authenticated users can read forum posts"
on public.forum_posts
for select
to authenticated
using (true);

create policy "Users can create their own forum posts"
on public.forum_posts
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "Users can update their own forum posts"
on public.forum_posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "Users can delete their own forum posts"
on public.forum_posts
for delete
to authenticated
using (auth.uid() = author_id);