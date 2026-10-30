-- Oogstweb OS — initial schema
-- Internal, single-business application. RLS is enabled on every table and
-- scoped to authenticated users only (there is no public/anonymous access).
-- Agent-initiated actions are never allowed to bypass these policies: every
-- write an agent makes goes through the same authenticated client as a
-- human user, and side-effecting actions are additionally gated by the
-- approvals table (see below) enforced in application code, not just here.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "profiles_self" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- companies (leads and clients share one table; `type` distinguishes them)
-- ---------------------------------------------------------------------------
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'lead' check (type in ('lead', 'client', 'archived')),
  name text not null,
  city text,
  industry text,
  website_url text,
  website_status text check (website_status in ('geen', 'verouderd', 'matig', 'goed', 'onbekend')),
  phone text,
  email text,
  kvk_number text,
  kvk_verified boolean not null default false,
  opportunity_score int check (opportunity_score between 0 and 100),
  pipeline_stage text not null default 'nieuw'
    check (pipeline_stage in ('nieuw', 'gecontacteerd', 'offerte', 'klant', 'verloren')),
  source text,
  research_sources jsonb not null default '[]'::jsonb,
  website_recommendation text,
  notes text,
  last_verified_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table companies enable row level security;
create policy "companies_auth" on companies
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists companies_pipeline_idx on companies (pipeline_stage);
create index if not exists companies_city_idx on companies (city);

-- ---------------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------------
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  name text not null,
  role_title text,
  email text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

alter table contacts enable row level security;
create policy "contacts_auth" on contacts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- interactions (full customer/lead history, including agent-originated notes)
-- ---------------------------------------------------------------------------
create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  kind text not null check (kind in ('notitie', 'email', 'telefoon', 'vergadering', 'systeem')),
  content text not null,
  created_by text,
  agent_run_id uuid,
  created_at timestamptz not null default now()
);

alter table interactions enable row level security;
create policy "interactions_auth" on interactions
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists interactions_company_idx on interactions (company_id, created_at desc);

-- ---------------------------------------------------------------------------
-- projects (website/webshop delivery work)
-- ---------------------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies (id) on delete set null,
  name text not null,
  project_type text not null default 'website' check (project_type in ('website', 'webshop', 'onderhoud', 'overig')),
  status text not null default 'intake'
    check (status in ('intake', 'ontwerp', 'ontwikkeling', 'review', 'live', 'onderhoud')),
  budget numeric(10, 2),
  start_date date,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table projects enable row level security;
create policy "projects_auth" on projects
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_uitvoering', 'klaar')),
  priority text not null default 'normaal' check (priority in ('laag', 'normaal', 'hoog')),
  due_date date,
  related_company_id uuid references companies (id) on delete set null,
  related_project_id uuid references projects (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tasks enable row level security;
create policy "tasks_auth" on tasks
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  related_company_id uuid references companies (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table appointments enable row level security;
create policy "appointments_auth" on appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- quotes & invoices
-- ---------------------------------------------------------------------------
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies (id) on delete set null,
  number text not null unique,
  status text not null default 'concept' check (status in ('concept', 'verzonden', 'geaccepteerd', 'afgewezen')),
  amount numeric(10, 2) not null default 0,
  valid_until date,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table quotes enable row level security;
create policy "quotes_auth" on quotes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies (id) on delete set null,
  quote_id uuid references quotes (id) on delete set null,
  number text not null unique,
  status text not null default 'concept' check (status in ('concept', 'verzonden', 'betaald', 'te_laat')),
  amount numeric(10, 2) not null default 0,
  due_date date,
  paid_at date,
  created_at timestamptz not null default now()
);

alter table invoices enable row level security;
create policy "invoices_auth" on invoices
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- financial_entries (simple cash in/out ledger)
-- ---------------------------------------------------------------------------
create table if not exists financial_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('inkomst', 'uitgave')),
  category text not null,
  description text,
  amount numeric(10, 2) not null,
  entry_date date not null default current_date,
  related_invoice_id uuid references invoices (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table financial_entries enable row level security;
create policy "financial_entries_auth" on financial_entries
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- business_goals
-- ---------------------------------------------------------------------------
create table if not exists business_goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  metric_target numeric,
  metric_current numeric not null default 0,
  unit text,
  deadline date,
  status text not null default 'actief' check (status in ('actief', 'behaald', 'gestopt')),
  created_at timestamptz not null default now()
);

alter table business_goals enable row level security;
create policy "business_goals_auth" on business_goals
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- agent_runs — full audit log of every AI agent action, automatic or not
-- ---------------------------------------------------------------------------
create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_role text not null check (agent_role in (
    'ceo', 'lead_research', 'sales', 'marketing', 'finance',
    'project_manager', 'web_expert', 'quality_controller'
  )),
  action text not null,
  permission_tier int not null check (permission_tier in (1, 2, 3)),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  status text not null default 'automatisch_uitgevoerd' check (status in (
    'automatisch_uitgevoerd', 'wacht_op_goedkeuring', 'goedgekeurd', 'afgewezen', 'mislukt'
  )),
  related_company_id uuid references companies (id) on delete set null,
  error text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id)
);

alter table agent_runs enable row level security;
create policy "agent_runs_auth" on agent_runs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists agent_runs_status_idx on agent_runs (status, created_at desc);

-- ---------------------------------------------------------------------------
-- approvals — the tier 2/3 queue. No side-effecting action may execute
-- until a human sets status = 'goedgekeurd' here.
-- ---------------------------------------------------------------------------
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  agent_run_id uuid not null references agent_runs (id) on delete cascade,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'goedgekeurd', 'afgewezen')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id)
);

alter table approvals enable row level security;
create policy "approvals_auth" on approvals
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index if not exists approvals_status_idx on approvals (status, created_at desc);
