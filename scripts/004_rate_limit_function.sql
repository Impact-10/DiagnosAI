-- Create function to check daily message limit
create or replace function public.check_daily_message_limit(user_uuid uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  message_count integer;
begin
  -- Count messages for today
  select count(*)
  into message_count
  from public.user_messages
  where user_id = user_uuid
    and date(created_at) = current_date;
  
  return message_count;
end;
$$;

-- Create function to add user message
create or replace function public.add_user_message(user_uuid uuid, content text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  -- Check current daily count
  current_count := public.check_daily_message_limit(user_uuid);
  
  -- If under limit, add message
  if current_count < 8 then
    insert into public.user_messages (user_id, message_content)
    values (user_uuid, content);
    return true;
  else
    return false;
  end if;
end;
$$;
