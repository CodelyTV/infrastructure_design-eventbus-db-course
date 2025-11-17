import {
	DomainEvent,
	DomainEventAttributes,
} from "../../domain/event/DomainEvent";
import { DomainEventClass } from "../../domain/event/DomainEventClass";

interface EventRow {
	id: string;
	name: string;
	attributes: Record<string, unknown>;
	occurred_at: Date;
}

type DomainEventClassWithFactory<T extends DomainEvent = DomainEvent> =
	DomainEventClass<T> & {
		fromPrimitives(
			aggregateId: string,
			eventId: string,
			occurredAt: Date,
			attributes: DomainEventAttributes,
		): T;
	};

export class EventMapper {
	private readonly eventMap: Map<string, DomainEventClassWithFactory>;

	constructor(eventClasses: DomainEventClass[]) {
		this.eventMap = new Map();

		for (const eventClass of eventClasses) {
			this.eventMap.set(
				eventClass.eventName,
				eventClass as DomainEventClassWithFactory,
			);
		}
	}

	fromDatabase(row: EventRow): DomainEvent | null {
		const EventClass = this.eventMap.get(row.name);

		if (!EventClass) {
			return null;
		}

		const aggregateId = row.attributes.id as string;

		return EventClass.fromPrimitives(
			aggregateId,
			row.id,
			row.occurred_at,
			row.attributes,
		);
	}
}
