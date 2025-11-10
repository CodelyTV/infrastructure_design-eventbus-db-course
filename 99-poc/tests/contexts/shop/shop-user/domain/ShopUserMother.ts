import { Primitives } from "@codelytv/primitives-type";

import { ShopUser } from "../../../../../src/contexts/shop/shop-user/domain/ShopUser";
import { ShopUserStatus } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserStatus";

import { ShopUserEmailMother } from "./ShopUserEmailMother";
import { ShopUserIdMother } from "./ShopUserIdMother";
import { ShopUserNameMother } from "./ShopUserNameMother";
import { ShopUserProfilePictureMother } from "./ShopUserProfilePictureMother";

export class ShopUserMother {
	static create(params?: Partial<Primitives<ShopUser>>): ShopUser {
		const primitives: Primitives<ShopUser> = {
			id: ShopUserIdMother.create().value,
			name: ShopUserNameMother.create().value,
			email: ShopUserEmailMother.create().value,
			profilePicture: ShopUserProfilePictureMother.create().value,
			status: ShopUserStatus.Active,
			...params,
		};

		return ShopUser.fromPrimitives(primitives);
	}
}
