create table if not exists admin_notifications (
  id bigint generated always as identity primary key,
  admin_id bigint not null references users(id) on delete cascade,
  order_id bigint references orders(id) on delete cascade,
  type text not null default 'ORDER_CONFIRMED',
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_notifications_admin_id
  on admin_notifications(admin_id);

create index if not exists idx_admin_notifications_order_id
  on admin_notifications(order_id);

create index if not exists idx_admin_notifications_read_at
  on admin_notifications(read_at);

create or replace function create_admin_notification_on_order_confirmed()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'CONFIRMER'
     and (tg_op = 'INSERT' or old.status is distinct from new.status)
  then
    insert into admin_notifications (admin_id, order_id, title, body)
    select
      users.id,
      new.id,
      'Nouvelle commande confirmee',
      'La commande #' || new.id || ' a ete confirmee.'
    from users
    where users.role = 'ADMIN';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_admin_notification_order_confirmed on orders;

create trigger trg_admin_notification_order_confirmed
after insert or update of status on orders
for each row
execute function create_admin_notification_on_order_confirmed();
