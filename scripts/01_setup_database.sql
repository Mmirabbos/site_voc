-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for user profiles (to store names)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  updated_at timestamp with time zone
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for words
create table public.words (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  original text not null,
  translation text not null,
  type text, -- 'verb', 'noun', etc.
  tag text, -- 'kitchen', 'travel', etc.
  
  -- Spaced Repetition fields
  easiness_factor float default 2.5,
  interval int default 0,
  repetitions int default 0,
  next_review timestamp with time zone default now(),
  
  created_at timestamp with time zone default now()
);

-- Enable RLS for words
alter table public.words enable row level security;

-- Policies for words
create policy "Individuals can view their own words."
  on words for select
  using ( auth.uid() = user_id );

create policy "Individuals can create their own words."
  on words for insert
  with check ( auth.uid() = user_id );

create policy "Individuals can update their own words."
  on words for update
  using ( auth.uid() = user_id );

create policy "Individuals can delete their own words."
  on words for delete
  using ( auth.uid() = user_id );

-- Trigger to handle new user signup and create profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Drop the trigger if it exists to avoid errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
