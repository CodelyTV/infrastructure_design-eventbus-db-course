import {
	DomainEvent,
	DomainEventAttributes,
} from "../../../../../src/contexts/shared/domain/event/DomainEvent";

export class TestDomainEvent extends DomainEvent {
	static eventName = "test.domain.event";

	constructor(
		public readonly aggregateId: string,
		public readonly testData: string,
		public readonly description: string,
		eventId?: string,
		occurredOn?: Date,
	) {
		super(TestDomainEvent.eventName, aggregateId, eventId, occurredOn);
	}

	static fromPrimitives(
		aggregateId: string,
		eventId: string,
		occurredOn: Date,
		attributes: DomainEventAttributes,
	): TestDomainEvent {
		return new TestDomainEvent(
			aggregateId,
			attributes.testData as string,
			attributes.description as string,
			eventId,
			occurredOn,
		);
	}

	toPrimitives(): DomainEventAttributes {
		return {
			aggregateId: this.aggregateId,
			testData: this.testData,
			description: this.description,
		};
	}
}
