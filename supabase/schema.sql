create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  amount_paid numeric(10,2) not null check (amount_paid >= 0),
  daily_income numeric(10,2) check (daily_income >= 0),
  receipt_url text,
  confirmation_code text,
  notes text,
  created_at timestamptz default now()
);

-- RLS habilitado
alter table payments enable row level policy;

-- Índices
create index if not exists payments_date_idx on payments (date desc);
create index if not exists payments_user_id_idx on payments (user_id);

-- Políticas por usuario
create policy "Users can view own payments"
  on payments for select
  using (auth.uid() = user_id);

create policy "Users can insert own payments"
  on payments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own payments"
  on payments for update
  using (auth.uid() = user_id);

create policy "Users can delete own payments"
  on payments for delete
  using (auth.uid() = user_id);

-- Políticas admin (is_admin=true en user metadata)
create policy "Admin can view all payments"
  on payments for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
    )
  );

create policy "Admin can update all payments"
  on payments for update
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
    )
  );

create policy "Admin can delete all payments"
  on payments for delete
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and (auth.users.raw_user_meta_data ->> 'is_admin')::boolean = true
    )
  );

-- Storage bucket para comprobantes
insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', true)
  on conflict (id) do nothing;

create policy "Authenticated user can upload receipts"
  on storage.objects
  for insert
  with check (bucket_id = 'receipts' and auth.uid() is not null);

create policy "Anyone can view receipts"
  on storage.objects
  for select
  using (bucket_id = 'receipts');
