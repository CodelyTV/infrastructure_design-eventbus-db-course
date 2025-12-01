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
import { DomainEventSubscriberNameToClass } from "./DomainEventSubscriberNameToClass";

type DomainEventToConsume = {
	eventId: string;
	eventName: string;
	subscriberName: string;
	attributes: DomainEventAttributes;
	occurredAt: Date;
	retries: number;
};

export class PostgresEventBus implements EventBus {
	private static readonly MAX_RETRIES = 3;

	private eventNameToClassCache?: DomainEventNameToClass;
	private eventNameToSubscribersCache?: DomainEventNameToSubscribers;
	private subscriberNameToClassCache?: DomainEventSubscriberNameToClass;

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
		const subscriberFilter =
			subscribers === "*"
				? tx``
				: tx`AND subscriber_name = ANY(${subscribers})`;

		return tx`
			SELECT
				event_id AS "eventId",
				subscriber_name AS "subscriberName",
				name AS "eventName",
				attributes,
				occurred_at AS "occurredAt",
				retries
			FROM public.domain_events_to_consume
			WHERE is_in_dead_letter = false
			${subscriberFilter}
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

	private subscriberNameToClass(): DomainEventSubscriberNameToClass {
		this.subscriberNameToClassCache ??=
			new DomainEventSubscriberNameToClass(this.eventSubscribersGetter());

		return this.subscriberNameToClassCache;
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

		const subscriber = this.subscriberNameToClass().search(
			row.subscriberName,
		);

		if (!subscriber) {
			console.error(`\t❌ Unknown subscriber: ${row.subscriberName}`);

			return;
		}

		console.log(
			`\n📥 Consuming event \`${event.eventName}\` for subscriber \`${subscriber.name()}\` (retry ${row.retries}/${PostgresEventBus.MAX_RETRIES})`,
		);

		try {
			await subscriber.on(event);

			await tx`
				DELETE FROM public.domain_events_to_consume
				WHERE event_id = ${row.eventId} AND subscriber_name = ${row.subscriberName}
			`;
		} catch (error) {
			console.error(
				`\t❌ Error executing subscriber ${subscriber.name()} for ${event.eventName}:`,
				error,
			);

			if (row.retries >= PostgresEventBus.MAX_RETRIES - 1) {
				console.error(`\t💀 Moving event to dead letter after ${PostgresEventBus.MAX_RETRIES} failed attempts`);

				await tx`
					UPDATE public.domain_events_to_consume
					SET is_in_dead_letter = true
					WHERE event_id = ${row.eventId} AND subscriber_name = ${row.subscriberName}
				`;
			} else {
				await tx`
					UPDATE public.domain_events_to_consume
					SET retries = retries + 1
					WHERE event_id = ${row.eventId} AND subscriber_name = ${row.subscriberName}
				`;
			}
		}
	}
}
