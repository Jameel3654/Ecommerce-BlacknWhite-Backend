create type user_role as enum ('admin', 'user');
create type product_status as enum ('active', 'draft', 'archived');

create table users (
  id serial primary key,
  name varchar not null,
  email varchar not null unique,
  password_hash varchar,
  google_id varchar,
  role user_role default 'user',
  avatar varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id serial primary key,
  name varchar not null,
  slug varchar not null unique,
  sku varchar unique,
  description text not null,
  category varchar not null,
  price numeric(10,2) not null,
  currency varchar not null default 'PKR',
  stock integer not null default 0,
  reorder_level integer not null default 5,
  status product_status not null default 'active',
  is_new boolean not null default false,
  rating numeric(2,1) not null default 4.8,
  reviews integer not null default 0,
  image_url varchar,
  gallery_images json not null default '[]',
  cloudinary_public_id varchar,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  id serial primary key,
  user_id integer references users(id),
  customer_name varchar not null,
  customer_email varchar not null,
  customer_phone varchar not null default '',
  shipping_address json not null,
  shipping_method varchar not null default 'standard',
  shipping_fee numeric(10,2) not null default 0,
  payment_method varchar not null,
  payment_status varchar not null default 'pending',
  total_amount numeric(10,2) not null,
  currency varchar not null default 'PKR',
  status varchar not null default 'processing',
  return_status varchar not null default 'none',
  return_reason text,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id serial primary key,
  order_id integer references orders(id),
  product_id integer references products(id),
  product_name varchar not null,
  quantity integer not null,
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
