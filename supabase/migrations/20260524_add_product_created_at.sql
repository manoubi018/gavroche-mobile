alter table if exists products
  add column if not exists created_at timestamptz not null default now();

update products
set created_at = now()
where created_at is null;

create index if not exists idx_products_created_at on products(created_at);
