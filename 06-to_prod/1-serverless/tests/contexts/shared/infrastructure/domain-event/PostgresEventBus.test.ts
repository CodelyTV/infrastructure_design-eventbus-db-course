import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresEventBus } from "../../../../../src/contexts/shared/infrastructure/domain-event/PostgresEventBus";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";

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
	it("publish a single event to each subscriber", async () => {
		const event = UserRegisteredDomainEventMother.create();

		await eventBus.publish([event]);

		const result = await connection.sql`
			SELECT event_id, subscriber_name, name, attributes, occurred_at
			FROM public.domain_events_to_consume
			WHERE event_id = ${event.eventId}
			ORDER BY subscriber_name
		`;

		expect(result.length).toBeGreaterThan(0);

		result.forEach((row) => {
			expect(row.event_id).toBe(event.eventId);
			expect(row.name).toBe(event.eventName);
			expect(row.attributes).toEqual(event.toPrimitives());
			expect(row.occurred_at).toEqual(event.occurredAt);
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
});

describe("PostgresEventBus retry mechanism should", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it("retry up to 3 times on failure", async () => {
		const event = UserRegisteredDomainEventMother.create();
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
		const event = UserRegisteredDomainEventMother.create();
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
	it("consume and delete events for all subscribers with *", async () => {
		const event = UserRegisteredDomainEventMother.create();

		await eventBus.publish([event]);

		await eventBus.consume("*", 100);

		const result = await connection.sql`
			SELECT event_id
			FROM public.domain_events_to_consume
			WHERE event_id = ${event.eventId}
		`;

		expect(result).toHaveLength(0);
	});

	it("consume only events for specified subscriber", async () => {
		const event = UserRegisteredDomainEventMother.create();

		await eventBus.publish([event]);

		const subscriberToConsume =
			"codely.retention.send_welcome_email_on_user_registered";

		await eventBus.consume([subscriberToConsume], 100);

		const remaining = await connection.sql`
			SELECT subscriber_name
			FROM public.domain_events_to_consume
			WHERE event_id = ${event.eventId}
		`;

		expect(
			remaining.every((r) => r.subscriber_name !== subscriberToConsume),
		).toBe(true);
	});

	it("not consume unknown events", async () => {
		const unknownEventId = "00000000-0000-0000-0000-000000000001";
		const subscriberName = "test.subscriber";

		await connection.sql`
			INSERT INTO public.domain_events_to_consume
				(event_id, subscriber_name, name, attributes, occurred_at)
			VALUES (
				${unknownEventId},
				${subscriberName},
				'unknown.event.name',
				'{"data": "test"}'::jsonb,
				NOW()
			)
		`;

		await eventBus.consume("*", 10);

		const unknownEvent = await connection.sql`
			SELECT event_id
			FROM public.domain_events_to_consume
			WHERE event_id = ${unknownEventId}
		`;

		expect(unknownEvent).toHaveLength(1);
	});

	it("do nothing when there are no events", async () => {
		const beforeCount = await connection.sql`
			SELECT COUNT(*) as count
			FROM public.domain_events_to_consume
		`;

		await eventBus.consume("*", 10);

		const afterCount = await connection.sql`
			SELECT COUNT(*) as count
			FROM public.domain_events_to_consume
		`;

		expect(afterCount[0].count).toBe(beforeCount[0].count);
	});
});
