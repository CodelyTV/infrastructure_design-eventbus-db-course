import { UserEmailUpdatedDomainEventPrimitives } from "../../../../../src/contexts/shop/shop-user/domain/ShopUserEmailUpdatedDomainEvent";

import { DateMother } from "./DateMother";
import { UserEmailMother } from "./ShopUserEmailMother";
import { UserIdMother } from "./ShopUserIdMother";

export class ShopUserEmailUpdatedDomainEventMother {
	static create(
		params?: Partial<UserEmailUpdatedDomainEventPrimitives> & {
			occurredOn?: Date;
		},
	): ShopUserEmailUpdatedDomainEvent {
		const primitives = {
			id: UserIdMother.create().value,
			email: UserEmailMother.create().value,
			...params,
		};

		return new ShopUserEmailUpdatedDomainEvent(
			primitives.id,
			primitives.email,
			primitives.occurredOn,
		);
	}

	static fromToday(): ShopUserEmailUpdatedDomainEvent {
		return UserEmailUpdatedDomainEventMother.create({
			occurredOn: DateMother.today(),
		});
	}

	static fromYesterday(): ShopUserEmailUpdatedDomainEvent {
		return UserEmailUpdatedDomainEventMother.create({
			occurredOn: DateMother.yesterday(),
		});
	}
}
