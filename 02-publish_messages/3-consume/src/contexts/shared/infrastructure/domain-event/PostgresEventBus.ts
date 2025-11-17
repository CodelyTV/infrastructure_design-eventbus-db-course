/* eslint-disable no-await-in-loop,no-console */
import { JSONValue, Row, TransactionSql } from "postgres";

import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";
import { EventBus } from "../../domain/event/EventBus";
import { retry } from "../../domain/retry";
import { PostgresConnection } from "../postgres/PostgresConnection";

import { DomainEventSubscriptionsMapper } from "./DomainEventSubscriptionsMapper";
import { EventMapper } from "./EventMapper";

export class PostgresEventBus implements EventBus {
	private eventMapperCache?: EventMapper;
	private subscriptionMapperCache?: DomainEventSubscriptionsMapper;

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
			const eventsToConsume = await this.searchEventsToConsume(limit);

			for (const event of eventsToConsume) {
				await this.executeEventSubscribers(event, tx);
			}
		});
	}

	private async publishEvents(events: DomainEvent[]): Promise<void> {
		events.forEach((event) => {
			console.log(`\n📤 Publishing event \`${event.eventName}\``);
		});

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

	private subscriptionsMapper(): DomainEventSubscriptionsMapper {
		this.subscriptionMapperCache ??= new DomainEventSubscriptionsMapper(
			this.eventSubscribersGetter(),
		);

		return this.subscriptionMapperCache;
	}

	private async executeEventSubscribers(
		event: DomainEvent,
		tx: TransactionSql,
	): Promise<void> {
		const subscribers = this.subscriptionsMapper().searchSubscribers(
			event.eventName,
		);

		console.log(`\n📤 Sending event \`${event.eventName}\` to:`);

		for (const subscriber of subscribers) {
			console.log(`\t→ 💻 ${subscriber.name()}`);

			await this.executeEventSubscriber(subscriber, event);
		}

		await tx`
			DELETE FROM public.domain_events_to_consume
			WHERE id = ${event.eventId}
		`;
	}

	private async executeEventSubscriber(
		subscriber: DomainEventSubscriber<DomainEvent>,
		event: DomainEvent,
	): Promise<void> {
		try {
			await subscriber.on(event);
		} catch (error) {
			console.error(
				`\t\t❌ Error executing subscriber ${subscriber.name()} for ${event.eventName}:`,
				error,
			);
		}
	}
}
