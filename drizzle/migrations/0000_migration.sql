
-- ROLES
create type public.app_role as enum ('admin','moderator','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','moderator'))
$$;

create policy "own roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Bootstrap: first signed-in user may claim admin only while no admin exists
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles(user_id, role) values (auth.uid(), 'admin') on conflict do nothing;
  return true;
end $$;
revoke execute on function public.claim_first_admin() from anon, public;
grant execute on function public.claim_first_admin() to authenticated;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;
grant execute on function public.admin_exists() to anon, authenticated;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Member' check (char_length(display_name) between 1 and 60),
  bio text check (char_length(bio) <= 500),
  expertise text[] not null default '{}',
  interests text[] not null default '{}',
  visibility text not null default 'members' check (visibility in ('public','members','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles visible by setting" on public.profiles for select to anon, authenticated
  using (visibility = 'public'
    or (visibility = 'members' and auth.uid() is not null)
    or id = auth.uid()
    or public.is_staff(auth.uid()));
create policy "insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(nullif(new.raw_user_meta_data->>'display_name',''), nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1), 'Member'), 60))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Public author name lookup that respects privacy (private => null)
create or replace function public.author_names(_ids uuid[])
returns table(id uuid, display_name text) language sql stable security definer set search_path = public as $$
  select p.id, case when p.visibility = 'private' then null else p.display_name end
  from public.profiles p where p.id = any(_ids)
$$;
grant execute on function public.author_names(uuid[]) to anon, authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- EVENTS
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_zh text not null, title_en text not null,
  summary_zh text not null default '', summary_en text not null default '',
  body_zh text not null default '', body_en text not null default '',
  status text not null default 'tba' check (status in ('tba','scheduled','past','cancelled')),
  starts_at timestamptz,
  venue_zh text, venue_en text,
  signup_url text,
  recap_zh text, recap_en text,
  published boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.events to anon;
grant select, insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;
alter table public.events enable row level security;
create policy "public reads published events" on public.events for select to anon, authenticated
  using (published or public.is_staff(auth.uid()));
create policy "staff write events" on public.events for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger events_touch before update on public.events for each row execute function public.touch_updated_at();

-- ARTICLES
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_zh text not null, title_en text not null,
  excerpt_zh text not null default '', excerpt_en text not null default '',
  body_zh text not null default '', body_en text not null default '',
  category text not null default 'primer',
  kind text not null default 'primer' check (kind in ('primer','note','recap')),
  tags text[] not null default '{}',
  source_links text[] not null default '{}',
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "public reads published articles" on public.articles for select to anon, authenticated
  using (published or public.is_staff(auth.uid()));
create policy "staff write articles" on public.articles for all to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();

-- DISCUSSIONS
create table public.discussion_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  category text not null default 'general' check (category in ('general','learning','tools','career','chiangmai','meta')),
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 1 and 8000),
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.discussion_posts to anon;
grant select, insert, update, delete on public.discussion_posts to authenticated;
grant all on public.discussion_posts to service_role;
alter table public.discussion_posts enable row level security;
create policy "read visible posts" on public.discussion_posts for select to anon, authenticated
  using (status = 'visible' or author_id = auth.uid() or public.is_staff(auth.uid()));
create policy "members create posts" on public.discussion_posts for insert to authenticated
  with check (author_id = auth.uid() and status = 'visible');
create policy "author or staff update posts" on public.discussion_posts for update to authenticated
  using (author_id = auth.uid() or public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()) or (author_id = auth.uid() and status = 'visible'));
create policy "author or staff delete posts" on public.discussion_posts for delete to authenticated
  using (author_id = auth.uid() or public.is_staff(auth.uid()));
create trigger posts_touch before update on public.discussion_posts for each row execute function public.touch_updated_at();

create table public.discussion_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.discussion_posts(id) on delete cascade,
  author_id uuid not null,
  body text not null check (char_length(body) between 1 and 4000),
  status text not null default 'visible' check (status in ('visible','hidden')),
  created_at timestamptz not null default now()
);
grant select on public.discussion_comments to anon;
grant select, insert, update, delete on public.discussion_comments to authenticated;
grant all on public.discussion_comments to service_role;
alter table public.discussion_comments enable row level security;
create policy "read visible comments" on public.discussion_comments for select to anon, authenticated
  using (status = 'visible' or author_id = auth.uid() or public.is_staff(auth.uid()));
create policy "members comment" on public.discussion_comments for insert to authenticated
  with check (author_id = auth.uid() and status = 'visible'
    and exists (select 1 from public.discussion_posts p where p.id = post_id and p.status = 'visible'));
create policy "staff moderate comments" on public.discussion_comments for update to authenticated
  using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "author or staff delete comments" on public.discussion_comments for delete to authenticated
  using (author_id = auth.uid() or public.is_staff(auth.uid()));

create table public.post_votes (
  post_id uuid not null references public.discussion_posts(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
grant select on public.post_votes to anon;
grant select, insert, delete on public.post_votes to authenticated;
grant all on public.post_votes to service_role;
alter table public.post_votes enable row level security;
create policy "votes readable" on public.post_votes for select to anon, authenticated using (true);
create policy "vote as self" on public.post_votes for insert to authenticated with check (user_id = auth.uid());
create policy "unvote as self" on public.post_votes for delete to authenticated using (user_id = auth.uid());

-- REPORTS
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post','comment','opportunity')),
  target_id uuid not null,
  reporter_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now()
);
grant select, insert, update on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "members report" on public.reports for insert to authenticated with check (reporter_id = auth.uid() and status = 'open');
create policy "staff read reports" on public.reports for select to authenticated using (public.is_staff(auth.uid()) or reporter_id = auth.uid());
create policy "staff resolve reports" on public.reports for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- OPPORTUNITIES
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  kind text not null default 'problem' check (kind in ('problem','collaboration','help_offered')),
  title text not null check (char_length(title) between 3 and 160),
  description text not null check (char_length(description) between 10 and 4000),
  topics text[] not null default '{}',
  skills text[] not null default '{}',
  visibility text not null default 'members' check (visibility in ('public','members')),
  consent_confirmed boolean not null default false check (consent_confirmed),
  status text not null default 'open' check (status in ('open','closed','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.opportunities to anon;
grant select, insert, update, delete on public.opportunities to authenticated;
grant all on public.opportunities to service_role;
alter table public.opportunities enable row level security;
create policy "read opportunities by visibility" on public.opportunities for select to anon, authenticated
  using (author_id = auth.uid() or public.is_staff(auth.uid())
    or (status <> 'hidden' and (visibility = 'public' or auth.uid() is not null)));
create policy "create own opportunity" on public.opportunities for insert to authenticated
  with check (author_id = auth.uid() and status <> 'hidden');
create policy "update own or staff" on public.opportunities for update to authenticated
  using (author_id = auth.uid() or public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()) or (author_id = auth.uid() and status <> 'hidden'));
create policy "delete own or staff" on public.opportunities for delete to authenticated
  using (author_id = auth.uid() or public.is_staff(auth.uid()));
create trigger opps_touch before update on public.opportunities for each row execute function public.touch_updated_at();

-- Contact details: separate table, only signed-in members see them, only if author opted in
create table public.opportunity_contacts (
  opportunity_id uuid primary key references public.opportunities(id) on delete cascade,
  author_id uuid not null,
  contact text not null check (char_length(contact) between 2 and 200),
  share_with_members boolean not null default false
);
grant select, insert, update, delete on public.opportunity_contacts to authenticated;
grant all on public.opportunity_contacts to service_role;
alter table public.opportunity_contacts enable row level security;
create policy "members see opted-in contact" on public.opportunity_contacts for select to authenticated
  using (author_id = auth.uid() or public.is_staff(auth.uid())
    or (share_with_members and exists (select 1 from public.opportunities o where o.id = opportunity_id and o.status = 'open')));
create policy "author writes contact" on public.opportunity_contacts for insert to authenticated
  with check (author_id = auth.uid() and exists (select 1 from public.opportunities o where o.id = opportunity_id and o.author_id = auth.uid()));
create policy "author updates contact" on public.opportunity_contacts for update to authenticated
  using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "author deletes contact" on public.opportunity_contacts for delete to authenticated
  using (author_id = auth.uid());
