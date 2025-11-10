CREATE TABLE shop.products (
	id UUID PRIMARY KEY,
	name VARCHAR(255),
	price_amount DECIMAL(10, 2),
	price_currency CHAR(3),
	image_urls JSON,
	views INT,
	creation_date TIMESTAMP
);

CREATE TABLE shop.users (
	id UUID PRIMARY KEY,
	name VARCHAR(255),
	email VARCHAR(255),
	profile_picture VARCHAR(255)
);

CREATE TABLE shop.product_reviews (
	id UUID PRIMARY KEY,
	user_id UUID,
	product_id UUID,
	rating FLOAT,
	comment VARCHAR(500),
	is_featured BOOLEAN DEFAULT FALSE
);
