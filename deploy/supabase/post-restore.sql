do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_autoconfirmed_user_profiles'
      and tgrelid = 'auth.users'::regclass
      and not tgisinternal
  ) then
    create trigger on_autoconfirmed_user_profiles
      after insert on auth.users
      for each row
      when (new.email_confirmed_at is not null)
      execute function public.handle_verified_user_on_profiles();
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_autoconfirmed_user_role'
      and tgrelid = 'auth.users'::regclass
      and not tgisinternal
  ) then
    create trigger on_autoconfirmed_user_role
      after insert on auth.users
      for each row
      when (new.email_confirmed_at is not null)
      execute function public.handle_verified_user_on_user_roles();
  end if;
end;
$$;
