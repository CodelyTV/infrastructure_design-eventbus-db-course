CREATE SCHEMA shop;

CREATE TABLE shop.products (
	id uuid PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	price_amount DECIMAL(10, 2) NOT NULL,
	price_currency CHAR(3) NOT NULL,
	image_urls JSONB NOT NULL,
	views INT NOT NULL DEFAULT 0,
	creation_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE shop.users (
	id uuid PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	profile_picture TEXT
);

CREATE TABLE shop.product_reviews (
	id uuid PRIMARY KEY NOT NULL,
	user_id uuid NOT NULL,
	product_id uuid NOT NULL,
	rating REAL NOT NULL,
	comment TEXT NOT NULL,
	is_featured BOOLEAN NOT NULL
);
