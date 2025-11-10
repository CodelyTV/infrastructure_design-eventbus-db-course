import { Primitives } from "@codelytv/primitives-type";

import { AggregateRoot } from "../../../shared/domain/AggregateRoot";

import { ShopUserEmail } from "./ShopUserEmail";
import { ShopUserId } from "./ShopUserId";
import { ShopUserName } from "./ShopUserName";
import { ShopUserProfilePicture } from "./ShopUserProfilePicture";
import { ShopUserRegisteredDomainEvent } from "./ShopUserRegisteredDomainEvent";
import { ShopUserStatus } from "./ShopUserStatus";

export class ShopUser extends AggregateRoot {
	private constructor(
		public readonly id: ShopUserId,
		public readonly name: ShopUserName,
		public email: ShopUserEmail,
		public readonly profilePicture: ShopUserProfilePicture,
		public status: ShopUserStatus,
	) {
		super();
	}

	static create(
		id: string,
		name: string,
		email: string,
		profilePicture: string,
	): ShopUser {
		const defaultUserStatus = ShopUserStatus.Active;

		const user = new ShopUser(
			new ShopUserId(id),
			new ShopUserName(name),
			new ShopUserEmail(email),
			new ShopUserProfilePicture(profilePicture),
			defaultUserStatus,
		);

		user.record(
			new ShopUserRegisteredDomainEvent(
				id,
				name,
				email,
				profilePicture,
				defaultUserStatus,
			),
		);

		return user;
	}

	static fromPrimitives(primitives: Primitives<ShopUser>): ShopUser {
		return new ShopUser(
			new ShopUserId(primitives.id),
			new ShopUserName(primitives.name),
			new ShopUserEmail(primitives.email),
			new ShopUserProfilePicture(primitives.profilePicture),
			primitives.status as ShopUserStatus,
		);
	}

	toPrimitives(): Primitives<ShopUser> {
		return {
			id: this.id.value,
			name: this.name.value,
			email: this.email.value,
			profilePicture: this.profilePicture.value,
			status: this.status,
		};
	}

	updateEmail(email: string): void {
		this.email = new ShopUserEmail(email);
	}
}
