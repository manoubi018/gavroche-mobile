create table if not exists admin_push_subscriptions (
  id bigint generated always as identity primary key,
  admin_id bigint not null references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_admin_push_subscriptions_admin_id
  on admin_push_subscriptions(admin_id);

create index if not exists idx_admin_push_subscriptions_active
  on admin_push_subscriptions(active);
