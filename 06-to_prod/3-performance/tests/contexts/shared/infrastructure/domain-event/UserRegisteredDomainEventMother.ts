import { faker } from "@faker-js/faker";

import { UserRegisteredDomainEvent } from "../../../../../src/contexts/mooc/users/domain/UserRegisteredDomainEvent";

export class UserRegisteredDomainEventMother {
	static create(params?: {
		id?: string;
		name?: string;
		bio?: string;
		email?: string;
		eventId?: string;
		occurredAt?: Date;
	}): UserRegisteredDomainEvent {
		return new UserRegisteredDomainEvent(
			params?.id ?? faker.string.uuid(),
			params?.name ?? faker.person.fullName(),
			params?.bio ?? faker.lorem.sentence(),
			params?.email ?? faker.internet.email(),
			params?.eventId,
			params?.occurredAt,
		);
	}

	static createMultiple(count: number): UserRegisteredDomainEvent[] {
		return Array.from({ length: count }, () => this.create());
	}
}
