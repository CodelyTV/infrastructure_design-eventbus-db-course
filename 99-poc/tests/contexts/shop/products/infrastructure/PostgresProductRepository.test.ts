import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";
import { PostgresProductRepository } from "../../../../../src/contexts/shop/products/infrastructure/PostgresProductRepository";
import { ProductIdMother } from "../domain/ProductIdMother";
import { ProductMother } from "../domain/ProductMother";
import { ProductNameMother } from "../domain/ProductNameMother";

const connection = container.get(PostgresConnection);
const repository = container.get(PostgresProductRepository);

describe("PostgresProductRepository should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

	it("save a product", async () => {
		const product = ProductMother.create();

		await repository.save(product);
	});

	it("update an existing product when saving with the same id", async () => {
		const originalProduct = ProductMother.create();
		const newName = ProductNameMother.create();
		const updatedProduct = ProductMother.create({
			id: originalProduct.id.value,
			name: newName.value,
		});

		await repository.save(originalProduct);
		await repository.save(updatedProduct);

		const searchedProduct = await repository.search(originalProduct.id);

		expect(searchedProduct?.name.value).toBe(newName.value);
	});

	it("return null searching a non existing product", async () => {
		const productId = ProductIdMother.create();

		expect(await repository.search(productId)).toBeNull();
	});

	it("return an existing product", async () => {
		const product = ProductMother.create();

		await repository.save(product);

		expect(await repository.search(product.id)).toStrictEqual(product);
	});

	describe("searchAll", () => {
		it("return empty array when no products exist", async () => {
			const products = await repository.searchAll();

			expect(products).toHaveLength(0);
		});

		it("return all products", async () => {
			const product1 = ProductMother.create();
			const product2 = ProductMother.create();
			const product3 = ProductMother.create();

			await repository.save(product1);
			await repository.save(product2);
			await repository.save(product3);

			const products = await repository.searchAll();

			expect(products).toHaveLength(3);
		});
	});
});
