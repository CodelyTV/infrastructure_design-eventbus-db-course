import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresProductReviewRepository } from "../../../../../src/contexts/shop/product-reviews/infrastructure/PostgresProductReviewRepository";
import { PostgresProductRepository } from "../../../../../src/contexts/shop/products/infrastructure/PostgresProductRepository";
import { PostgresUserRepository } from "../../../../../src/contexts/shop/users/infrastructure/PostgresUserRepository";
import { ProductIdMother } from "../../products/domain/ProductIdMother";
import { ProductMother } from "../../products/domain/ProductMother";
import { UserMother } from "../../users/domain/UserMother";
import { ProductReviewMother } from "../domain/ProductReviewMother";

const connection = container.get(PostgresConnection);
const repository = container.get(PostgresProductReviewRepository);
const userRepository = container.get(PostgresUserRepository);
const productRepository = container.get(PostgresProductRepository);

describe("PostgresProductReviewRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("save a product review", async () => {
		const user = UserMother.create();
		const product = ProductMother.create();
		const review = ProductReviewMother.create({
			userId: user.id.value,
			productId: product.id.value,
			userName: user.name.value,
			userProfilePicture: user.profilePicture.value,
		});

		await userRepository.save(user);
		await productRepository.save(product);

		await repository.save(review);
	});

	it("return empty array searching reviews for a product without reviews", async () => {
		const productId = ProductIdMother.create();

		const reviews = await repository.searchByProduct(productId);

		expect(reviews).toHaveLength(0);
	});

	it("return reviews for a product", async () => {
		const user = UserMother.create();
		const product = ProductMother.create();
		const review1 = ProductReviewMother.create({
			userId: user.id.value,
			productId: product.id.value,
			userName: user.name.value,
			userProfilePicture: user.profilePicture.value,
		});
		const review2 = ProductReviewMother.create({
			userId: user.id.value,
			productId: product.id.value,
			userName: user.name.value,
			userProfilePicture: user.profilePicture.value,
		});

		await userRepository.save(user);
		await productRepository.save(product);

		await repository.save(review1);
		await repository.save(review2);

		const reviews = await repository.searchByProduct(product.id);

		expect(reviews).toHaveLength(2);
		expect(reviews[0].productId.value).toBe(product.id.value);
		expect(reviews[1].productId.value).toBe(product.id.value);
	});

	it("return only reviews for the specified product", async () => {
		const user = UserMother.create();
		const product1 = ProductMother.create();
		const product2 = ProductMother.create();
		const review1 = ProductReviewMother.create({
			userId: user.id.value,
			productId: product1.id.value,
			userName: user.name.value,
			userProfilePicture: user.profilePicture.value,
		});
		const review2 = ProductReviewMother.create({
			userId: user.id.value,
			productId: product2.id.value,
			userName: user.name.value,
			userProfilePicture: user.profilePicture.value,
		});

		await connection.sql`INSERT INTO shop.users (id, name, email, profile_picture)
			VALUES (${user.id.value}, ${user.name.value}, ${user.email.value}, ${user.profilePicture.value})`;
		await connection.sql`INSERT INTO shop.products (id, name, price_amount, price_currency, image_urls, views, creation_date)
			VALUES (${product1.id.value}, ${product1.name.value}, ${product1.price.amount}, ${product1.price.currency}, ${connection.sql.json(product1.imageUrls.toPrimitives())}, 0, NOW())`;
		await connection.sql`INSERT INTO shop.products (id, name, price_amount, price_currency, image_urls, views, creation_date)
			VALUES (${product2.id.value}, ${product2.name.value}, ${product2.price.amount}, ${product2.price.currency}, ${connection.sql.json(product2.imageUrls.toPrimitives())}, 0, NOW())`;

		await repository.save(review1);
		await repository.save(review2);

		const reviews = await repository.searchByProduct(product1.id);

		expect(reviews).toHaveLength(1);
		expect(reviews[0].productId.value).toBe(product1.id.value);
	});
});
