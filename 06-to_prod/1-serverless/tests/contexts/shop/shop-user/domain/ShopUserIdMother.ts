import { faker } from "@faker-js/faker";

import { ShopUserId } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserId";

export class ShopUserIdMother {
	static create(value?: string): ShopUserId {
		return new ShopUserId(value ?? faker.string.uuid());
	}
}
