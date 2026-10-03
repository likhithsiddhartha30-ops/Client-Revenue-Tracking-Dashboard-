-- WorthyOps Client Revenue Tracking — Supabase schema
-- Run in the Supabase SQL editor. Safe to re-run.

create table if not exists public.clients (
  id          text primary key default ('c' || substr(md5(random()::text || clock_timestamp()::text), 1, 10)),
  name        text not null,
  industry    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.monthly_records (
  id               bigint generated always as identity primary key,
  client_id        text not null references public.clients(id) on delete cascade,
  month            date not null check (extract(day from month) = 1),
  inbound_leads    integer not null default 0 check (inbound_leads >= 0),
  outbound_leads   integer not null default 0 check (outbound_leads >= 0),
  total_leads      integer generated always as (inbound_leads + outbound_leads) stored,
  meetings_booked  integer not null default 0 check (meetings_booked >= 0),
  showed_up        integer not null default 0 check (showed_up >= 0),
  deals_closed     integer not null default 0 check (deals_closed >= 0),
  revenue          numeric(14,2) not null default 0 check (revenue >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (client_id, month)
);

create index if not exists monthly_records_month_idx on public.monthly_records (month);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists monthly_records_updated_at on public.monthly_records;
create trigger monthly_records_updated_at before update on public.monthly_records
  for each row execute function public.set_updated_at();

-- Per-client, per-month view with conversion rates
create or replace view public.client_monthly_summary with (security_invoker = true) as
select
  r.month,
  c.id   as client_id,
  c.name as client_name,
  r.inbound_leads, r.outbound_leads, r.total_leads,
  r.meetings_booked, r.showed_up, r.deals_closed, r.revenue,
  round(r.meetings_booked::numeric / nullif(r.total_leads, 0), 4)  as lead_to_meeting_rate,
  round(r.showed_up::numeric       / nullif(r.meetings_booked, 0), 4) as show_up_rate,
  round(r.deals_closed::numeric    / nullif(r.showed_up, 0), 4)   as close_rate,
  round(r.revenue                  / nullif(r.deals_closed, 0), 2) as avg_deal_size
from public.monthly_records r
join public.clients c on c.id = r.client_id;

-- Row Level Security: only signed-in users can read or write
alter table public.clients enable row level security;
alter table public.monthly_records enable row level security;

drop policy if exists "Signed-in users manage clients" on public.clients;
create policy "Signed-in users manage clients" on public.clients
  for all to authenticated using (true) with check (true);

drop policy if exists "Signed-in users manage records" on public.monthly_records;
create policy "Signed-in users manage records" on public.monthly_records
  for all to authenticated using (true) with check (true);
