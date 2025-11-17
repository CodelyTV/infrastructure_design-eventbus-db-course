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
		occurredOn?: Date,
	) {
		super(eventName, id, eventId, occurredOn);
	}

	static fromPrimitives(
		aggregateId: string,
		eventId: string,
		occurredOn: Date,
		_attributes: DomainEventAttributes,
	): ShopUserDomainEvent {
		return new ShopUserDomainEvent(
			ShopUserDomainEvent.eventName,
			aggregateId,
			eventId,
			occurredOn,
		);
	}

	toPrimitives(): { [key: string]: unknown } {
		return {
			id: this.id,
		};
	}
}
