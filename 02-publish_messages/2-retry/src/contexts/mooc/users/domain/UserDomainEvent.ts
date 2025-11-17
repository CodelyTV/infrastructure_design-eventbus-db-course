import {
	DomainEvent,
	DomainEventAttributes,
} from "../../../shared/domain/event/DomainEvent";

export class UserDomainEvent extends DomainEvent {
	static eventName = "codely.mooc.user.*";

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
	): UserDomainEvent {
		return new UserDomainEvent(
			UserDomainEvent.eventName,
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
