import {
	DomainEvent,
	DomainEventAttributes,
} from "../../../shared/domain/event/DomainEvent";

export class ShopUserDomainEvent extends DomainEvent {
	static eventName = "codely.shop.user.*";

	constructor(
		eventName: string,
		public readonly id: string,
		eventId?: string,
		occurredAt?: Date,
	) {
		super(eventName, id, eventId, occurredAt);
	}

	static fromPrimitives(
		aggregateId: string,
		eventId: string,
		occurredAt: Date,
		_attributes: DomainEventAttributes,
	): ShopUserDomainEvent {
		return new ShopUserDomainEvent(
			ShopUserDomainEvent.eventName,
			aggregateId,
			eventId,
			occurredAt,
		);
	}

	toPrimitives(): { [key: string]: unknown } {
		return {
			id: this.id,
		};
	}
}
