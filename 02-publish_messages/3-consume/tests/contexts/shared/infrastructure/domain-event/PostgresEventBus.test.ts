import "reflect-metadata";

import { container } from "../../../../../src/contexts/shared/infrastructure/dependency-injection/diod.config";
import { PostgresEventBus } from "../../../../../src/contexts/shared/infrastructure/domain-event/PostgresEventBus";
import { PostgresConnection } from "../../../../../src/contexts/shared/infrastructure/postgres/PostgresConnection";

import { TestDomainEventMother } from "./TestDomainEventMother";

const connection = container.get(PostgresConnection);
const eventBus = container.get(PostgresEventBus);

describe("PostgresEventBus should", () => {
	beforeEach(async () => {
		await connection.truncateAll();
	});

	afterAll(async () => {
		await connection.end();
	});

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
