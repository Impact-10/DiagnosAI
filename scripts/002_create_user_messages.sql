-- Create user_messages table to track daily message count
create table if not exists public.user_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_messages enable row level security;

-- Create policies for user_messages
create policy "user_messages_select_own"
  on public.user_messages for select
  using (auth.uid() = user_id);

create policy "user_messages_insert_own"
  on public.user_messages for insert
  with check (auth.uid() = user_id);

create policy "user_messages_update_own"
  on public.user_messages for update
  using (auth.uid() = user_id);

create policy "user_messages_delete_own"
  on public.user_messages for delete
  using (auth.uid() = user_id);

-- Create index for efficient daily message counting
create index if not exists idx_user_messages_user_date 
  on public.user_messages (user_id, date(created_at));
