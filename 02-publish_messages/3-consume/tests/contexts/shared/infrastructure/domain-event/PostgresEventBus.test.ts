import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresEventBus } from "../../../../../src/contexts/shared/infrastructure/domain-event/PostgresEventBus";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";

import { TestDomainEventMother } from "./TestDomainEventMother";
import { UserRegisteredDomainEventMother } from "./UserRegisteredDomainEventMother";

const connection = container.get(PostgresConnection);
const eventBus = container.get(PostgresEventBus);

beforeEach(async () => {
	await connection.truncateAll();
});

afterAll(async () => {
	await connection.end();
});

describe("PostgresEventBus should", () => {
	it("publish a single event", async () => {
		const event = TestDomainEventMother.create();

		await eventBus.publish([event]);

		const result = await connection.sql`
			SELECT id, name, attributes, occurred_at
			FROM public.domain_events_to_consume
			WHERE id = ${event.eventId}
		`;

		expect(result).toHaveLength(1);

		expect(result[0].id).toBe(event.eventId);
		expect(result[0].name).toBe(event.eventName);
		expect(result[0].attributes).toEqual(event.toPrimitives());
		expect(result[0].occurred_at).toEqual(event.occurredOn);
	});

	it("publish multiple events in a transaction", async () => {
		const events = TestDomainEventMother.createMultiple(3);

		await eventBus.publish(events);

		const result = await connection.sql`
			SELECT id, name, attributes, occurred_at
			FROM public.domain_events_to_consume
			ORDER BY occurred_at
		`;

		expect(result).toHaveLength(3);
		events.forEach((event, index) => {
			expect(result[index].id).toBe(event.eventId);
			expect(result[index].name).toBe(event.eventName);
			expect(result[index].attributes).toEqual(event.toPrimitives());
			expect(result[index].occurred_at).toEqual(event.occurredOn);
		});
	});

	it("do nothing when publishing an empty array", async () => {
		await eventBus.publish([]);

		const result = await connection.sql`
			SELECT COUNT(*) as count
			FROM public.domain_events_to_consume
		`;

		expect(Number(result[0].count)).toBe(0);
	});

	it("store event attributes as JSON", async () => {
		const event = TestDomainEventMother.create();

		await eventBus.publish([event]);

		const result = await connection.sql`
			SELECT attributes
			FROM public.domain_events_to_consume
			WHERE id = ${event.eventId}
		`;

		expect(result[0].attributes).toEqual({
			aggregateId: event.aggregateId,
			testData: event.testData,
			description: event.description,
		});
	});
});

describe("PostgresEventBus retry mechanism should", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it("retry up to 3 times on failure", async () => {
		const event = TestDomainEventMother.create();
		const postgresConnection = container.get(PostgresConnection);
		const databaseError = new Error("Database connection failed");

		let attempts = 0;
		jest.spyOn(postgresConnection.sql, "begin").mockImplementation(() => {
			attempts++;
			throw databaseError;
		});

		await expect(eventBus.publish([event])).rejects.toThrow(databaseError);

		expect(attempts).toBe(3);
	});

	it("succeed on second attempt", async () => {
		const event = TestDomainEventMother.create();
		const postgresConnection = container.get(PostgresConnection);
		const databaseError = new Error("Database connection failed");

		let attempts = 0;
		jest.spyOn(postgresConnection.sql, "begin").mockImplementation(() => {
			attempts++;
			if (attempts < 2) {
				throw databaseError;
			}

			return Promise.resolve(undefined);
		});

		await eventBus.publish([event]);

		expect(attempts).toBe(2);
	});
});

describe("PostgresEventBus consume should", () => {
	it("consume and delete events from the database", async () => {
		const events = UserRegisteredDomainEventMother.createMultiple(3);

		await eventBus.publish(events);

		const beforeConsume = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE name = 'codely.mooc.user.registered'
		`;

		expect(beforeConsume).toHaveLength(3);

		await eventBus.consume(10);

		const afterConsume = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE name = 'codely.mooc.user.registered'
		`;

		expect(afterConsume).toHaveLength(0);
	});

	it("delete specific event after consuming it", async () => {
		const event = UserRegisteredDomainEventMother.create();

		await eventBus.publish([event]);

		await eventBus.consume(1);

		const result = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE id = ${event.eventId}
		`;

		expect(result).toHaveLength(0);
	});

	it("respect the limit parameter", async () => {
		const events = TestDomainEventMother.createMultiple(5);

		await eventBus.publish(events);

		const beforeConsume = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE name = 'test.domain.event'
		`;

		expect(beforeConsume).toHaveLength(5);

		await eventBus.consume(2);

		const afterConsume = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE name = 'test.domain.event'
		`;

		expect(afterConsume).toHaveLength(5);
	});

	it("consume events in order by inserted_at", async () => {
		const events = UserRegisteredDomainEventMother.createMultiple(3);

		for (const event of events) {
			// eslint-disable-next-line no-await-in-loop
			await eventBus.publish([event]);
			// eslint-disable-next-line no-await-in-loop
			await new Promise((resolve) => {
				setTimeout(resolve, 10);
			});
		}

		const allEvents = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE name = 'codely.mooc.user.registered'
			ORDER BY inserted_at
		`;

		expect(allEvents).toHaveLength(3);

		await eventBus.consume(1);

		const remaining = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE name = 'codely.mooc.user.registered'
			ORDER BY inserted_at
		`;

		expect(remaining).toHaveLength(2);
		expect(remaining[0].id).toBe(events[1].eventId);
		expect(remaining[1].id).toBe(events[2].eventId);
	});

	it("do nothing when there are no events to consume", async () => {
		await eventBus.consume(10);

		const result = await connection.sql`
			SELECT COUNT(*) as count
			FROM public.domain_events_to_consume
		`;

		expect(Number(result[0].count)).toBe(0);
	});

	it("handle unknown events gracefully", async () => {
		await connection.sql`
			INSERT INTO public.domain_events_to_consume
				(id, name, attributes, occurred_at)
			VALUES (
				'00000000-0000-0000-0000-000000000001',
				'unknown.event.name',
				'{"data": "test"}'::jsonb,
				NOW()
			)
		`;

		const event = TestDomainEventMother.create();
		await eventBus.publish([event]);

		await eventBus.consume(10);

		const unknownEvent = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE id = '00000000-0000-0000-0000-000000000001'
		`;

		expect(unknownEvent).toHaveLength(1);

		const testEvent = await connection.sql`
			SELECT id
			FROM public.domain_events_to_consume
			WHERE name = 'test.domain.event'
		`;

		expect(testEvent).toHaveLength(1);
	});
});
