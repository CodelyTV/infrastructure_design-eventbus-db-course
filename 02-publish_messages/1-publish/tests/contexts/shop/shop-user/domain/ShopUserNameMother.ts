import { faker } from "@faker-js/faker";

import { ShopUserName } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserName";

export class ShopUserNameMother {
	static create(value?: string): ShopUserName {
		return new ShopUserName(value ?? faker.person.firstName());
	}
}
