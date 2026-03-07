create table if not exists public.active_rehabs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  deal_id uuid references public.deals(id) on delete set null,
  address text not null,
  purchase_price numeric default 0,
  projected jsonb default '{}'::jsonb,
  contractors jsonb default '[]'::jsonb,
  notes jsonb default '[]'::jsonb,
  photos jsonb default '[]'::jsonb,
  scorecard jsonb,
  status text default 'active' check (status in ('active', 'closed')),
  created_at timestamptz default now()
);

alter table public.active_rehabs enable row level security;

create policy "Users can view own rehabs"
  on public.active_rehabs for select
  using (auth.uid() = user_id);

create policy "Users can insert own rehabs"
  on public.active_rehabs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rehabs"
  on public.active_rehabs for update
  using (auth.uid() = user_id);

create policy "Users can delete own rehabs"
  on public.active_rehabs for delete
  using (auth.uid() = user_id);
