import { faker } from "@faker-js/faker";

import { ShopUserEmail } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserEmail";

export class ShopUserEmailMother {
	static create(value?: string): ShopUserEmail {
		return new ShopUserEmail(value ?? faker.internet.email());
	}
}
