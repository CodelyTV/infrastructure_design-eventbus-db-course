import { Primitives } from "@codelytv/primitives-type";

import { UserStatus } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserStatus";

import { UserEmailMother } from "./ShopUserEmailMother";
import { UserIdMother } from "./ShopUserIdMother";
import { UserNameMother } from "./ShopUserNameMother";
import { UserProfilePictureMother } from "./ShopUserProfilePictureMother";

export class ShopUserRegisteredDomainEventMother {
	static create(
		params?: Partial<Primitives<ShopUser>>,
	): ShopUserRegisteredDomainEvent {
		const primitives: Primitives<ShopUser> = {
			id: UserIdMother.create().value,
			name: UserNameMother.create().value,
			email: UserEmailMother.create().value,
			profilePicture: UserProfilePictureMother.create().value,
			status: UserStatus.Active,
			...params,
		};

		return new ShopUserRegisteredDomainEvent(
			primitives.id,
			primitives.name,
			primitives.email,
			primitives.profilePicture,
			primitives.status,
		);
	}
}
