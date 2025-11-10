import { faker } from "@faker-js/faker";

import { Product } from "../../../../../src/contexts/shop/products/domain/Product";

import { ProductIdMother } from "./ProductIdMother";

export class ProductMother {
	static create(params?: {
		id?: string;
		name?: string;
		price?: { amount: number; currency: "EUR" | "USD" };
		imageUrls?: string[];
	}): Product {
		return new Product(
			params?.id ?? ProductIdMother.create().value,
			params?.name ?? faker.commerce.productName(),
			params?.price ?? {
				amount: parseFloat(
					faker.commerce.price({ min: 10, max: 1000 }),
				),
				currency: "EUR",
			},
			params?.imageUrls ?? [
				faker.image.url(),
				faker.image.url(),
				faker.image.url(),
			],
		);
	}
}
