-- Profiles: one row per Auth user, readable and editable only by that user.
-- Follows Supabase's user-management pattern (profile tied to auth.users, created by a trigger).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 50),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Data API access: signed-in users only. Rows are limited by the policies below.
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create the profile when a user signs up. Runs as the function owner so it can insert past RLS;
-- it only ever inserts the new user's own row.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 50), ''));
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
