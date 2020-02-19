-- \c jobly

-- DROP TABLE IF EXISTS companies;

-- CREATE TABLE companies (
--     id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     first_name text NOT NULL,
--     last_name text NOT NULL,
--     phone text,
--     notes text DEFAULT '' NOT NULL
-- );

-- CREATE TABLE reservations (
--     id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     customer_id integer NOT NULL REFERENCES customers,
--     start_at timestamp without time zone NOT NULL,
--     num_guests integer NOT NULL,
--     notes text DEFAULT '' NOT NULL,
--     CONSTRAINT reservations_num_guests_check CHECK ((num_guests > 0))
-- );