DROP TABLE IF EXISTS companies;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE, 
    num_employees integer,
    description text,
    logo_url text
);