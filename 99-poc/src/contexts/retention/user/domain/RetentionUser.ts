import { ShopUserId } from "../../../shop/shop-user/domain/ShopUserId";

export type RetentionUserPrimitives = {
	id: string;
	lastActivityDate: Date;
};

export class RetentionUser {
	constructor(
		public readonly id: ShopUserId,
		private lastActivityDate: Date,
	) {}

	static fromPrimitives(primitives: RetentionUserPrimitives): RetentionUser {
		return new RetentionUser(
			new ShopUserId(primitives.id),
			primitives.lastActivityDate,
		);
	}

	updateLastActivityDate(lastActivityDate: Date): void {
		this.lastActivityDate = lastActivityDate;
	}

	toPrimitives(): RetentionUserPrimitives {
		return {
			id: this.id.value,
			lastActivityDate: this.lastActivityDate,
		};
	}

	lastActivityDateIsOlderThan(other: Date): boolean {
		return this.lastActivityDate < other;
	}
}
