import { Primitives } from "@codelytv/primitives-type";

import { ShopUser } from "../../../../../src/contexts/shop/shop-user/domain/ShopUser";

import { ShopUserEmailMother } from "./ShopUserEmailMother";
import { ShopUserIdMother } from "./ShopUserIdMother";
import { ShopUserNameMother } from "./ShopUserNameMother";

export class ShopUserMother {
	static create(params?: Partial<Primitives<ShopUser>>): ShopUser {
		const primitives: Primitives<ShopUser> = {
			id: ShopUserIdMother.create().value,
			name: ShopUserNameMother.create().value,
			email: ShopUserEmailMother.create().value,
			...params,
		};

		return ShopUser.fromPrimitives(primitives);
	}
}
