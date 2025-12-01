import { faker } from "@faker-js/faker";

import { ShopUserProfilePicture } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserProfilePicture";

export class ShopUserProfilePictureMother {
	static create(value?: string): ShopUserProfilePicture {
		return new ShopUserProfilePicture(value ?? faker.image.url());
	}
}
