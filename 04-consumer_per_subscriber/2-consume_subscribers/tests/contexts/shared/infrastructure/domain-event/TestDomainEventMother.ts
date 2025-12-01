import { faker } from "@faker-js/faker";

import { TestDomainEvent } from "./TestDomainEvent";

export class TestDomainEventMother {
	static create(params?: {
		aggregateId?: string;
		testData?: string;
		description?: string;
		eventId?: string;
		occurredAt?: Date;
	}): TestDomainEvent {
		return new TestDomainEvent(
			params?.aggregateId ?? faker.string.uuid(),
			params?.testData ?? faker.lorem.word(),
			params?.description ?? faker.lorem.sentence(),
			params?.eventId,
			params?.occurredAt,
		);
	}

	static createMultiple(count: number): TestDomainEvent[] {
		return Array.from({ length: count }, () => this.create());
	}
}
