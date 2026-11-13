create table subscribers (
  id serial primary key,
  email text unique not null,
  status text not null default 'pending', -- 'pending' until the link is clicked
  token text not null
);

create table posts (
  id serial primary key,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
