DROP TABLE IF EXISTS companies, jobs, users;

CREATE TABLE companies (
    handle text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    num_employees integer,
    description text,
    logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY ,
    title text NOT NULL,
    salary FLOAT NOT NULL CHECK(salary >= 0),
    equity FLOAT NOT NULL CHECK(equity>= 0 AND equity <=1),
    company_handle text REFERENCES companies ON DELETE CASCADE,
    date_posted TIMESTAMP with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    username text PRIMARY KEY ,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin boolean NOT NULL DEFAULT FALSE
);