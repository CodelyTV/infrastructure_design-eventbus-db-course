import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresProductReviewRepository } from "../../../../../src/contexts/shop/product-reviews/infrastructure/PostgresProductReviewRepository";
import { PostgresProductRepository } from "../../../../../src/contexts/shop/products/infrastructure/PostgresProductRepository";
import { PostgresShopUserRepository } from "../../../../../src/contexts/shop/shop-user/infrastructure/PostgresShopUserRepository";
import { ProductIdMother } from "../../products/domain/ProductIdMother";
import { ProductMother } from "../../products/domain/ProductMother";
import { ShopUserMother } from "../../shop-user/domain/ShopUserMother";
import { ProductReviewMother } from "../domain/ProductReviewMother";

const connection = container.get(PostgresConnection);
const repository = container.get(PostgresProductReviewRepository);
const userRepository = container.get(PostgresShopUserRepository);
const productRepository = container.get(PostgresProductRepository);

describe("PostgresProductReviewRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("save a product review", async () => {
		const review = ProductReviewMother.create();

		await repository.save(review);
	});

	it("return empty array searching reviews for a product without reviews", async () => {
		const productId = ProductIdMother.create();

		const reviews = await repository.searchByProduct(productId);

		expect(reviews).toHaveLength(0);
	});

	it("search reviews by product", async () => {
		const user1 = ShopUserMother.create();
		const user2 = ShopUserMother.create();
		const product = ProductMother.create();

		const review1 = ProductReviewMother.create({
			userId: user1.id.value,
			productId: product.id.value,
			userName: user1.name.value,
			userProfilePicture: user1.profilePicture.value,
		});
		const review2 = ProductReviewMother.create({
			userId: user2.id.value,
			productId: product.id.value,
			userName: user2.name.value,
			userProfilePicture: user2.profilePicture.value,
		});

		await userRepository.save(user1);
		await userRepository.save(user2);
		await productRepository.save(product);

		await repository.save(review1);
		await repository.save(review2);

		const reviews = await repository.searchByProduct(product.id);

		expect(reviews).toStrictEqual([review1, review2]);
	});
});
