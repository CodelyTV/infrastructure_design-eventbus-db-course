import { Service } from "diod";
import { JSONValue, Row, TransactionSql } from "postgres";

import { DomainEvent } from "../../domain/event/DomainEvent";
import { EventBus } from "../../domain/event/EventBus";
import { retry } from "../../domain/retry";
import { PostgresConnection } from "../postgres/PostgresConnection";

@Service()
export class PostgresEventBus implements EventBus {
	constructor(private readonly connection: PostgresConnection) {}

	async publish(events: DomainEvent[]): Promise<void> {
		if (events.length === 0) {
			return;
		}

		await retry(async () => await this.publishEvents(events), 3, 30);
	}

	async publishEvents(events: DomainEvent[]): Promise<void> {
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
				${event.occurredOn}
			)
		`;
	}
}
