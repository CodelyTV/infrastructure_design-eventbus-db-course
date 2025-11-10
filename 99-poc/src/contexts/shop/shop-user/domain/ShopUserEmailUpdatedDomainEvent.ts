import { DomainEventAttributes } from "../../../shared/domain/event/DomainEvent";

import { ShopUserDomainEvent } from "./ShopUserDomainEvent";

export type ShopUserEmailUpdatedDomainEventPrimitives = {
	id: string;
	email: string;
};

export class ShopUserEmailUpdatedDomainEvent extends ShopUserDomainEvent {
	static eventName = "codely.shop.user.email.updated";

	constructor(
		public readonly id: string,
		public readonly email: string,
		eventId?: string,
		occurredOn?: Date,
	) {
		super(
			ShopUserEmailUpdatedDomainEvent.eventName,
			id,
			eventId,
			occurredOn,
		);
	}

	static fromPrimitives(
		aggregateId: string,
		eventId: string,
		occurredOn: Date,
		attributes: DomainEventAttributes,
	): ShopUserEmailUpdatedDomainEvent {
		return new ShopUserEmailUpdatedDomainEvent(
			aggregateId,
			attributes.email as string,
			eventId,
			occurredOn,
		);
	}

	toPrimitives(): ShopUserEmailUpdatedDomainEventPrimitives {
		return {
			id: this.id,
			email: this.email,
		};
	}
}
