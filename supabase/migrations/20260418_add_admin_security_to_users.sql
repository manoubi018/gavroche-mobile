alter table if exists users
  add column if not exists password_hash text;

alter table if exists users
  add column if not exists password_updated_at timestamptz;

alter table if exists users
  add column if not exists failed_login_attempts integer not null default 0;

alter table if exists users
  add column if not exists locked_until timestamptz;

alter table if exists users
  add column if not exists last_login_at timestamptz;

create index if not exists idx_users_role on users(role);
create index if not exists idx_users_locked_until on users(locked_until);
