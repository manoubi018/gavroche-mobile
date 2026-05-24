create table if not exists categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_categories_is_active on categories(is_active);

insert into categories (slug, name, description)
values
  ('fish', 'Poissons', 'Poissons entiers ou en filets, extra frais.'),
  ('shellfish', 'Fruits de mer', 'Moules, palourdes et coquillages.'),
  ('crustaceans', 'Crustaces', 'Crevettes, crabes et homards premium.'),
  ('frozen', 'Surgeles', 'Selection surgelee pour une conservation facile.')
on conflict (slug) do nothing;

alter table if exists products
  add column if not exists category_id bigint references categories(id) on delete restrict;

update products
set category_id = coalesce(
  category_id,
  (
    select id
    from categories
    where slug = case
      when lower(products.nom) like '%shrimp%'
        or lower(products.nom) like '%prawn%'
        or lower(products.nom) like '%lobster%'
        or lower(products.nom) like '%crab%'
        or lower(products.nom) like '%langoustine%'
      then 'crustaceans'
      when lower(products.nom) like '%mussel%'
        or lower(products.nom) like '%clam%'
        or lower(products.nom) like '%octopus%'
      then 'shellfish'
      when lower(products.nom) like '%frozen%'
      then 'frozen'
      else 'fish'
    end
    limit 1
  )
);

create index if not exists idx_products_category_id on products(category_id);
