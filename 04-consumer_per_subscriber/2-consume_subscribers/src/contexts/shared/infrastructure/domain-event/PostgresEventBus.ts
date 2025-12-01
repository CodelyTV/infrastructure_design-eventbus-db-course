/* eslint-disable no-await-in-loop,no-console */
import { JSONValue, Row, TransactionSql } from "postgres";

import {
	DomainEvent,
	DomainEventAttributes,
} from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";
import { EventBus } from "../../domain/event/EventBus";
import { retry } from "../../domain/retry";
import { PostgresConnection } from "../postgres/PostgresConnection";

import { DomainEventNameToClass } from "./DomainEventNameToClass";
import { DomainEventNameToSubscribers } from "./DomainEventNameToSubscribers";

type DomainEventToConsume = {
	eventId: string;
	eventName: string;
	subscriberName: string;
	attributes: DomainEventAttributes;
	occurredAt: Date;
};

export class PostgresEventBus implements EventBus {
	private eventNameToClassCache?: DomainEventNameToClass;
	private eventNameToSubscribersCache?: DomainEventNameToSubscribers;

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

	async consume(subscribers: string[] | "*", limit: number): Promise<void> {
		await this.connection.sql.begin(async (tx) => {
			const rows = await this.searchEventsToConsume(
				subscribers,
				limit,
				tx,
			);

			for (const row of rows) {
				await this.executeSubscriberForEvent(row, tx);
			}
		});
	}

	private async publishEvents(events: DomainEvent[]): Promise<void> {
		await this.connection.sql.begin(async (tx) => {
			for (const event of events) {
				const subscribers =
					this.eventNameToSubscribers().searchSubscribers(
						event.eventName,
					);

				console.log(
					`\n📤 Publishing event \`${event.eventName}\` to:\n${subscribers.map((s) => `\t→ ${s.name()}`).join("\n")}`,
				);

				await Promise.all(
					subscribers.map((subscriber) =>
						this.insertEventForSubscriber(
							event,
							subscriber.name(),
							tx,
						),
					),
				);
			}
		});
	}

	private async insertEventForSubscriber(
		event: DomainEvent,
		subscriberName: string,
		tx: TransactionSql,
	): Promise<Row[]> {
		return tx`
			INSERT INTO public.domain_events_to_consume
				(event_id, subscriber_name, name, attributes, occurred_at)
			VALUES (
				${event.eventId},
				${subscriberName},
				${event.eventName},
				${tx.json(event.toPrimitives() as JSONValue)},
				${event.occurredAt}
			)
		`;
	}

	private async searchEventsToConsume(
		subscribers: string[] | "*",
		limit: number,
		tx: TransactionSql,
	): Promise<DomainEventToConsume[]> {
		const where =
			subscribers === "*"
				? ""
				: tx`WHERE subscriber_name = ANY(${subscribers})`;

		return tx`
			SELECT
				event_id AS "eventId",
				subscriber_name AS "subscriberName",
				name AS "eventName",
				attributes,
				occurred_at AS "occurredAt"
			FROM public.domain_events_to_consume
			${where}
			ORDER BY inserted_at ASC
			LIMIT ${limit}
			FOR UPDATE SKIP LOCKED
		`;
	}

	private eventNameToClass(): DomainEventNameToClass {
		this.eventNameToClassCache ??= DomainEventNameToClass.fromSubscribers(
			this.eventSubscribersGetter(),
		);

		return this.eventNameToClassCache;
	}

	private eventNameToSubscribers(): DomainEventNameToSubscribers {
		this.eventNameToSubscribersCache ??= new DomainEventNameToSubscribers(
			this.eventSubscribersGetter(),
		);

		return this.eventNameToSubscribersCache;
	}

	private async executeSubscriberForEvent(
		row: DomainEventToConsume,
		tx: TransactionSql,
	): Promise<void> {
		const event = this.eventNameToClass().searchEvent(
			row.eventId,
			row.eventName,
			row.attributes,
			row.occurredAt,
		);

		if (!event) {
			console.error(`\t❌ Unknown event type: ${row.eventName}`);

			return;
		}

		const subscriber = this.eventNameToSubscribers()
			.searchSubscribers(event.eventName)
			.find((s) => s.name() === row.subscriberName);

		if (!subscriber) {
			console.error(`\t❌ Unknown subscriber: ${row.subscriberName}`);

			return;
		}

		console.log(
			`\n📥 Consuming event \`${event.eventName}\` for subscriber \`${subscriber.name()}\``,
		);

		try {
			await subscriber.on(event);
		} catch (error) {
			console.error(
				`\t❌ Error executing subscriber ${subscriber.name()} for ${event.eventName}:`,
				error,
			);
		}

		await tx`
			DELETE FROM public.domain_events_to_consume
			WHERE event_id = ${row.eventId} AND subscriber_name = ${row.subscriberName}
		`;
	}
}
