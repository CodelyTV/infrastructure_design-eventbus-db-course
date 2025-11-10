import { faker } from "@faker-js/faker";

import { ProductReview } from "../../../../../src/contexts/shop/product-reviews/domain/ProductReview";
import { UserIdMother } from "../../../mooc/users/domain/UserIdMother";
import { ProductIdMother } from "../../products/domain/ProductIdMother";

import { ProductReviewIdMother } from "./ProductReviewIdMother";

export class ProductReviewMother {
	static create(params?: {
		id?: string;
		userId?: string;
		productId?: string;
		rating?: number;
		comment?: string;
	}): ProductReview {
		return new ProductReview(
			params?.id ?? ProductReviewIdMother.create().value,
			params?.userId ?? UserIdMother.create().value,
			params?.productId ?? ProductIdMother.create().value,
			params?.rating ??
				faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
			params?.comment ?? faker.lorem.paragraph(),
		);
	}
}
