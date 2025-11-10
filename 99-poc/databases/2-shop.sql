/* -------------------------
        SHOP CONTEXT
---------------------------- */

CREATE TABLE shop__users (
	id UUID PRIMARY KEY,
	name VARCHAR(255),
	email VARCHAR(255),
	profile_picture VARCHAR(255)
);

CREATE TABLE shop__product_reviews (
	id UUID PRIMARY KEY,
	user_id UUID REFERENCES shop__users(id),
	product_id UUID REFERENCES seller_backoffice__products(id),
	rating FLOAT,
	comment VARCHAR(500),
	is_featured BOOLEAN DEFAULT FALSE
);
