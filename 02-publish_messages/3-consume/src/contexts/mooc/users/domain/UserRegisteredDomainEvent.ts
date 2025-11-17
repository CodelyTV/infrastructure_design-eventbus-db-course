import { DomainEventAttributes } from "../../../shared/domain/event/DomainEvent";

import { UserDomainEvent } from "./UserDomainEvent";

export class UserRegisteredDomainEvent extends UserDomainEvent {
	static eventName = "codely.mooc.user.registered";

	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly bio: string,
		public readonly email: string,
		eventId?: string,
		occurredAt?: Date,
	) {
		super(UserRegisteredDomainEvent.eventName, id, eventId, occurredAt);
	}

	static fromPrimitives(
		aggregateId: string,
		eventId: string,
		occurredAt: Date,
		attributes: DomainEventAttributes,
	): UserRegisteredDomainEvent {
		return new UserRegisteredDomainEvent(
			aggregateId,
			attributes.name as string,
			attributes.bio as string,
			attributes.email as string,
			eventId,
			occurredAt,
		);
	}

	toPrimitives(): DomainEventAttributes {
		return {
			id: this.id,
			name: this.name,
			bio: this.bio,
			email: this.email,
		};
	}
}
