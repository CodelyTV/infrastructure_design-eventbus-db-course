/* eslint-disable no-await-in-loop */
import { JSONValue, Row, TransactionSql } from "postgres";

import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";
import { EventBus } from "../../domain/event/EventBus";
import { retry } from "../../domain/retry";
import { PostgresConnection } from "../postgres/PostgresConnection";

import { EventMapper } from "./EventMapper";

export class PostgresEventBus implements EventBus {
	private eventMapperCache?: EventMapper;

	constructor(
		private readonly connection: PostgresConnection,
		private readonly eventSubscribersGetter: () => DomainEventSubscriber<DomainEvent>[],
	) {}

	async publish(events: DomainEvent[]): Promise<void> {
		if (events.length === 0) {
			return;
		}

		await retry(async () => await this.publishEvents(events), 3, 30);
	}

	async consume(limit: number): Promise<void> {
		await this.connection.sql.begin(async (tx) => {
			const eventsToConsume: DomainEvent[] =
				await this.searchEventsToConsume(limit);

			if (eventsToConsume.length === 0) {
				return;
			}

			for (const event of eventsToConsume) {
				await this.executeSubscribersFor(event, tx);
			}
		});
	}

	private async searchEventsToConsume(limit: number): Promise<DomainEvent[]> {
		const rows = await this.connection.sql<
			{
				id: string;
				name: string;
				attributes: Record<string, unknown>;
				occurred_at: Date;
			}[]
		>`
			SELECT id, name, attributes, occurred_at
			FROM public.domain_events_to_consume
			ORDER BY inserted_at ASC
			LIMIT ${limit}
			FOR UPDATE SKIP LOCKED
		`;

		if (rows.length === 0) {
			return [];
		}

		return rows
			.map((row) =>
				this.eventMapper().searchEvent(
					row.id,
					row.name,
					row.attributes,
					row.occurred_at,
				),
			)
			.filter((event): event is DomainEvent => event !== null);
	}

	private eventMapper(): EventMapper {
		this.eventMapperCache ??= EventMapper.fromSubscribers(
			this.eventSubscribersGetter(),
		);

		return this.eventMapperCache;
	}

	private async executeSubscribersFor(
		event: DomainEvent,
		tx: TransactionSql,
	): Promise<void> {
		const subscribers = this.eventSubscribersGetter();
		const subscriptions = this.buildSubscriptions(subscribers);

		const eventSubscribers = subscriptions.get(event.eventName);

		if (eventSubscribers && eventSubscribers.length > 0) {
			const executions = eventSubscribers.map((sub) =>
				sub.subscriber(event),
			);

			try {
				await Promise.all(executions);
			} catch (error) {
				console.error(
					`❌ Error executing subscriber for ${event.eventName}:`,
					error,
				);
				throw error;
			}
		}

		await tx`
			DELETE FROM public.domain_events_to_consume
			WHERE id = ${event.eventId}
		`;
	}

	private async publishEvents(events: DomainEvent[]): Promise<void> {
		await this.connection.sql.begin(async (tx) => {
			await Promise.all(
				events.map((event) => this.insertEvent(event, tx)),
			);
		});
	}

	private async insertEvent(
		event: DomainEvent,
		tx: TransactionSql,
	): Promise<Row[]> {
		return tx`
			INSERT INTO public.domain_events_to_consume
				(id, name, attributes, occurred_at)
			VALUES (
				${event.eventId},
				${event.eventName},
				${tx.json(event.toPrimitives() as JSONValue)},
				${event.occurredAt}
			)
		`;
	}

	private buildSubscriptions(
		subscribers: DomainEventSubscriber<DomainEvent>[],
	): Map<
		string,
		{ subscriber: (event: DomainEvent) => Promise<void>; name: string }[]
	> {
		const subscriptions = new Map<
			string,
			{
				subscriber: (event: DomainEvent) => Promise<void>;
				name: string;
			}[]
		>();

		for (const subscriber of subscribers) {
			for (const event of subscriber.subscribedTo()) {
				const currentSubscriptions =
					subscriptions.get(event.eventName) ?? [];

				const subscription = {
					subscriber: subscriber.on.bind(subscriber),
					name: subscriber.name(),
				};

				const isDuplicate = currentSubscriptions.some(
					(sub) => sub.name === subscription.name,
				);

				if (!isDuplicate) {
					currentSubscriptions.push(subscription);
					subscriptions.set(event.eventName, currentSubscriptions);
				}
			}
		}

		return subscriptions;
	}
}
