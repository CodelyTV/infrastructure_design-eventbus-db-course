import { DomainEvent } from "../../domain/event/DomainEvent";
import { DomainEventClass } from "../../domain/event/DomainEventClass";
import { DomainEventSubscriber } from "../../domain/event/DomainEventSubscriber";

type EventName = string;

export class EventMapper {
	private readonly eventMap: Map<EventName, DomainEventClass>;

	constructor(eventClasses: DomainEventClass[]) {
		this.eventMap = new Map();

		for (const eventClass of eventClasses) {
			this.eventMap.set(eventClass.eventName, eventClass);
		}
	}

	static fromSubscribers(
		subscribers: DomainEventSubscriber<DomainEvent>[],
	): EventMapper {
		const eventClasses = subscribers.flatMap((subscriber) =>
			subscriber.subscribedTo(),
		);

		return new EventMapper(eventClasses);
	}

	searchEvent(
		id: string,
		name: string,
		attributes: Record<string, unknown>,
		occurredAt: Date,
	): DomainEvent | null {
		const EventClass = this.eventMap.get(name);

		if (!EventClass) {
			return null;
		}

		return EventClass.fromPrimitives(
			attributes.id as string,
			id,
			occurredAt,
			attributes,
		);
	}
}
