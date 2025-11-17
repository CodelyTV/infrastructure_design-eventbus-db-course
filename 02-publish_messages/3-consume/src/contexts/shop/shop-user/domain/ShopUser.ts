import { Primitives } from "@codelytv/primitives-type";

import { AggregateRoot } from "../../../shared/domain/AggregateRoot";

import { ShopUserEmail } from "./ShopUserEmail";
import { ShopUserId } from "./ShopUserId";
import { ShopUserName } from "./ShopUserName";

export class ShopUser extends AggregateRoot {
	private constructor(
		public readonly id: ShopUserId,
		public readonly name: ShopUserName,
		public email: ShopUserEmail,
	) {
		super();
	}

	static create(id: string, name: string, email: string): ShopUser {
		return new ShopUser(
			new ShopUserId(id),
			new ShopUserName(name),
			new ShopUserEmail(email),
		);
	}

	static fromPrimitives(primitives: Primitives<ShopUser>): ShopUser {
		return new ShopUser(
			new ShopUserId(primitives.id),
			new ShopUserName(primitives.name),
			new ShopUserEmail(primitives.email),
		);
	}

	toPrimitives(): Primitives<ShopUser> {
		return {
			id: this.id.value,
			name: this.name.value,
			email: this.email.value,
		};
	}

	updateEmail(email: string): void {
		this.email = new ShopUserEmail(email);
	}
}
