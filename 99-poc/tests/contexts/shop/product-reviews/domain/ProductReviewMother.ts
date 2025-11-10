import { faker } from "@faker-js/faker";

import { ProductReview } from "../../../../../src/contexts/shop/product-reviews/domain/ProductReview";
import { ProductIdMother } from "../../products/domain/ProductIdMother";
import { UserIdMother } from "../../shop-user/domain/ShopUserIdMother";
import { UserNameMother } from "../../shop-user/domain/ShopUserNameMother";
import { UserProfilePictureMother } from "../../shop-user/domain/ShopUserProfilePictureMother";

import { ProductReviewIdMother } from "./ProductReviewIdMother";

export class ProductReviewMother {
	static create(params?: {
		id?: string;
		userId?: string;
		productId?: string;
		rating?: number;
		comment?: string;
		userName?: string;
		userProfilePicture?: string;
	}): ProductReview {
		return new ProductReview(
			params?.id ?? ProductReviewIdMother.create().value,
			params?.userId ?? UserIdMother.create().value,
			params?.productId ?? ProductIdMother.create().value,
			params?.rating ??
				faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
			params?.comment ?? faker.lorem.paragraph(),
			params?.userName ?? UserNameMother.create().value,
			params?.userProfilePicture ??
				UserProfilePictureMother.create().value,
		);
	}
}
