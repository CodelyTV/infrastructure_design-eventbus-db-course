/* eslint-disable no-console */
import { JSONValue, Row, TransactionSql } from "postgres";

import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";
import { EventBus } from "../../domain/event/EventBus";
import { retry } from "../../domain/retry";
import { PostgresConnection } from "../postgres/PostgresConnection";

import { EventMapper } from "./EventMapper";

export class PostgresEventBus implements EventBus {
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
		const subscribers = this.eventSubscribersGetter();
		const subscriptions = this.buildSubscriptions(subscribers);
		const eventMapper = this.buildEventMapper(subscribers);

		await this.connection.sql.begin(async (tx) => {
			const rows = await tx<
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
				console.log("No hay eventos para consumir");

				return;
			}

			console.log(`\n📦 Consumiendo ${rows.length} evento(s)...\n`);

			for (const row of rows) {
				const event = eventMapper.fromDatabase(row);

				if (!event) {
					console.log(
						`⚠️  Evento desconocido: ${row.name} (ID: ${row.id})`,
					);
					continue;
				}

				console.log(
					`📤 Procesando evento \`${event.eventName}\` para:`,
				);

				const eventSubscribers = subscriptions.get(event.eventName);

				if (eventSubscribers && eventSubscribers.length > 0) {
					const executions = eventSubscribers.map((sub) => {
						console.log(`\t→ 💻 ${sub.name}`);

						return sub.subscriber(event);
					});

					try {
						// eslint-disable-next-line no-await-in-loop
						await Promise.all(executions);
					} catch (error) {
						console.error(
							`❌ Error ejecutando subscribers para ${event.eventName}:`,
							error,
						);
						throw error;
					}
				}

				// eslint-disable-next-line no-await-in-loop
				await tx`
					DELETE FROM public.domain_events_to_consume
					WHERE id = ${row.id}
				`;

				console.log(`✅ Evento ${row.id} consumido y eliminado\n`);
			}
		});
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

	private buildEventMapper(
		subscribers: DomainEventSubscriber<DomainEvent>[],
	): EventMapper {
		const eventClasses = subscribers.flatMap((subscriber) =>
			subscriber.subscribedTo(),
		);

		const uniqueEventClasses = Array.from(
			new Map(
				eventClasses.map((eventClass) => [
					eventClass.eventName,
					eventClass,
				]),
			).values(),
		);

		return new EventMapper(uniqueEventClasses);
	}
}
